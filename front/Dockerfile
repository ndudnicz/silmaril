# docker build --no-cache -t silmaril-front . && docker run -p 4200:80 silmaril-front
FROM node:24-alpine AS build
WORKDIR /app
COPY . /app/
RUN npm install
RUN npm run build:dev

FROM nginx:latest
COPY --from=build /app/dist/front/browser /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80