import type { DashboardSummary, Employee, SalaryInsight } from '../types/employee';

export type EmployeeFilters = {
  search?: string;
  country?: string;
  department?: string;
  currency?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type EmployeeListResponse = {
  data: Employee[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) throw new Error(`Request failed (${response.status}).`);
  return response.json() as Promise<T>;
}

export const api = {
  employees: (filters: EmployeeFilters = {}) => {
    const params = new URLSearchParams({ page: String(filters.page ?? 1), pageSize: String(filters.pageSize ?? 30) });
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
    });
    return request<EmployeeListResponse>(`/employees?${params.toString()}`);
  },
  employeeFilterOptions: () => request<{ data: { countries: string[]; departments: string[]; currencies: string[] } }>('/employees/filter-options'),
  dashboardSummary: () => request<{ data: DashboardSummary }>('/dashboard/summary'),
  salaryInsights: () => request<{ data: { totalEmployees: number; averageSalaryByCurrency: SalaryInsight[] } }>('/dashboard/salary-insights'),
};
