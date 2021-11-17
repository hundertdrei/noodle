# Noodle

Anwesenheitsverfassung für regelmäßige Termine

## Lokale Entwicklung

.env.template in .env.local umbenennen und ggf. Variablen anpassen. Ohne Anpassungen kann man sich mit dem Account test@noodlelab.de Passwort noodle123lab! anmelden.

Docker Images bauen und starten:

```
docker-compose build
docker-compose up
```

### Hasura-Einstellungen

* Einmalig muss man alle Tabellen und Abhängigkeiten in Hasura tracken. Dazu öffnen man die Hasura Console unter http://localhost:7070 und führ im "Data" Reiter folgende Schritte aus;#
  1. Neben "Untracked tables or views" auf "Track all" klicken
  2. Neben "Untracked foreign-key relationships" auf "Track all" klicken

* Metadata aus `hasura_metadata.json` importieren, über Zahnrad-Icon rechts oben.

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

### Auth0

Admins müssen in "user_metadata" die Flag "is_admin": true gesetzt haben:

```
{
  "is_admin": true
}
```

Über folgende Regel (Auth Pipelines Rules), wird die Information der App und Hasura übergeben:

```
function (user, context, callback) {
  const namespace = "https://hasura.io/jwt/claims";
  let role = user.user_metadata.is_admin ? 'admin' : 'anonymous';

  context.idToken["https://noodlelab.de"] = 
    {
      is_admin: user.user_metadata.is_admin ? true : false
    };

  context.idToken[namespace] = 
    { 
      'x-hasura-default-role': role,
      // do some custom logic to decide allowed roles
      'x-hasura-allowed-roles': [role],
      'x-hasura-user-id': user.user_id
    };
  callback(null, user, context);
}
```