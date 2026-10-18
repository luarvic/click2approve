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

FROM python:3.13-alpine AS docs
ARG DOCS_SITE_URL=https://click2approve.com/
WORKDIR /app
COPY docs/requirements.txt ./docs/requirements.txt
RUN pip install --no-cache-dir -r docs/requirements.txt
COPY mkdocs.yml ./
COPY docs ./docs
COPY public ./public
COPY --from=build /app/node_modules/@fontsource/sora/files ./node_modules/@fontsource/sora/files
RUN DOCS_SITE_URL="${DOCS_SITE_URL}" mkdocs build --strict

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html/app
COPY --from=docs /app/site /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
