import { EmployeeStatus, Prisma, type Employee } from '@prisma/client';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { AppError } from '../src/middleware/error-handler.js';
import type { CreateEmployeeInput, EmployeeQuery, UpdateEmployeeInput } from '../src/modules/employees/employee.schemas.js';
import type { EmployeeList, EmployeeRepository } from '../src/modules/employees/employee.repository.js';
import { EmployeeService } from '../src/modules/employees/employee.service.js';

const employeeId = '9a223b9e-2d30-4c0e-a3af-41db4b40a9d8';
const employee = (overrides: Partial<Employee> = {}): Employee => ({
  id: employeeId,
  employeeCode: 'EMP-1001',
  firstName: 'Asha',
  lastName: 'Sharma',
  email: 'asha.sharma@example.com',
  department: 'Engineering',
  jobTitle: 'Software Engineer',
  country: 'India',
  currency: 'INR',
  salary: new Prisma.Decimal(1200000),
  status: EmployeeStatus.ACTIVE,
  deactivatedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

class MemoryEmployeeRepository implements EmployeeRepository {
  public rows: Employee[];

  constructor(rows: Employee[] = [employee()]) {
    this.rows = rows;
  }

  async list(query: EmployeeQuery): Promise<EmployeeList> {
    let data = [...this.rows];
    if (query.status) data = data.filter((row) => row.status === query.status);
    if (query.country) data = data.filter((row) => row.country.toLowerCase() === query.country.toLowerCase());
    if (query.department) data = data.filter((row) => row.department.toLowerCase() === query.department.toLowerCase());
    if (query.currency) data = data.filter((row) => row.currency === query.currency);
    if (query.search) {
      const terms = query.search.toLowerCase().split(/\s+/);
      data = data.filter((row) => terms.every((term) => [row.employeeCode, row.firstName, row.lastName, row.email].some((value) => value.toLowerCase().includes(term))));
    }
    data.sort((a, b) => {
      const left = a[query.sortBy];
      const right = b[query.sortBy];
      const comparison = left instanceof Prisma.Decimal && right instanceof Prisma.Decimal
        ? left.comparedTo(right)
        : left instanceof Date && right instanceof Date
          ? left.getTime() - right.getTime()
          : String(left).localeCompare(String(right));
      return comparison * (query.sortOrder === 'asc' ? 1 : -1);
    });
    const total = data.length;
    return { data: data.slice((query.page - 1) * query.pageSize, query.page * query.pageSize), total };
  }

  async findById(id: string) {
    return this.rows.find((row) => row.id === id) ?? null;
  }

  async create(data: CreateEmployeeInput) {
    const row = employee({ id: crypto.randomUUID(), ...data, salary: new Prisma.Decimal(data.salary) });
    this.rows.push(row);
    return row;
  }

  async update(id: string, data: UpdateEmployeeInput) {
    const row = await this.findById(id);
    if (!row) return null;
    Object.assign(row, data, { updatedAt: new Date() });
    return row;
  }

  async updateSalary(id: string, salary: number) {
    const row = await this.findById(id);
    if (!row) return null;
    row.salary = new Prisma.Decimal(salary);
    return row;
  }

  async deactivate(id: string) {
    const row = await this.findById(id);
    if (!row || row.status === EmployeeStatus.INACTIVE) return null;
    row.status = EmployeeStatus.INACTIVE;
    row.deactivatedAt = new Date();
    return row;
  }
}

describe('EmployeeService', () => {
  it('creates, updates, changes salary, and deactivates an employee', async () => {
    const repository = new MemoryEmployeeRepository([]);
    const service = new EmployeeService(repository);
    const created = await service.create({
      employeeCode: 'EMP-1002', firstName: 'Ravi', lastName: 'Kumar', email: 'ravi@example.com',
      department: 'Finance', jobTitle: 'Analyst', country: 'India', currency: 'INR', salary: 850000,
    });

    const updated = await service.update(created.id, { department: 'People Operations' });
    const salaryUpdated = await service.updateSalary(created.id, 900000);
    const deactivated = await service.deactivate(created.id);

    expect(updated.department).toBe('People Operations');
    expect(salaryUpdated.salary.toString()).toBe('900000');
    expect(deactivated.status).toBe(EmployeeStatus.INACTIVE);
    expect(deactivated.deactivatedAt).toBeInstanceOf(Date);
  });

  it('returns the correct errors for absent and already inactive employees', async () => {
    const service = new EmployeeService(new MemoryEmployeeRepository([employee({ status: EmployeeStatus.INACTIVE })]));

    await expect(service.getById('00000000-0000-4000-8000-000000000000')).rejects.toMatchObject<AppError>({ statusCode: 404 });
    await expect(service.deactivate(employeeId)).rejects.toMatchObject<AppError>({ statusCode: 409 });
  });
});

describe('Employee API', () => {
  const app = createApp(new EmployeeService(new MemoryEmployeeRepository([employee(), employee({ id: '075a652d-e19f-4dbe-9b76-9f0b82f7d7b2', employeeCode: 'EMP-1003', lastName: 'Patel', country: 'United Kingdom', currency: 'GBP' })])));

  it('lists employees with search, filtering, sorting, and pagination metadata', async () => {
    const response = await request(app)
      .get('/api/v1/employees')
      .query({ search: 'patel', country: 'United Kingdom', sortBy: 'lastName', sortOrder: 'desc', page: 1, pageSize: 1 });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].employeeCode).toBe('EMP-1003');
    expect(response.body.pagination).toEqual({ page: 1, pageSize: 1, total: 1, totalPages: 1 });
  });

  it('supports multi-word search, currency filtering, and numeric salary sorting', async () => {
    const app = createApp(new EmployeeService(new MemoryEmployeeRepository([
      employee({ firstName: 'Asha', lastName: 'Sharma', currency: 'INR', salary: new Prisma.Decimal(900000) }),
      employee({ id: '54cab4a7-8efb-4c9c-847f-43ca26891757', employeeCode: 'EMP-1005', firstName: 'Asha', lastName: 'Sharma', currency: 'INR', salary: new Prisma.Decimal(1200000) }),
      employee({ id: '7287334f-678d-4342-a0a6-b849fb415d7a', employeeCode: 'EMP-1006', firstName: 'Asha', lastName: 'Smith', currency: 'USD', salary: new Prisma.Decimal(200000) }),
    ])));
    const response = await request(app)
      .get('/api/v1/employees')
      .query({ search: 'Asha Sharma', currency: 'INR', sortBy: 'salary', sortOrder: 'desc' });

    expect(response.status).toBe(200);
    expect(response.body.data.map((row: { employeeCode: string }) => row.employeeCode)).toEqual(['EMP-1005', 'EMP-1001']);
  });

  it('rejects unsupported sort fields', async () => {
    const response = await request(app).get('/api/v1/employees').query({ sortBy: 'invalidField' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed.');
  });

  it('validates input and updates a salary through its dedicated endpoint', async () => {
    const invalid = await request(app).post('/api/v1/employees').send({ employeeCode: 'EMP-1004' });
    const updated = await request(app).patch(`/api/v1/employees/${employeeId}/salary`).send({ salary: 1300000 });

    expect(invalid.status).toBe(400);
    expect(invalid.body.error).toBe('Validation failed.');
    expect(updated.status).toBe(200);
    expect(updated.body.data.salary).toBe('1300000');
  });

  it('rejects invalid employee identifiers', async () => {
    const response = await request(app).get('/api/v1/employees/not-a-uuid');
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed.');
  });
});
