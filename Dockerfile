FROM oven/bun:1 AS build

RUN apt-get update && apt-get install -y openssl --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ./package.json ./bun.lockb* ./pnpm-lock.yaml* /app/
COPY ./prisma /app/prisma

RUN bun install

COPY . ./

ARG OPENAPI_ENDPOINT

ENV OPENAPI_ENDPOINT=$OPENAPI_ENDPOINT

RUN bun run generate:api
RUN bun run build

FROM oven/bun:1-slim AS runner

RUN apt-get update && apt-get install -y openssl --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0

COPY --from=build /root/.cache/prisma /root/.cache/prisma

COPY --from=build /app/.output ./.output
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

COPY ./package.json ./
RUN bun add --ignore-scripts prisma@$(node -p "require('./package.json').dependencies['prisma'] || require('./package.json').devDependencies['prisma']") && rm package.json

COPY docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["bun", ".output/server/index.mjs"]