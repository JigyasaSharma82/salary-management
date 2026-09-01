import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import type { DashboardFilters } from '../src/modules/dashboard/dashboard.schemas.js';
import type { DashboardRepository, DashboardSummary, SalaryInsight } from '../src/modules/dashboard/dashboard.repository.js';
import { DashboardService } from '../src/modules/dashboard/dashboard.service.js';

class MemoryDashboardRepository implements DashboardRepository {
  public receivedFilters: DashboardFilters | undefined;

  async getSummary(filters: DashboardFilters): Promise<DashboardSummary> {
    this.receivedFilters = filters;
    return { totalEmployees: 10000, activeEmployees: 9800, inactiveEmployees: 200 };
  }

  async getSalaryInsights(filters: DashboardFilters): Promise<SalaryInsight[]> {
    this.receivedFilters = filters;
    return [
      { currency: 'INR', employeeCount: 6000, averageSalary: '950000' },
      { currency: 'USD', employeeCount: 4000, averageSalary: '85000' },
    ];
  }
}

describe('DashboardService', () => {
  it('calculates a total from currency-specific salary averages', async () => {
    const service = new DashboardService(new MemoryDashboardRepository());
    const result = await service.getSalaryInsights({});

    expect(result.totalEmployees).toBe(10000);
    expect(result.averageSalaryByCurrency).toHaveLength(2);
  });
});

describe('Dashboard API', () => {
  it('returns dashboard totals with the requested filters', async () => {
    const repository = new MemoryDashboardRepository();
    const app = createApp(undefined, new DashboardService(repository));
    const response = await request(app).get('/api/v1/dashboard/summary').query({ country: 'India', status: 'ACTIVE' });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({ totalEmployees: 10000, activeEmployees: 9800, inactiveEmployees: 200 });
    expect(repository.receivedFilters).toEqual({ country: 'India', status: 'ACTIVE' });
  });

  it('returns average salary grouped by currency and validates filters', async () => {
    const app = createApp(undefined, new DashboardService(new MemoryDashboardRepository()));
    const insights = await request(app).get('/api/v1/dashboard/salary-insights').query({ currency: 'INR' });
    const invalid = await request(app).get('/api/v1/dashboard/salary-insights').query({ currency: 'rupees' });

    expect(insights.status).toBe(200);
    expect(insights.body.data.totalEmployees).toBe(10000);
    expect(insights.body.data.averageSalaryByCurrency[0]).toEqual({ currency: 'INR', employeeCount: 6000, averageSalary: '950000' });
    expect(invalid.status).toBe(400);
  });
});
