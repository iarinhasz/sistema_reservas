# postgres/Dockerfile

FROM postgres:15-alpine

# Copia o script para a pasta de inicialização
COPY ./database/init.sql /docker-entrypoint-initdb.d/

# PASSO NOVO E CRÍTICO:
# Força as permissões do script para que ele seja legível e executável
# por qualquer usuário dentro do contêiner.
RUN chmod 755 /docker-entrypoint-initdb.d/init.sql