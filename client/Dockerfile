# Development stage — Vite dev server with HMR
FROM node:24.22.1-alpine AS dev

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 4002
CMD ["npm", "run", "dev", "--", "--host"]

# Production stage — build and serve via nginx
FROM node:24.22.1-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Render passes these as build args; read by vite/buildInfoPlugin.ts for window.BI()
ARG RENDER_GIT_COMMIT
ARG RENDER_GIT_BRANCH
RUN npm run build

FROM nginx:alpine AS prod

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

ENV API_URL=http://server:4001

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
