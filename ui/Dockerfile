FROM node:20.2.0-alpine as build
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
COPY .env.${ENV} ./
RUN npm install --silent
RUN npm install react-scripts@5.0.1 -g --silent
RUN if [ "${ENV}" = "production" ]; then \
  npm run build; \
  else \
  npm run dev; \
  fi

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
