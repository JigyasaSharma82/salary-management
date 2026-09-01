import type { DashboardFilters } from './dashboard.schemas.js';
import type { DashboardRepository } from './dashboard.repository.js';

export class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}

  getSummary(filters: DashboardFilters) {
    return this.repository.getSummary(filters);
  }

  async getSalaryInsights(filters: DashboardFilters) {
    const averageSalaryByCurrency = await this.repository.getSalaryInsights(filters);
    return {
      totalEmployees: averageSalaryByCurrency.reduce((total, insight) => total + insight.employeeCount, 0),
      averageSalaryByCurrency,
    };
  }
}
