# Guide de Déploiement

## Prérequis serveur

- Docker 24+ & Docker Compose v2
- 2 Go RAM minimum
- 20 Go d'espace disque
- Ports 80, 443 ouverts

## Déploiement avec Docker Compose

### 1. Préparer l'environnement

```bash
# Copier et configurer les variables
cp .env.example .env
nano .env
```

Variables à configurer impérativement en production :
- `DATABASE_URL` : URL PostgreSQL de production
- `JWT_SECRET` : Clé secrète forte (32+ caractères)
- `JWT_REFRESH_SECRET` : Autre clé secrète forte
- `CORS_ORIGIN` : URL du frontend en production
- `NODE_ENV=production`

### 2. Lancer les services

```bash
docker compose up -d --build
```

### 3. Initialiser la base de données

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

### 4. Vérifier le déploiement

```bash
curl http://localhost:3000/health
# Réponse attendue : {"status":"ok","timestamp":"..."}
```

## Architecture de déploiement

```
                    ┌──────────────┐
                    │   Nginx      │ :80/:443
                    │  (Frontend)  │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │   Backend    │ :3000
                    │  (Express)   │
                    └──┬───────┬───┘
                       │       │
              ┌────────┴┐  ┌──┴────────┐
              │ Postgres │  │   Redis   │
              │  :5432   │  │   :6379   │
              └──────────┘  └───────────┘
```

## SSL / HTTPS

Pour activer HTTPS, modifier le `nginx.conf` du frontend :

```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    # ...
}
```

## Sauvegardes

### Base de données PostgreSQL

```bash
# Sauvegarde
docker compose exec postgres pg_dump -U postgres erp_rh > backup_$(date +%Y%m%d).sql

# Restauration
docker compose exec -T postgres psql -U postgres erp_rh < backup.sql
```

### Fichiers uploadés

Les fichiers sont stockés dans le volume `uploads/`. Sauvegarder ce dossier régulièrement.

## Monitoring

- **Health check** : `GET /health`
- **Logs** : `docker compose logs -f backend`
- Les containers Docker ont des health checks intégrés pour PostgreSQL et Redis

## Mise à jour

```bash
git pull
docker compose up -d --build
docker compose exec backend npx prisma migrate deploy
```
