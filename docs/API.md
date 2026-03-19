# API REST — Documentation

Base URL : `http://localhost:3000/api/v1`

Toutes les réponses suivent le format :
```json
{
  "success": true,
  "data": { ... }
}
```

En cas d'erreur :
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

## Authentification

### POST `/auth/login`
Connexion d'un utilisateur.

**Body :**
```json
{
  "email": "admin@label-rh.fr",
  "password": "Admin123!"
}
```

**Réponse :** `{ accessToken, refreshToken, user }`

### POST `/auth/register`
Création d'un compte (mot de passe : 8+ chars, 1 majuscule, 1 minuscule, 1 chiffre).

### POST `/auth/refresh-token`
**Body :** `{ "refreshToken": "..." }`

### POST `/auth/change-password` 🔒
**Body :** `{ "currentPassword": "...", "newPassword": "..." }`

### GET `/auth/profile` 🔒

---

## Employés

### GET `/employees` 🔒
**Query params :** `page`, `limit`, `search`, `departmentId`, `status`

### GET `/employees/:id` 🔒
### GET `/employees/me` 🔒
### GET `/employees/org-chart` 🔒
### POST `/employees` 🔒 (SUPER_ADMIN, HR_MANAGER)
### PUT `/employees/:id` 🔒 (SUPER_ADMIN, HR_MANAGER)
### DELETE `/employees/:id` 🔒 (SUPER_ADMIN)

---

## Congés

### GET `/leaves` 🔒
### GET `/leaves/:id` 🔒
### GET `/leaves/calendar` 🔒
### POST `/leaves` 🔒
### PUT `/leaves/:id/review` 🔒 (SUPER_ADMIN, HR_MANAGER, MANAGER)
**Body :** `{ "status": "APPROVED" | "REJECTED", "reviewComment": "..." }`

### GET `/leaves/balances/:employeeId` 🔒

---

## Paie

### GET `/payroll` 🔒
### GET `/payroll/:id` 🔒
### POST `/payroll` 🔒 (SUPER_ADMIN, HR_MANAGER)
### PUT `/payroll/:id/validate` 🔒 (SUPER_ADMIN, HR_MANAGER)
### POST `/payroll/bulk` 🔒 (SUPER_ADMIN, HR_MANAGER)

---

## Recrutement

### GET `/recruitment/offers` 🔒 (SUPER_ADMIN, HR_MANAGER, MANAGER)
### GET `/recruitment/offers/:id` 🔒
### POST `/recruitment/offers` 🔒
### PUT `/recruitment/offers/:id/publish` 🔒
### PUT `/recruitment/offers/:id/close` 🔒
### GET `/recruitment/offers/:offerId/candidates` 🔒
### POST `/recruitment/candidates` 🔒
### PUT `/recruitment/candidates/:id/stage` 🔒
### GET `/recruitment/pipeline/stats` 🔒

---

## Performance

### GET `/performance/evaluations` 🔒
### POST `/performance/evaluations` 🔒 (SUPER_ADMIN, HR_MANAGER, MANAGER)
### PUT `/performance/evaluations/:id/complete` 🔒
### POST `/performance/objectives` 🔒
### PUT `/performance/objectives/:id` 🔒

---

## Formation

### GET `/trainings` 🔒
### POST `/trainings` 🔒 (SUPER_ADMIN, HR_MANAGER)
### PUT `/trainings/:id` 🔒 (SUPER_ADMIN, HR_MANAGER)
### POST `/trainings/:id/enroll` 🔒
### PUT `/trainings/enrollments/:enrollmentId/complete` 🔒

---

## Documents

### GET `/documents` 🔒
### GET `/documents/:id` 🔒
### POST `/documents` 🔒 (multipart/form-data)
### DELETE `/documents/:id` 🔒

---

## Pointage

### GET `/time-tracking` 🔒
### POST `/time-tracking/clock-in` 🔒
### PUT `/time-tracking/:id/clock-out` 🔒
### GET `/time-tracking/summary/:employeeId` 🔒

---

## Rapports

### GET `/reports/dashboard` 🔒 (SUPER_ADMIN, HR_MANAGER)
### GET `/reports/departments` 🔒
### GET `/reports/turnover?year=2024` 🔒
### GET `/reports/absenteeism?year=2024` 🔒
### GET `/reports/payroll-summary?month=1&year=2024` 🔒
### GET `/reports/age-pyramid` 🔒

---

🔒 = Requiert un header `Authorization: Bearer <token>`
