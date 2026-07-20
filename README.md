# Dynamic Multi-Tenant Form Management & Reporting Platform

A B2B SaaS platform for building dynamic forms once and distributing them across a
tenant hierarchy, with conditional question logic, role-based access control,
OTP verification, and PDF/Excel reporting.

Forms are authored centrally as **Master templates** and **deep-cloned** into each
organization's workspace, so a tenant can customize its own copy without ever
affecting the original.

---

## Table of Contents

- [Features](#features)
- [Tenant Hierarchy & Roles](#tenant-hierarchy--roles)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [The Dynamic Form Engine](#the-dynamic-form-engine)
- [Security](#security)
- [License](#license)

---

## Features

- **Dynamic Form Builder** — compose forms from sections, questions, options, and validation rules. Field types include text, textarea, number, email, phone, date, radio, checkbox, and dropdown.
- **Conditional Logic Engine** — show/hide questions based on other answers (`EQUALS`, `NOT_EQUALS`, `CONTAINS`, `GREATER_THAN`, `LESS_THAN`) with `AND`/`OR` grouping. Sections auto-hide when all their questions are hidden. Hidden required fields are bypassed during submission validation.
- **Master → Clone workflow** — Super Admins create read-only master templates; organizations work on deep-cloned copies.
- **Role-Based Access Control** — scoped access and views across four tiers, enforced on both the API and the SPA router.
- **Multi-tenant isolation** — queries are scoped per role so tenants can't read each other's data.
- **Submissions** — save drafts or submit final answers with server-side validation.
- **Reporting** — generate PDF and Excel reports with filters (date, user, organization, center, form, status).
- **Auth** — JWT access tokens + refresh tokens (HttpOnly cookie), password hashing, and OTP-based password reset over email.
- **Interactive API docs** — Swagger UI served at `/api-docs`.

---

## Tenant Hierarchy & Roles

```
Super Admin  →  Center  →  Organization  →  User
```

| Role | Responsibilities |
| --- | --- |
| **Super Admin** | Global overseer. Creates Centers and Master Forms, publishes forms, manages everything. |
| **Center Admin** | Manages Organizations under their Center. |
| **Organization Admin** | Clones master forms into their workspace, manages the org's users. |
| **User** | Registers, verifies OTP, fills and submits assigned forms, views own reports. |

> Centers and Organizations are logical grouping entities — they have no login credentials. Only provisioned **Users** authenticate.

---

## Tech Stack

**Frontend** (`main/client`)
- Vanilla JavaScript (ES Modules, `.mjs`) — no framework
- [Vite](https://vitejs.dev/) build tooling
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Navigo](https://github.com/krasimir/navigo) SPA router with RBAC guards
- [Axios](https://axios-http.com/) with JWT + silent-refresh interceptors
- [SweetAlert2](https://sweetalert2.github.io/) for dialogs
- Custom Pub/Sub state stores + [morphdom](https://github.com/patrick-steele-idem/morphdom) for efficient re-renders

**Backend** (`main/server`)
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- [JWT](https://github.com/auth0/node-jsonwebtoken) authentication
- [Zod](https://zod.dev/) request & environment validation
- [Helmet](https://helmetjs.github.io/), CORS, and rate limiting
- [Nodemailer](https://nodemailer.com/) for email/OTP
- [ExcelJS](https://github.com/exceljs/exceljs) + [PDFKit](https://pdfkit.org/) for reports
- [Swagger](https://swagger.io/) (`swagger-jsdoc` + `swagger-ui-express`)

---

## Project Structure

```
main/
├── client/                      # Vanilla JS SPA (Vite)
│   └── src/
│       ├── components/          # Reusable UI (modal, table, toast, navbar, sidebar, loader)
│       ├── constants/           # Routes, API endpoints, roles, permissions
│       ├── dynamic-form/        # The form engine
│       │   ├── builder/         # FormBuilder, Section/Question/Option/Rule builders
│       │   ├── renderer/        # FormRenderer (live render + submission)
│       │   ├── rules/           # visibilityEngine, validationEngine
│       │   └── state/           # formStore (Pub/Sub)
│       ├── layouts/             # Role-specific shells (SuperAdmin/Center/Organization/User)
│       ├── modules/             # Feature services (auth, forms, users, centers, orgs, reports…)
│       ├── router/              # Navigo router + route table
│       ├── services/            # http, token, storage
│       └── views/               # Pages grouped by role
│
└── server/                      # Express API
    └── src/
        ├── config/              # env, db, mail, logger
        ├── database/models/     # Mongoose schemas
        ├── middleware/          # auth, role, validation, error, upload
        ├── modules/             # Feature modules (routes → controller → service → repository)
        ├── shared/              # constants, helpers, utils, types
        └── server.mjs           # App entry point
```

Each backend feature module follows a layered pattern: **routes → controller → service → repository → model**.

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- A MongoDB instance (local or hosted, e.g. MongoDB Atlas)

### 1. Clone
```bash
git clone <your-repo-url>
cd "Dynamic Multi-tenant Form"
```

### 2. Backend
```bash
cd main/server
npm install
# create main/server/.env (see Environment Variables below)
npm run dev          # starts on http://localhost:3501
```
API docs will be available at `http://localhost:3501/api-docs`.

### 3. Frontend
```bash
cd main/client
npm install
npm run dev          # starts the Vite dev server
```
Optionally create `main/client/.env` with `VITE_API_URL` if your API is not on the default `http://localhost:3501/api/v1`.

---

## The Dynamic Form Engine

The heart of the platform lives in `main/client/src/dynamic-form/`:

- **Builder** — `FormBuilder` orchestrates `SectionBuilder`, `QuestionBuilder`, `OptionBuilder`, and `RuleBuilder`, all backed by a Pub/Sub `formStore`. State changes trigger a `morphdom` re-render so the editing UI stays fast and preserves input focus.
- **Renderer** — `FormRenderer` produces the live, fillable form. On every input it recomputes visibility and toggles both hidden questions and empty sections.
- **Rules** — `visibilityEngine` decides which questions are shown; `validationEngine` validates answers (and skips hidden required fields). The server mirrors this logic so submissions are validated authoritatively.

Form schema shape (simplified):

```jsonc
{
  "title": "Vehicle Inspection",
  "description": "Standard daily inspection",
  "sections": [
    {
      "id": "sec_1",
      "title": "Vehicle Details",
      "questions": [
        {
"id": "q_1",
          "type": "radio",
          "text": "Do you own a vehicle?",
          "required": true,
          "options": ["Car", "Bike", "None"],
          "validations": [],
          "visibilityRules": []
        }
      ]
    }
  ]
}
```

---

## Security

- Short-lived JWT access tokens with long-lived refresh tokens stored in `HttpOnly` cookies.
- `protect` middleware re-hydrates the user from the database on every request and rejects deactivated/deleted accounts.
- Passwords hashed with bcrypt; OTP-based password reset over email.
- `helmet` security headers, strict CORS allowlist, and per-IP rate limiting.
- Zod validation on every request body/query/params and on environment startup.
- RBAC enforced at the API (role middleware) and in the SPA router (route guards).

---

## License

ISC. See the repository for details.
