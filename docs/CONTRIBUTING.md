# Guide de Contribution

## Prérequis

- Node.js 20+
- Docker & Docker Compose
- Git

## Installation pour le développement

```bash
# Cloner le repo
git clone <repo-url>
cd erp-rh

# Installer les dépendances
npm install

# Lancer l'infrastructure
docker compose up -d postgres redis

# Configurer la base
cd apps/backend
cp ../../.env.example ../../.env
npx prisma migrate dev
npx prisma db seed
cd ../..

# Lancer en mode développement
npm run dev
```

## Structure du monorepo

| Dossier | Description |
|---------|-------------|
| `apps/backend` | API Express — Clean Architecture |
| `apps/frontend` | SPA React — Atomic Design |
| `packages/shared-types` | Types TypeScript partagés |
| `packages/utils` | Fonctions utilitaires |
| `packages/ui-components` | Composants UI réutilisables |

## Conventions de code

### Nommage
- **Fichiers** : `kebab-case` (ex: `auth.service.ts`, `employee.controller.ts`)
- **Classes** : `PascalCase` (ex: `AuthService`, `EmployeeController`)
- **Interfaces** : Préfixe `I` pour les ports (ex: `IUserRepository`)
- **Variables/fonctions** : `camelCase`

### Architecture backend

Respecter la séparation des couches :
1. **Domain** : Pas de dépendance externe
2. **Application** : Dépend uniquement du domaine (via interfaces)
3. **Infrastructure** : Implémente les interfaces du domaine
4. **Presentation** : Gère HTTP, délègue aux services

### Frontend

- Utiliser les composants de `@erp-rh/ui-components` en priorité
- Pages dans `src/pages/<module>/`
- Utiliser `react-i18next` pour tous les textes affichés
- Lazy loading pour toutes les pages

### Commits

Format : `type(scope): message`

Types : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Exemples :
```
feat(employees): ajout filtre par département
fix(auth): correction refresh token rotation
docs(api): mise à jour documentation congés
```

## Linting & Formatage

```bash
# Lint
npm run lint

# Format (Prettier)
npx prettier --write .
```

La configuration ESLint et Prettier est partagée à la racine. Husky + lint-staged s'exécutent automatiquement au commit.

## Tests

```bash
npm run test
```

Objectif : > 70% de couverture.

## Pull Requests

1. Créer une branche depuis `develop` : `feature/nom-feature` ou `fix/description`
2. Développer et tester localement
3. Push et ouvrir une PR vers `develop`
4. La CI doit passer (lint + tests + build)
5. Code review par au moins 1 membre de l'équipe
6. Merge après approbation
