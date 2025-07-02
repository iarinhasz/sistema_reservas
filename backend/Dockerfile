
# Estágio 1: Instala as dependências
FROM node:18-alpine AS dependencies
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm install

# Estágio 2: Cria a imagem final de produção
FROM node:18-alpine AS final
WORKDIR /usr/src/app
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .

# Expõe a porta que sua API vai usar
EXPOSE 3000

# Comando para iniciar o servidor
CMD [ "node", "src/server.js" ]
