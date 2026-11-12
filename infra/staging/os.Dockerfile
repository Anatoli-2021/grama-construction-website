# Private OS auth candidate only. No website, Studio snapshot or company data.
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV OS_BIND_HOST=0.0.0.0
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --chown=node:node apps/development-os/hosted ./apps/development-os/hosted
USER node
EXPOSE 8080
CMD ["node", "apps/development-os/hosted/server.mjs"]
