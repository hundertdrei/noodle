# Noodle

Anwesenheitsverfassung für regelmäßige Termine

## Lokale Entwicklung

.env.template in .env.local umbenennen und ggf. Variablen anpassen. Ohne Anpassungen kann man sich mit dem Account test@noodlelab.de Passwort noodle123lab! anmelden.

Docker Images bauen und starten:

```
docker-compose build
docker-compose up
```

Die App ist dann unter http://localhost:8080 verfügbar

## Deployment

### Environment

.env.template anpassen und auf dem Server ablegen

### Nginx

Installation von Nginx. Beispielkonfiguration (`/etc/nginx/sites-available/default`)

```
server {
	listen 443 ssl default_server;
	listen [::]:443 ssl default_server;

  ssl_certificate /etc/letsencrypt/live/noodlelab.de/cert.pem;
  ssl_certificate_key /etc/letsencrypt/live/noodlelab.de/privkey.pem;

	server_name noodlelab.de;

	location / {
		proxy_pass http://127.0.0.1:8080/;
	}
}

server {

	listen 443 ssl;
	listen [::]:443 ssl;

  ssl_certificate /etc/letsencrypt/live/noodlelab.de/cert.pem;
  ssl_certificate_key /etc/letsencrypt/live/noodlelab.de/privkey.pem;

	server_name api.noodlelab.de;

	location / {
		proxy_pass http://127.0.0.1:7070/;
	}
}
```

### letsencrypt Zertifikat anfordern

```
apt-get install certbot
certbot certonly --standalone
```

Danach ggf. pfad in nginx.conf für das Zertifikat anpassen

### Netzwerk erstellen
```
docker network create noodle
```

### Datenbank starten

ggf. Pfad zur .env Datei anpassen

```
docker run -d \
  --env-file /home/github/noodle/.env \
  --restart unless-stopped \
  -p 5432:5432 \
  --name postgres \
  --network noodle \
  postgres:13.3
```

ggf. Pfad zur .env Datei anpassen

### Hasura starten

```
docker run -d \
  --env-file /home/github/noodle/.env \
  --restart unless-stopped \
  -p 7070:8080 \
  --name hasura \
  --network noodle \
  hasura/graphql-engine:latest
```

### App bauen und starten

```
docker build -t noodle-app -f release.Dockerfile .
docker run -d \
  --name noodle-app \
  --restart unless-stopped \
  -p 8080:80 \
  noodle-app
```

## Export Metadata from Docker Container

After changing the Hasura schema in the console you need to update it in the project directory

1. Run shell in docker container 
   ```
   docker exec -it noodle-api bash
   ```
2. Create config file
   ```
   echo version: 3 >> config.yaml
   ````
3. Run export command
   ```
   hasura-cli metadata export --endpoint http://localhost:8080
   ```
4. Exit Container and copy metadata
   ```
   docker cp noodle-api:/metadata graphql/
   ```
   
## Use dummy database

1. Dump database

```
docker exec -it postgres bash
pg_dump -U admin -w --data-only -t 'dim*' -t 'fact*' > dump.sql
exit
docker cp postgres:dump.sql .
```

2. Place under `./db/init/z-data.sql`
3. Restart, rebuild containers

```
docker-compose stop
docker-compose rm
docker-compose build
docker-compose up
```
