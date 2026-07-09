import type { NextFunction, Request, Response } from "express";
import openai from "../../openai/openai";
import Vacation from "../../models/Vacation";
import { displayVacationDays } from "./days";

export async function generateItinerary(request: Request<object, object, { vacationId: string }>, response: Response, next: NextFunction) {
    try {
        const { vacationId } = request.body

        const vacation = await Vacation.findByPk(vacationId)

        if (!vacation) return next({
            status: 404,
            message: 'vacation does not exist'
        })

        const { destination, description, startDate, endDate } = vacation
        const days = displayVacationDays(startDate, endDate)

        const systemPrompt = `
You are an expert travel agent.
You will receive a vacation destination, its dates and a short description.
Plan a day-by-day itinerary for the whole trip - exactly ${days} days.

Rules:
- Output exactly ${days} day sections, each starting with a heading line "Day N: <short title>"
- Under each day write 2-4 short activity lines
- Fictional destinations are a feature: lean into the lore and keep it fun, but stay practical in tone
- Return plain text only, no markdown symbols like # or *
`.trim()

        const userContent = `Destination: ${destination}
Dates: ${startDate} to ${endDate} (${days} days)
Description: ${description}`

        const llmResponse = await openai.responses.create({
            model: "gpt-4.1-mini",
            input: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent }
            ]
        })

        const itinerary = llmResponse.output_text?.trim()

        if (!itinerary) {
            return next({
                status: 500,
                message: 'could not generate an itinerary, please try again'
            })
        }

        response.json({
            destination,
            days,
            itinerary
        })
    } catch (e) {
        next(e)
    }
}