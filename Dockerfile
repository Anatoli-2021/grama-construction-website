# Website only: no OS source, private data, .env or Git history enters the image.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src ./src
COPY public ./public
COPY presentation ./presentation
COPY scripts/build-pages.mjs ./scripts/build-pages.mjs
RUN npm run build

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node scripts/serve-website.mjs ./scripts/serve-website.mjs
COPY --chown=node:node scripts/contact-delivery.mjs ./scripts/contact-delivery.mjs
COPY --chown=node:node scripts/presentation-access.mjs ./scripts/presentation-access.mjs
USER node
EXPOSE 8080
CMD ["node", "scripts/serve-website.mjs", "--hosted"]
