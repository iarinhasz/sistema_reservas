# Estágio 1: Instala as dependências de forma otimizada
FROM node:18-alpine AS dependencies
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# Estágio 2: Cria a imagem final de produção
FROM node:18-alpine AS final
WORKDIR /usr/src/app

# Copia as dependências já instaladas do estágio anterior
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
# Copia o código-fonte da sua aplicação
COPY . .

# Expõe a porta que sua API vai usar para receber conexões
EXPOSE 3000

# Comando padrão para iniciar o servidor
CMD [ "node", "server.js" ] # Troque "server.js" pelo nome do seu arquivo de entrada