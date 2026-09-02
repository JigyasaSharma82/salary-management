# Salary Management System

A web-based salary management system designed to replace spreadsheet-based processes for managing employee salary data. This system provides HR managers with clear insights into how the organization pays its people across multiple countries.

## Overview

The Salary Management System enables HR teams to:
- Maintain employee and salary records for approximately 10,000 employees across multiple countries
- View, search, and filter employee salary data efficiently
- Add, update, and review salary information through an intuitive web interface
- Generate salary insights and comparisons by organizational and geographic groupings
- Preserve salary history and audit trails

## Key Features

- **Employee Management**: Create, update, and manage employee records with stable UUIDs and unique identifiers
- **Multi-Currency Support**: Manage salaries across different countries with proper currency handling
- **Salary History Tracking**: Automatic audit trail of salary changes
- **Advanced Filtering**: Filter employees by country, department, currency, and status
- **Search Capabilities**: Search across employee codes, names, and email addresses
- **Dashboard Insights**: View salary analytics and summaries by organizational groups
- **Responsive Design**: Optimized for large datasets (10,000+ employees)
- **Pagination Support**: Efficient data loading with paginated API endpoints

## Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS

### Backend
- **Framework**: Node.js with Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: Zod
- **Testing**: Vitest
- **Security**: Helmet, CORS

## Project Structure

```
salary-management/
├── frontend/                    # React.js and TypeScript application
│   ├── src/
│   │   ├── components/          # Shared, reusable UI components
│   │   ├── features/            # Feature-specific UI and state
│   │   │   ├── dashboard/
│   │   │   └── employees/
│   │   ├── pages/               # Route-level screens
│   │   ├── services/            # Frontend API client
│   │   └── types/               # TypeScript types
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                     # Node.js and Express.js application
│   ├── src/
│   │   ├── config/              # Application configuration
│   │   ├── lib/                 # Shared utilities and services
│   │   ├── middleware/          # Express middleware
│   │   ├── modules/             # Feature modules
│   │   │   ├── dashboard/
│   │   │   └── employees/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/                  # Database schema and migrations
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── tests/                   # Backend test files
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                        # Documentation
│   ├── requirements.md          # Product requirements
│   ├── architecture.md          # Technical architecture
│   └── prompt-log.md            # Development notes
│
└── render.yaml                  # Deployment configuration
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "salary management"
```

### 2. Install Dependencies

#### Backend Setup
```bash
cd backend
npm install
```

#### Frontend Setup
```bash
cd frontend
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/salary_management"
PORT=3000
NODE_ENV=development
```

### 4. Initialize the Database

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

This will:
- Run Prisma migrations to create the database schema
- Seed the database with 10,000 sample employees across 5 countries and multiple departments

## Running the Application

### Development Mode

#### Backend
```bash
cd backend
npm run dev
```
The API will be available at `http://localhost:3000`

#### Frontend
```bash
cd frontend
npm run dev
```
The application will be available at `http://localhost:5173`

### Production Build

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Available Commands

### Backend Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend in development mode with auto-reload |
| `npm run build` | Build backend for production |
| `npm start` | Start backend in production mode |
| `npm test` | Run backend test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run pending database migrations |
| `npm run prisma:seed` | Seed database with sample data |

### Frontend Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build locally |

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Endpoints

#### Employees
- `GET /employees` - List all employees (paginated, filterable, sortable)
- `GET /employees/:id` - Get employee details
- `POST /employees` - Create a new employee
- `PUT /employees/:id` - Update employee profile
- `PUT /employees/:id/salary` - Update employee salary
- `DELETE /employees/:id` - Deactivate employee

#### Dashboard
- `GET /dashboard/summary` - Get salary summary and insights
- `GET /dashboard/salary-insights` - Get detailed salary analytics

### Query Parameters

- **Pagination**: `page`, `limit`
- **Filtering**: `country`, `department`, `currency`, `status`
- **Search**: `search`
- **Sorting**: `sortBy`, `sortOrder`

## Database Schema

The system uses Prisma ORM with PostgreSQL. Key entities:

- **Employee**: Core employee records with UUID and unique employee code
- **SalaryHistory**: Audit trail of salary changes with timestamp

For detailed schema, see [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

## Architecture Decisions

### Employee Management
- Employees use stable UUIDs with unique employee codes and emails
- Employees are deactivated rather than deleted to preserve salary history
- Salaries stored as `Decimal(12,2)` for precision
- Three-letter currency codes for international support
- All salary updates create history entries

### Dashboard & Analytics
- Salary averages grouped by currency (no misleading cross-currency averages)
- Frontend requests one page of data at a time
- Filters, sorting, and pagination update API queries dynamically
- Prevents loading full 10,000-record dataset in browser

### Performance Optimization
- Employee table displays 30 records per page
- Sticky table headers for context during scrolling
- Reservable vertical viewport (minimum 8 rows)
- Fixed dashboard shell with scrollable employee table

## Deployment

The application is configured for deployment on Render.com. See [render.yaml](render.yaml) for deployment configuration.

### Deployment Requirements
- PostgreSQL database URL must be provided as `DATABASE_URL` environment variable
- Runtime PORT must be configured
- Backend root directory: `backend` with `package.json` and `package-lock.json`
- Build command: `npm ci && npm run build`
- Start command: `npm start`

## Testing

### Backend Tests
```bash
cd backend
npm test              # Run tests once
npm run test:watch   # Run tests in watch mode
```

Tests use Vitest and Supertest for API endpoint testing.

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env` file
- Ensure database user has proper permissions

### Migration Failures
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### Seed Script Issues
- Ensure database is created before seeding
- Check that migrations have completed successfully
- Reset database and re-seed if needed

## Contributing

Follow the existing code structure and patterns:
- Use TypeScript for type safety
- Keep components and features organized by module
- Add tests for new features
- Update documentation for significant changes

## Documentation

- [Requirements](docs/requirements.md) - Product scope and success criteria
- [Architecture](docs/architecture.md) - Technical design decisions
- [Prompt Log](docs/prompt-log.md) - Development session notes

## License

[Add your license information here]

## Support

For issues or questions, please refer to the project documentation or contact the development team.
