FROM node:22.14.0-alpine AS builder

WORKDIR /app

COPY package*.json .

RUN npm install --ignore-scripts

COPY . .

RUN npm run build

FROM node:22.14.0-alpine AS production

WORKDIR /app

COPY package*.json .

RUN npm install --omit=dev --ignore-scripts

COPY --from=builder /app/dist ./dist

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
