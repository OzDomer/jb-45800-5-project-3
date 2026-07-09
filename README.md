# Otherworld Vacations

**Vacation packages to the most legendary destinations that (mostly) do not exist.**

Registered users browse vacation cards to Hogwarts, Middle-earth, Bikini Bottom and nine more fictional destinations, and tag the ones they love with a like — live, over sockets. Administrators manage the catalog and track popularity with a report chart and CSV export. An AI travel agent plans day-by-day itineraries, and an MCP-powered assistant answers free-text questions about the data.


---

## Features

| For users | For admins | AI |
|---|---|---|
| Register / login (+ Google sign-in) | Add / edit / delete vacations | Day-by-day itinerary planning, sized to the trip duration |
| Vacation cards with images, dates, prices | Image upload to S3 (localstack) | Free-text questions about the data, answered through an MCP server |
| Like / unlike with **live socket updates** | Likes report chart (per destination) | Graceful degradation — the app runs fully without an API key |
| Singular filters: all / liked / active / upcoming | CSV export (`Destination, Likes`) | |
| Infinite scrolling (9 per page, limit/offset) | | |

## Architecture

```
┌──────────┐     REST + JWT      ┌───────────┐   sequelize   ┌─────────┐
│ frontend │ ──────────────────► │  backend  │ ────────────► │  MySQL  │
│ React 19 │                     │ Express 5 │               │  :3306  │
│  :6124   │◄──── socket.io ─────│   :3000   │──► S3 (localstack :4566)
└──────────┘     (io :3004)      └─────┬─────┘──► OpenAI API
                                       │ ▲
                        MCP tool calls │ │ REST + JWT
                                       ▼ │
                                 ┌───────────┐
                                 │ mcp :3005 │  (Streamable HTTP)
                                 └───────────┘
```

Every box is a docker compose service. TypeScript end to end.

| Piece | Stack |
|---|---|
| Backend | Node.js, Express 5, sequelize-typescript (MySQL), zod, JWT, openai SDK, MCP client |
| Frontend | React 19, Vite, Redux Toolkit, react-hook-form, react-router 7, recharts, socket.io-client |
| MCP server | `@modelcontextprotocol` Streamable HTTP server exposing data tools |
| Realtime | socket.io relay with **rooms** — like updates reach only clients viewing the list |
| Shared lib | [`vacations-socket-enums-ozdomer`](https://www.npmjs.com/package/vacations-socket-enums-ozdomer) — published dual-format (ESM+CJS) npm package consumed by backend and frontend |
| Storage | MySQL (users, vacations, likes), localstack S3 (vacation images) |

## Running with Docker (the whole system)

Prerequisite: Docker Desktop.

```bash
# bash
OTHERWORLD_OPENAI_API_KEY=sk-your-key docker compose up -d --build
```

```powershell
# PowerShell
$env:OTHERWORLD_OPENAI_API_KEY = 'sk-your-key'; docker compose up -d --build
```

Then open **http://localhost:6124**.

> **No OpenAI key?** `docker compose up -d --build` works without it — the entire site runs normally, and only the two AI pages answer with a friendly "AI features are not configured on this server".

The database seeds itself on first startup (12 vacations, 3 users, sample likes), and the backend uploads the vacation images into the localstack S3 bucket automatically.

### Seeded accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@otherworld.com` | `admin1234` |
| User | `user1@otherworld.com` | `user1234` |
| User | `user2@otherworld.com` | `user1234` |

## Running for development

```bash
docker compose up -d database localstack   # infrastructure only
cd backend  && npm install && npm run dev  # :3000
cd io       && npm install && npm run dev  # :3004
cd mcp      && npm install && npm run dev  # :3005
cd frontend && npm install && npm run dev  # :5173
```

For the AI features in dev, either set `OTHERWORLD_OPENAI_API_KEY` in the shell or create a gitignored `backend/config/local.json`:

```json
{ "openai": { "apiKey": "sk-your-key" } }
```

## The MCP architecture — a deliberate choice

The assistant page answers questions like *"how many vacations are active right now?"* or *"what is the average price?"*. The communication runs through a real **MCP server** (`mcp/`, Streamable HTTP, port 3005) — but the **backend acts as the MCP client** and runs the tool loop itself, instead of handing OpenAI a hosted `type: 'mcp'` tool. This was a deliberate architectural decision:

1. **A hosted MCP tool is executed by OpenAI's servers**, which must be able to reach the MCP server's URL. Ours lives inside the compose network (`http://mcp:3005`) — unreachable from OpenAI's cloud. Making the hosted approach work would require publicly exposing the MCP server (reverse proxy / tunnel, plus the security hardening any public endpoint demands) — infrastructure this system does not otherwise need.
2. **The cost is comparable.** The model performs the same reasoning turns either way — a hosted loop bills its internal turns just like our explicit requests do. The real difference is not price but visibility: in the local loop, every request's token usage is ours to measure, log and cap.
3. **Control beats delegation.** The loop is capped (`MAX_TOOL_ROUNDS = 5`) so the LLM can never spin unchecked, and every tool call is logged (`docker logs otherworld-backend-compose` shows `assistant tool call (round 1): otherworld_get_vacations_summary`).
4. **LLMs are bad at arithmetic**, so statistics come from code, not the model: the MCP server exposes an `otherworld_get_vacations_summary` tool with precomputed counts and averages, and the model is instructed to report those numbers as-is. The average price is exact to the cent, every time.

The full auth chain is preserved end to end: frontend → backend → MCP server → backend REST — the user's JWT rides every hop, and the backend remains the single source of truth for auth. Because the JWT identifies the caller, the tools are personal too: `otherworld_list_vacations` with `filter: "liked"` answers *"which vacations did I like?"* for whoever is asking.

The server follows [MCP server best practices](https://modelcontextprotocol.io/docs/concepts/tools): service-prefixed snake_case tool names (`otherworld_list_vacations`) so tools cannot collide with other mounted MCP servers, tool annotations (`readOnlyHint` / `idempotentHint` / `openWorldHint`), offset/limit pagination with `has_more` metadata instead of unbounded dumps, dual response formats (a token-friendly markdown table by default, full JSON on request), and DNS-rebinding protection on the Streamable HTTP endpoint.

## Live likes over socket.io rooms

Like updates are pushed through a socket relay (`io/`) using **rooms**: browsers join a `vacations-watchers` room only while the vacations list is on screen, and the relay emits like/unlike events to room members only — a client sitting on the About page receives nothing. Message names are shared between backend and frontend through the published npm package, exactly once, with no duplication.

## Project structure

```
├── backend/    Express REST API (auth, vacations, likes, reports, AI)
├── frontend/   React SPA (served by nginx in docker)
├── io/         socket.io relay with rooms
├── mcp/        MCP server exposing data tools
├── lib/        source of the published socket-enums npm package
├── database/   MySQL Dockerfile + seed SQL (schema + data export)
└── docker-compose.yaml
```

A Postman collection covering every endpoint is included at `backend/otherworld.postman_collection.json`.
