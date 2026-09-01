import {
  EmployeeStatus,
  Prisma,
  type Employee,
  type PrismaClient,
} from '@prisma/client';
import type { CreateEmployeeInput, EmployeeQuery, UpdateEmployeeInput } from './employee.schemas.js';

export type EmployeeList = { data: Employee[]; total: number };

export interface EmployeeRepository {
  list(query: EmployeeQuery): Promise<EmployeeList>;
  findById(id: string): Promise<Employee | null>;
  create(data: CreateEmployeeInput): Promise<Employee>;
  update(id: string, data: UpdateEmployeeInput): Promise<Employee | null>;
  updateSalary(id: string, salary: number): Promise<Employee | null>;
  deactivate(id: string): Promise<Employee | null>;
}

export const buildEmployeeWhere = (query: EmployeeQuery): Prisma.EmployeeWhereInput => ({
  ...(query.country ? { country: { equals: query.country, mode: 'insensitive' } } : {}),
  ...(query.department ? { department: { equals: query.department, mode: 'insensitive' } } : {}),
  ...(query.status ? { status: query.status as EmployeeStatus } : {}),
  ...(query.search
    ? {
        OR: [
          { employeeCode: { contains: query.search, mode: 'insensitive' } },
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      }
    : {}),
});

export class PrismaEmployeeRepository implements EmployeeRepository {
  constructor(private readonly db: PrismaClient) {}

  async list(query: EmployeeQuery): Promise<EmployeeList> {
    const where = buildEmployeeWhere(query);
    const [data, total] = await this.db.$transaction([
      this.db.employee.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.db.employee.count({ where }),
    ]);
    return { data, total };
  }

  findById(id: string) {
    return this.db.employee.findUnique({ where: { id } });
  }

  create(data: CreateEmployeeInput) {
    return this.db.employee.create({
      data: {
        ...data,
        salaryHistory: { create: { current: data.salary } },
      },
    });
  }

  async update(id: string, data: UpdateEmployeeInput) {
    const result = await this.db.employee.updateMany({ where: { id }, data });
    return result.count ? this.findById(id) : null;
  }

  async updateSalary(id: string, salary: number) {
    return this.db.$transaction(async (transaction) => {
      const employee = await transaction.employee.findUnique({ where: { id } });
      if (!employee) return null;

      const updated = await transaction.employee.update({ where: { id }, data: { salary } });
      await transaction.salaryHistory.create({
        data: { employeeId: id, previous: employee.salary, current: salary },
      });
      return updated;
    });
  }

  async deactivate(id: string) {
    const result = await this.db.employee.updateMany({
      where: { id, status: EmployeeStatus.ACTIVE },
      data: { status: EmployeeStatus.INACTIVE, deactivatedAt: new Date() },
    });
    return result.count ? this.findById(id) : null;
  }
}
