import { useEffect, useState } from 'react';
import { Dashboard } from './features/dashboard/Dashboard';
import { EmployeeTable } from './features/employees/EmployeeTable';
import { api } from './services/api';
import type { DashboardSummary, Employee, SalaryInsight } from './types/employee';

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [insights, setInsights] = useState<SalaryInsight[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.employees(), api.dashboardSummary(), api.salaryInsights()])
      .then(([employeeResponse, summaryResponse, insightResponse]) => {
        setEmployees(employeeResponse.data);
        setSummary(summaryResponse.data);
        setInsights(insightResponse.data.averageSalaryByCurrency);
      })
      .catch(() => setError('Unable to load salary data. Confirm that the API is running and try again.'));
  }, []);

  if (error) return <main className="app-state"><p>{error}</p></main>;
  if (!summary) return <main className="app-state"><p>Loading salary data…</p></main>;

  return <main className="app-shell">
    <Dashboard summary={summary} insights={insights} />
    <EmployeeTable employees={employees} />
  </main>;
}
