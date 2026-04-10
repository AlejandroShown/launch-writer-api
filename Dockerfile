FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY dist/ ./dist/
COPY src/prompts/ ./src/prompts/

EXPOSE 3001

CMD ["node", "dist/index.js"]
