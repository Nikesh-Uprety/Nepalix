FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY dist ./dist
EXPOSE 10000
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
