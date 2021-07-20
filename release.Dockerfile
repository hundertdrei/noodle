FROM node:14.10.0-alpine3.10 as build-stage
WORKDIR /app

ENV VUE_APP_API_URL=https://api.noodlelab.de/v1/graphql
ENV VUE_APP_AUTH0_DOMAIN=hundertdrei.eu.auth0.com
ENV VUE_APP_AUTH0_CLIENT_ID=1DVjBJX26E9v6NxamxtcSqZhCXCqL7n2
ENV VUE_APP_AUTH0_REDIRECT_URL=https://www.noodlelab.de/callback
ENV VUE_APP_AUTH0_RETURN_URL=https://www.noodlelab.de

COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf