# ERP RH - Gestion des Ressources Humaines

Plateforme complète de gestion des ressources humaines pour PME/ETI françaises.

## Architecture

- **Monorepo** géré par [Turborepo](https://turbo.build/)
- **Backend** : Node.js / Express / TypeScript — Clean Architecture (Hexagonal)
- **Frontend** : React 18 / TypeScript / Vite — Atomic Design
- **Base de données** : PostgreSQL 16 + Prisma ORM
- **Cache** : Redis 7

## Modules

| Module | Endpoint | Description |
|--------|----------|-------------|
| Authentification | `/api/v1/auth` | Login, register, refresh token, 2FA |
| Employés | `/api/v1/employees` | CRUD, organigramme |
| Congés | `/api/v1/leaves` | Demandes, soldes, calendrier |
| Paie | `/api/v1/payroll` | Bulletins, cotisations françaises |
| Recrutement | `/api/v1/recruitment` | Offres, candidats, pipeline |
| Performance | `/api/v1/performance` | Évaluations, objectifs |
| Formation | `/api/v1/trainings` | Catalogue, inscriptions |
| Documents | `/api/v1/documents` | GED, upload/download |
| Pointage | `/api/v1/time-tracking` | Clock in/out, heures sup. |
| Rapports | `/api/v1/reports` | Dashboard, analytiques |

## Structure du projet

```
├── apps/
│   ├── backend/          # API Express (Clean Architecture)
│   │   ├── prisma/       # Schéma & migrations
│   │   └── src/
│   │       ├── domain/         # Entités & ports (interfaces)
│   │       ├── application/    # Services & DTOs (Zod)
│   │       ├── infrastructure/ # Adapters (Prisma, middleware)
│   │       └── presentation/   # Controllers & routes
│   └── frontend/         # React SPA (Atomic Design)
│       └── src/
│           ├── i18n/           # Internationalisation fr/en
│           ├── layouts/        # Layouts (Main, Auth)
│           ├── pages/          # Pages par module
│           ├── stores/         # Zustand stores
│           └── lib/            # API client Axios
├── packages/
│   ├── shared-types/     # Types, DTOs, enums partagés
│   ├── utils/            # Utilitaires communs
│   └── ui-components/    # Composants UI (Atomic Design)
└── .github/workflows/    # CI/CD
```

## Prérequis

- Node.js 20+
- Docker & Docker Compose
- npm 10+

## Démarrage rapide

```bash
# 1. Copier les variables d'environnement
cp .env.example .env

# 2. Démarrer PostgreSQL + Redis
docker compose up -d

# 3. Installer les dépendances
npm install

# 4. Initialiser la base de données
cd apps/backend
npx prisma migrate dev
npx prisma db seed
cd ../..

# 5. Lancer le développement
npm run dev
```

Le backend sera disponible sur `http://localhost:3000/api/v1` et le frontend sur `http://localhost:5173`.

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre tous les packages en mode développement |
| `npm run build` | Build de production |
| `npm run lint` | Lint de tous les packages |
| `npm run test` | Exécute les tests |

## Accès par défaut

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@label-rh.fr | Admin123! | SUPER_ADMIN |
| rh@label-rh.fr | Rh123456! | HR_MANAGER |
| manager@label-rh.fr | Manager1! | MANAGER |
| employe@label-rh.fr | Employe1! | EMPLOYEE |

## Documentation

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Architecture technique détaillée
- [API.md](./docs/API.md) — Documentation de l'API REST
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) — Guide de déploiement
- [USER_GUIDE.md](./docs/USER_GUIDE.md) — Guide utilisateur
- [CONTRIBUTING.md](./docs/CONTRIBUTING.md) — Guide de contribution

## Licence

Propriétaire — LABEL SAS © 2024
