# 1. Базовый образ
FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 2. Установка зависимостей
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/
COPY web/package.json ./web/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/version-info/package.json ./packages/version-info/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# 3. Сборка API
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm deploy --filter=@imput/cobalt-api --prod /prod/api

# 4. Финальный образ
FROM base AS final
WORKDIR /app
COPY --from=build --chown=node:node /prod/api /app
COPY --from=build --chown=node:node /app/.git /app/.git
USER node
EXPOSE 9000
CMD [ "node", "src/cobalt.js" ]
