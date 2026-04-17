FROM node:22-alpine AS builder

WORKDIR /app

COPY tsconfig.base.json ./
COPY artifacts/nepalix/package*.json ./artifacts/nepalix/
RUN cd artifacts/nepalix && npm install

COPY artifacts/nepalix/src ./artifacts/nepalix/src
COPY artifacts/nepalix/public ./artifacts/nepalix/public
COPY artifacts/nepalix/index.html ./artifacts/nepalix/
COPY artifacts/nepalix/vite.config.ts ./artifacts/nepalix/
COPY artifacts/nepalix/components.json ./artifacts/nepalix/
COPY attached_assets/ ./attached_assets/

RUN printf '{"extends":"../../tsconfig.base.json","include":["src/**/*"]}' > /app/artifacts/nepalix/tsconfig.json

WORKDIR /app/artifacts/nepalix
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/artifacts/nepalix/dist /usr/share/nginx/html
COPY artifacts/nepalix/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
