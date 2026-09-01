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

export type CreateEmployeeInput = {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  country: string;
  currency: string;
  salary: number;
};

export type UpdateEmployeeInput = Omit<CreateEmployeeInput, 'employeeCode' | 'salary'>;
export type DashboardFilters = Pick<EmployeeFilters, 'country' | 'department' | 'currency' | 'status'>;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

const queryString = (filters: Record<string, string | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string; error?: string } | null;
    throw new Error(body?.message ?? body?.error ?? `Request failed (${response.status}).`);
  }
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
  createEmployee: (employee: CreateEmployeeInput) => request<{ data: Employee }>('/employees', {
    method: 'POST',
    body: JSON.stringify(employee),
  }),
  getEmployee: (id: string) => request<{ data: Employee }>(`/employees/${id}`),
  updateEmployee: (id: string, employee: Partial<UpdateEmployeeInput>) => request<{ data: Employee }>(`/employees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(employee),
  }),
  updateSalary: (id: string, salary: number) => request<{ data: Employee }>(`/employees/${id}/salary`, {
    method: 'PATCH',
    body: JSON.stringify({ salary }),
  }),
  deactivateEmployee: (id: string) => request<{ data: Employee }>(`/employees/${id}/deactivate`, { method: 'PATCH' }),
  deleteEmployee: (id: string) => request<{ data: Employee }>(`/employees/${id}`, { method: 'DELETE' }),
  dashboardSummary: (filters: DashboardFilters = {}) => request<{ data: DashboardSummary }>(`/dashboard/summary?${queryString(filters)}`),
  salaryInsights: (filters: DashboardFilters = {}) => request<{ data: { totalEmployees: number; averageSalaryByCurrency: SalaryInsight[] } }>(`/dashboard/salary-insights?${queryString(filters)}`),
};
