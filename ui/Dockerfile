FROM node:24-alpine AS build
ARG ENV=production
WORKDIR /app
COPY nginx ./nginx
COPY public ./public
COPY src ./src
COPY index.html ./
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY vite.config.mts ./
COPY .env.${ENV} ./
RUN npm ci --silent
RUN if [ "${ENV}" = "production" ]; then \
  npm run build; \
  else \
  npm run build-dev; \
  fi

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
