# noodle-vue

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## letsencrypt

```
apt-get install certbot
certbot certonly --standalone
```

## postgres

```
docker run -d \
  --env-file /home/github/noodle/.env \
  --restart unless-stopped \
  -p 5432:5432 \
  --name postgres \
  postgres:13.3
```

## hasura
```
docker run -d \
  --env-file /home/github/noodle/.env \
  --restart unless-stopped \
  -p 8080:7070 \
  --name hasura \
  hasura/graphql-engine:latest
```