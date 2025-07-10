
FROM postgres:15-alpine
COPY ./database/init.sql /docker-entrypoint-initdb.d/init.sql
RUN chmod 755 /docker-entrypoint-initdb.d/init.sql