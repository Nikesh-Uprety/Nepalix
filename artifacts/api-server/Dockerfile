FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# Copy workspace config and lockfile
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./

# Copy lib packages that api-server depends on
COPY lib/db ./lib/db
COPY lib/api-zod ./lib/api-zod

# Copy api-server
COPY artifacts/api-server ./artifacts/api-server

# Install all workspace deps needed for the build
RUN pnpm install --no-frozen-lockfile --filter @workspace/api-server...

# Build api-server (esbuild bundles everything into dist/index.mjs)
RUN pnpm --filter @workspace/api-server run build

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 10000
WORKDIR /app
CMD ["node", "--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]
