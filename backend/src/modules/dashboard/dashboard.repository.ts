import { EmployeeStatus, Prisma, type PrismaClient } from '@prisma/client';
import type { DashboardFilters } from './dashboard.schemas.js';

export type DashboardSummary = {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
};

export type SalaryInsight = {
  currency: string;
  employeeCount: number;
  averageSalary: string;
};

export interface DashboardRepository {
  getSummary(filters: DashboardFilters): Promise<DashboardSummary>;
  getSalaryInsights(filters: DashboardFilters): Promise<SalaryInsight[]>;
}

export const buildDashboardWhere = (filters: DashboardFilters): Prisma.EmployeeWhereInput => ({
  ...(filters.country ? { country: { equals: filters.country, mode: 'insensitive' } } : {}),
  ...(filters.department ? { department: { equals: filters.department, mode: 'insensitive' } } : {}),
  ...(filters.currency ? { currency: filters.currency } : {}),
  ...(filters.status ? { status: filters.status as EmployeeStatus } : {}),
});

export class PrismaDashboardRepository implements DashboardRepository {
  constructor(private readonly db: PrismaClient) {}

  async getSummary(filters: DashboardFilters): Promise<DashboardSummary> {
    const where = buildDashboardWhere(filters);
    const [totalEmployees, activeEmployees, inactiveEmployees] = await this.db.$transaction([
      this.db.employee.count({ where }),
      this.db.employee.count({ where: { ...where, status: EmployeeStatus.ACTIVE } }),
      this.db.employee.count({ where: { ...where, status: EmployeeStatus.INACTIVE } }),
    ]);
    return { totalEmployees, activeEmployees, inactiveEmployees };
  }

  async getSalaryInsights(filters: DashboardFilters): Promise<SalaryInsight[]> {
    const results = await this.db.employee.groupBy({
      by: ['currency'],
      where: buildDashboardWhere(filters),
      _count: { _all: true },
      _avg: { salary: true },
      orderBy: { currency: 'asc' },
    });

    return results.map((result) => ({
      currency: result.currency,
      employeeCount: result._count._all,
      averageSalary: result._avg.salary?.toString() ?? '0',
    }));
  }
}
