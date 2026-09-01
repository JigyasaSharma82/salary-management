import { Prisma } from '@prisma/client';
import { AppError } from '../../middleware/error-handler.js';
import type { CreateEmployeeInput, EmployeeQuery, UpdateEmployeeInput } from './employee.schemas.js';
import type { EmployeeFilterOptions, EmployeeRepository } from './employee.repository.js';

export class EmployeeService {
  constructor(private readonly repository: EmployeeRepository) {}

  list(query: EmployeeQuery) {
    return this.repository.list(query);
  }

  filterOptions(): Promise<EmployeeFilterOptions> {
    return this.repository.filterOptions?.() ?? Promise.resolve({ countries: [], departments: [], currencies: [] });
  }

  async getById(id: string) {
    const employee = await this.repository.findById(id);
    if (!employee) throw new AppError(404, 'Employee not found.');
    return employee;
  }

  async create(data: CreateEmployeeInput) {
    try {
      return await this.repository.create(data);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(409, 'An employee with this employee code or email already exists.');
      }
      throw error;
    }
  }

  async update(id: string, data: UpdateEmployeeInput) {
    const employee = await this.repository.update(id, data);
    if (!employee) throw new AppError(404, 'Employee not found.');
    return employee;
  }

  async updateSalary(id: string, salary: number) {
    const employee = await this.repository.updateSalary(id, salary);
    if (!employee) throw new AppError(404, 'Employee not found.');
    return employee;
  }

  async deactivate(id: string) {
    const employee = await this.repository.deactivate(id);
    if (!employee) {
      const existing = await this.repository.findById(id);
      if (existing) throw new AppError(409, 'Employee is already inactive.');
      throw new AppError(404, 'Employee not found.');
    }
    return employee;
  }
}
