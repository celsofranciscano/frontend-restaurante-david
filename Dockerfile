FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Variables that Vite will inject at build time
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build the Vite application
RUN pnpm run build

# Stage 2: Serve with Node.js
FROM node:22-alpine

WORKDIR /usr/src/app

RUN npm install -g serve

# Copiar estáticos optimizados
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 80

# Usamos 'serve' apuntando al puerto 80 con soporte nativo para SPA (-s)
CMD ["serve", "-s", "dist", "-p", "80"]
