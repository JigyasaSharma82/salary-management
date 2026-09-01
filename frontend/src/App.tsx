import { useEffect, useState } from 'react';
import { Dashboard } from './features/dashboard/Dashboard';
import { EmployeeTable } from './features/employees/EmployeeTable';
import { api, type CreateEmployeeInput, type EmployeeFilters, type EmployeeListResponse, type UpdateEmployeeInput } from './services/api';
import type { DashboardSummary, SalaryInsight } from './types/employee';

export default function App() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [insights, setInsights] = useState<SalaryInsight[]>([]);
  const [employeeResponse, setEmployeeResponse] = useState<EmployeeListResponse>({ data: [], pagination: { page: 1, pageSize: 30, total: 0, totalPages: 1 } });
  const [filterOptions, setFilterOptions] = useState({ countries: [] as string[], departments: [] as string[], currencies: [] as string[] });
  const [employeeQuery, setEmployeeQuery] = useState<EmployeeFilters>({ page: 1, pageSize: 30, sortBy: 'employeeCode', sortOrder: 'asc' });
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshEmployeeData = async () => {
    const dashboardFilters = {
      country: employeeQuery.country,
      department: employeeQuery.department,
      currency: employeeQuery.currency,
      status: employeeQuery.status,
    };
    const [listResponse, summaryResponse, insightResponse, filterResponse] = await Promise.all([
      api.employees(employeeQuery),
      api.dashboardSummary(dashboardFilters),
      api.salaryInsights(dashboardFilters),
      api.employeeFilterOptions(),
    ]);
    setEmployeeResponse(listResponse);
    setSummary(summaryResponse.data);
    setInsights(insightResponse.data.averageSalaryByCurrency);
    setFilterOptions(filterResponse.data);
  };

  useEffect(() => {
    api.employeeFilterOptions()
      .then((filterResponse) => {
        setFilterOptions(filterResponse.data);
      })
      .catch(() => setError('Unable to load salary data. Confirm that the API is running and try again.'));
  }, []);

  useEffect(() => {
    setEmployeesLoading(true);
    const dashboardFilters = { country: employeeQuery.country, department: employeeQuery.department, currency: employeeQuery.currency, status: employeeQuery.status };
    Promise.all([api.employees(employeeQuery), api.dashboardSummary(dashboardFilters), api.salaryInsights(dashboardFilters)])
      .then(([employeeList, summaryResponse, insightResponse]) => {
        setEmployeeResponse(employeeList);
        setSummary(summaryResponse.data);
        setInsights(insightResponse.data.averageSalaryByCurrency);
      })
      .catch(() => setError('Unable to load employees. Confirm that the API is running and try again.'))
      .finally(() => setEmployeesLoading(false));
  }, [employeeQuery]);

  if (error) return <main className="app-state"><p>{error}</p></main>;
  if (!summary) return <main className="app-state"><p>Loading salary data…</p></main>;

  return <main className="app-shell">
    <Dashboard summary={summary} insights={insights} />
    <EmployeeTable
      employees={employeeResponse.data}
      filterOptions={filterOptions}
      pagination={employeeResponse.pagination}
      loading={employeesLoading}
      onApplyFilters={(filters) => setEmployeeQuery((current) => ({ ...current, ...filters, page: 1 }))}
      onCreateEmployee={async (employee) => {
        await api.createEmployee(employee);
        await refreshEmployeeData();
      }}
      onUpdateEmployee={async (id, employee, salary) => {
        await api.updateEmployee(id, employee);
        if (salary !== undefined) await api.updateSalary(id, salary);
        await refreshEmployeeData();
      }}
      onDeactivateEmployee={async (id) => {
        await api.deactivateEmployee(id);
        await refreshEmployeeData();
      }}
      onPageChange={(page) => setEmployeeQuery((current) => ({ ...current, page }))}
      onSortChange={(sortBy, sortOrder) => setEmployeeQuery((current) => ({ ...current, sortBy, sortOrder, page: 1 }))}
    />
  </main>;
}
