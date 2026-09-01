# Session Prompt Log

This document records the substantive user prompts for the current development session. New prompts will be appended in chronological order.

## 2026-09-01

### Requirements document

> I want to build this Salary Management System assessment.
>
> The project is for an HR Manager who currently manages salary data for around 10,000 employees across multiple countries using Excel. We need to build a web application where the HR Manager can manage employee/salary data and get useful salary insights.
>
> For now, don't build any application or code.
>
> First, create a concise one-page requirements document for this project in:
>
> `docs/requirements.md`
>
> The document should cover:
>
> - Project goal
> - Target user
> - Main features/scope
> - What we are intentionally keeping out of scope, with a brief reason
> - Important product requirements
> - Success criteria
>
> Keep it concise and professional, as the assessment specifically asks for a one-page requirements document.
>
> Use the attached assessment as the source of truth and don't add unnecessary features or technical implementation details.
>
> Only create the requirements document for now. Do not start architecture or development yet.

### Initial project structure

> The requirements document is done.
>
> Now create the initial project folder structure for the application based on the requirements and our chosen stack:
>
> React.js + Node.js + Express.js + PostgreSQL + Prisma + TypeScript.
>
> Keep the structure clean, scalable, and easy to maintain. Don't over-engineer it.
>
> Also create a file:
>
> `docs/architecture.md`
>
> For now, document only the proposed folder structure and a brief overview of how the frontend, backend, database, and documentation will be organized.
>
> Do not implement features or APIs yet.
>
> From now on, whenever we make an important architectural or design decision, keep it updated in the appropriate documentation file so we have a clear record of our development process.

### Prompt-log request

> now i want you to create a docs file where all the prompt i am writing to you for the current session will be stored. create that md file and update it according to the prompts

### Employee Management backend

> The requirements, architecture, and folder structure are ready. Now let's build the features one by one, starting with the backend. Implement the first feature: Employee Management. Build it completely with the database model, CRUD operations, pagination, search, filtering, sorting, salary update, deactivation, validation, error handling, and meaningful unit tests. Use our existing React + Node.js + Express.js + PostgreSQL + Prisma + TypeScript stack. Make sure the complete flow works with the database, test everything, and commit the changes. Don't start the next feature until this one is fully completed and verified.
