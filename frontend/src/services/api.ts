import type { DashboardSummary, Employee, SalaryInsight } from '../types/employee';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) throw new Error(`Request failed (${response.status}).`);
  return response.json() as Promise<T>;
}

export const api = {
  employees: () => request<{ data: Employee[] }>('/employees?page=1&pageSize=10000'),
  dashboardSummary: () => request<{ data: DashboardSummary }>('/dashboard/summary'),
  salaryInsights: () => request<{ data: { totalEmployees: number; averageSalaryByCurrency: SalaryInsight[] } }>('/dashboard/salary-insights'),
};
