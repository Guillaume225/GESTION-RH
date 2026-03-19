# Architecture Technique

## Vue d'ensemble

Le projet ERP RH adopte une architecture **monorepo** gérée par **Turborepo**, avec une séparation claire entre le backend, le frontend et les packages partagés.

## Backend — Clean Architecture (Hexagonal)

Le backend suit les principes de la **Clean Architecture** / **Architecture Hexagonale** pour garantir une séparation des responsabilités et une testabilité optimale.

### Couches

```
Présentation → Application → Domaine ← Infrastructure
```

#### 1. Domaine (`src/domain/`)
- **Entités** : Objets métier purs (User, Employee, LeaveRequest, etc.)
- **Ports** : Interfaces des repositories (IUserRepository, IEmployeeRepository, etc.)
- Aucune dépendance externe — c'est le cœur du système.

#### 2. Application (`src/application/`)
- **Services** : Logique métier orchestrant les entités et repositories (AuthService, EmployeeService, etc.)
- **DTOs** : Schémas de validation Zod pour les entrées/sorties
- Dépend uniquement du domaine (via les interfaces).

#### 3. Infrastructure (`src/infrastructure/`)
- **Adapters** : Implémentations concrètes des ports (PrismaUserRepository, PrismaEmployeeRepository, etc.)
- **Middleware** : Auth JWT, validation, rate limiting, gestion d'erreurs
- **Config** : Variables d'environnement centralisées
- **Database** : Client Prisma singleton

#### 4. Présentation (`src/presentation/`)
- **Controllers** : Gèrent les requêtes HTTP, délèguent aux services
- **Routes** : Définissent les endpoints Express avec middleware

### Injection de dépendances

La composition se fait dans `app.ts` (composition root) :
1. Instanciation des repositories (adapters)
2. Instanciation des services avec injection des repositories
3. Instanciation des controllers avec injection des services
4. Montage des routes avec les controllers

### Versioning API

Toutes les routes sont montées sous `/api/v1/` pour permettre une évolution non-breaking.

## Frontend — Atomic Design

### Structure

Les composants UI suivent la méthodologie **Atomic Design** dans le package `@erp-rh/ui-components` :

- **Atoms** : Button, Input, Label, Badge
- **Molecules** : Card, Dialog, Tabs
- **Organisms** : Table

### State Management

- **Zustand** pour le state global (authentification)
- **React Hook Form + Zod** pour les formulaires
- **Axios** avec intercepteurs pour les appels API (auto-refresh token)

### Routing

- **React Router v6** avec lazy loading pour le code-splitting
- Guards `RequireAuth` et `RequireGuest` pour la protection des routes

### Internationalisation

- **i18next + react-i18next** avec détection automatique de la langue
- Traductions Français (par défaut) et Anglais

## Packages partagés

| Package | Contenu |
|---------|---------|
| `@erp-rh/shared-types` | Enums, DTOs, interfaces TypeScript |
| `@erp-rh/utils` | Fonctions utilitaires (formatDate, formatCurrency, etc.) |
| `@erp-rh/ui-components` | Composants React réutilisables (Atomic Design) |

## Sécurité

- **JWT** : Access token (15min) + Refresh token rotation (7j)
- **bcrypt** : Hachage des mots de passe
- **Helmet** : Headers HTTP sécurisés
- **Rate Limiting** : Protection contre les attaques par force brute
- **CORS** : Configuration restrictive
- **Zod** : Validation de toutes les entrées
- **RBAC** : Rôles et permissions séparés en base

## Base de données

- **PostgreSQL 16** avec Prisma ORM
- Tables `roles` et `permissions` séparées pour le RBAC
- Table `notifications` pour le temps réel
- Soft delete pour les employés
- Index optimisés sur les champs fréquemment requêtés
