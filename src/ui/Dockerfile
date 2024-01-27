FROM node:20.2.0-alpine as build
WORKDIR /app
COPY nginx ./nginx
COPY public ./public
COPY src ./src
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
RUN npm install --silent
RUN npm install react-scripts@5.0.1 -g --silent
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
