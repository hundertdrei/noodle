FROM node:14.10.0-alpine3.10 as build-stage
WORKDIR /app
ENV VUE_APP_API_URL=https://api.noodlelab.de/v1/graphql
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app