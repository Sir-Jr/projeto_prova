# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./

# Instalar dependências
RUN npm install --production

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Instalar ferramentas de debugging (curl, ping, etc)
RUN apk add --no-cache curl iputils

# Copiar node_modules do builder
COPY --from=builder /app/node_modules ./node_modules

# Copiar código da aplicação
COPY app.js .
COPY package*.json ./

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD curl -f http://localhost:3000/ || exit 1

# Comando de inicialização
CMD ["node", "app.js"]
