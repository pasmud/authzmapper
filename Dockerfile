FROM node:20-alpine
WORKDIR /app
RUN addgroup --system --gid 1001 authzmapper && \
    adduser --system --uid 1001 authzmapper
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN mkdir -p /app/data && chown authzmapper:authzmapper /app/data
USER authzmapper
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/authzmapper.db"
ENV BACKEND_PORT=3001
EXPOSE 3001
CMD ["npx", "tsx", "server/src/index.ts"]
