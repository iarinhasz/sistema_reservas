# Estágio 1: Construção (Build)
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio 2: Servidor de Produção (Serve)
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Copia a configuração do Nginx para lidar com as rotas do React Router
# COPY nginx.conf /etc/nginx/conf.d/default.conf 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]