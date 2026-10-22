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
ARG GOOGLE_ANALYTICS_ID=
RUN if [ "${ENV}" = "production" ]; then \
  GOOGLE_ANALYTICS_ID="${GOOGLE_ANALYTICS_ID}" npm run build; \
  else \
  GOOGLE_ANALYTICS_ID="${GOOGLE_ANALYTICS_ID}" npm run build-dev; \
  fi

FROM python:3.13-alpine AS docs
ARG DOCS_SITE_URL=https://click2approve.com/
ARG DOCS_API_BASE_URI=
WORKDIR /app
COPY docs/requirements.txt ./docs/requirements.txt
RUN pip install --no-cache-dir -r docs/requirements.txt
COPY mkdocs.yml ./
COPY docs ./docs
COPY public ./public
COPY --from=build /app/node_modules/@fontsource/sora/files ./node_modules/@fontsource/sora/files
ARG GOOGLE_ANALYTICS_ID=
RUN DOCS_SITE_URL="${DOCS_SITE_URL}" DOCS_API_BASE_URI="${DOCS_API_BASE_URI}" GOOGLE_ANALYTICS_ID="${GOOGLE_ANALYTICS_ID}" mkdocs build --strict

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html/app
COPY --from=docs /app/site /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
