FROM mysql:latest

# the mysql image runs every .sql file in this folder on first startup
# (only when the data directory is empty)
COPY ./otherworld.sql /docker-entrypoint-initdb.d/
