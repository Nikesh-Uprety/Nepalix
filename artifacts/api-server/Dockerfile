FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

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
WORKDIR /app/artifacts/api-server

COPY --from=builder /app/artifacts/api-server/dist ./dist

EXPOSE 10000
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
