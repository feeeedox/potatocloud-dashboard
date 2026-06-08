FROM node:22-slim AS build

RUN apt-get update && apt-get install -y openssl --no-install-recommends && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_INTEGRITY_KEYS=0

RUN corepack enable

WORKDIR /app

COPY ./package.json /app/
COPY ./pnpm-lock.yaml /app/
COPY ./prisma /app/prisma

RUN pnpm install --shamefully-hoist --no-frozen-lockfile --force

COPY . ./

RUN pnpm run build

FROM node:22-slim AS runner

RUN apt-get update && apt-get install -y openssl --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/prisma.config.ts ./prisma.config.ts

ENV NODE_ENV=production
ENV HOST=0.0.0.0

COPY package.json ./
RUN npm install --ignore-scripts --legacy-peer-deps \
    "prisma@$(node -p "require('./package.json').dependencies['prisma'] || require('./package.json').devDependencies['prisma']")" \
    && npm cache clean --force \
    && rm package.json

COPY --from=build /app/.output ./.output

COPY --from=build /app/prisma ./prisma

COPY docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", ".output/server/index.mjs"]