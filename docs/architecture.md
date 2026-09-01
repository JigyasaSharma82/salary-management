# Proposed Architecture

## Folder structure

```text
salary-management/
├── frontend/                         # React.js and TypeScript application
│   └── src/
│       ├── components/               # Shared, reusable UI components
│       ├── features/                 # Feature-specific UI and state
│       ├── pages/                    # Route-level screens
│       ├── services/                 # Frontend API client and external services
│       └── types/                    # Shared frontend TypeScript types
├── backend/                          # Node.js, Express.js, and TypeScript application
│   ├── prisma/                       # Prisma schema and database migrations
│   ├── src/
│   │   ├── config/                   # Application configuration
│   │   ├── lib/                      # Shared backend utilities and service clients
│   │   ├── middleware/               # Express middleware
│   │   ├── modules/                  # Feature modules, including their routes and logic
│   │   └── types/                    # Shared backend TypeScript types
│   └── tests/                        # Backend tests
└── docs/                             # Product and technical decision records
    ├── requirements.md
    ├── architecture.md
    └── prompt-log.md
```

## Organisation overview

- **Frontend:** The React application is separated into reusable components, route-level pages, feature-focused code, API-facing services, and TypeScript types. This keeps user-interface concerns clear while allowing salary-management features to grow independently.
- **Backend:** The Express application groups business capabilities in `src/modules`; shared configuration, middleware, utilities, and types stay outside those modules. Prisma owns the PostgreSQL schema and migrations in `backend/prisma`.
- **Database:** PostgreSQL is the system of record for employee and salary data. Database modelling and migrations will be managed through Prisma when implementation begins.
- **Documentation:** `docs/requirements.md` records the product scope. This file records the proposed structure and will be updated whenever an important architectural or design decision is made. `docs/prompt-log.md` records the substantive user prompts from this development session in chronological order.

## Employee Management decisions

- Employee records use a stable UUID and unique employee code and email. An employee is deactivated rather than permanently deleted so salary records are retained.
- Salaries are stored as `Decimal(12,2)` with a three-letter currency code. Each creation and salary update creates a salary-history record, preserving an audit trail without adding a broader payroll feature.
- The Employee Management API is versioned under `/api/v1/employees`. Listing supports paginated, searchable, filterable, and sortable results; a dedicated salary endpoint prevents salary changes from being mixed with ordinary profile edits.
- The deterministic `prisma/seed.ts` script creates 10,000 idempotent sample employees across five countries and departments in batches of 1,000. It also creates each employee's initial salary-history entry and never deletes existing records.

Employee Management is the only implemented product feature at this stage.
