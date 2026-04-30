# docker build --no-cache -t silmaril-front . && docker run -p 4200:80 silmaril-front
FROM node:latest AS build
WORKDIR /app
COPY . /app/
RUN npm install -g pnpm
RUN CI=true pnpm i
RUN pnpm run build:dev

FROM nginx:latest
COPY --from=build /app/dist/front/browser /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
