import { useState } from 'react';
import type { EmployeeFilters } from '../../services/api';
import type { Employee, EmployeeStatus } from '../../types/employee';

type SortKey = 'employeeCode' | 'firstName' | 'department' | 'country' | 'salary' | 'status';
type SortDirection = 'asc' | 'desc';
type EmployeeTableProps = {
  employees: Employee[];
  filterOptions: { countries: string[]; departments: string[]; currencies: string[] };
  pagination: { page: number; total: number; totalPages: number };
  loading: boolean;
  onApplyFilters: (filters: EmployeeFilters) => void;
  onPageChange: (page: number) => void;
  onSortChange: (key: SortKey, direction: SortDirection) => void;
};

const PAGE_SIZE = 30;

export function EmployeeTable({ employees, filterOptions, pagination, loading, onApplyFilters, onPageChange, onSortChange }: EmployeeTableProps) {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [department, setDepartment] = useState('');
  const [currency, setCurrency] = useState('');
  const [status, setStatus] = useState<EmployeeStatus | ''>('');
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'employeeCode', direction: 'asc' });
  const applyFilters = () => onApplyFilters({ search: search.trim(), country, department, currency, status, page: 1, pageSize: PAGE_SIZE, sortBy: sort.key, sortOrder: sort.direction });
  const toggleSort = (key: SortKey) => {
    const direction = sort.key === key && sort.direction === 'asc' ? 'desc' : 'asc';
    setSort({ key, direction });
    onSortChange(key, direction);
  };
  const sortLabel = (key: SortKey) => sort.key === key ? (sort.direction === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <section className="employee-section">
      <div className="section-heading"><div><p className="eyebrow">Employee data</p><h2>Employees</h2></div><p className="muted">{pagination.total.toLocaleString()} matching records</p></div>
      <div className="filters">
        <input aria-label="Search employees" placeholder="Search name, code, or email" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select aria-label="Filter by country" value={country} onChange={(event) => setCountry(event.target.value)}><option value="">All countries</option>{filterOptions.countries.map((value) => <option key={value}>{value}</option>)}</select>
        <select aria-label="Filter by department" value={department} onChange={(event) => setDepartment(event.target.value)}><option value="">All departments</option>{filterOptions.departments.map((value) => <option key={value}>{value}</option>)}</select>
        <select aria-label="Filter by currency" value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="">All currencies</option>{filterOptions.currencies.map((value) => <option key={value}>{value}</option>)}</select>
        <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value as EmployeeStatus | '')}><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
        <button className="apply-filters" type="button" onClick={applyFilters} disabled={loading}>Apply filters</button>
      </div>
      <div className="table-wrap"><table><thead><tr>
        <th><button onClick={() => toggleSort('employeeCode')}>Code{sortLabel('employeeCode')}</button></th>
        <th><button onClick={() => toggleSort('firstName')}>Employee{sortLabel('firstName')}</button></th>
        <th><button onClick={() => toggleSort('department')}>Department{sortLabel('department')}</button></th>
        <th><button onClick={() => toggleSort('country')}>Country{sortLabel('country')}</button></th>
        <th><button onClick={() => toggleSort('salary')}>Salary{sortLabel('salary')}</button></th>
        <th><button onClick={() => toggleSort('status')}>Status{sortLabel('status')}</button></th>
      </tr></thead><tbody>{employees.map((employee) => <tr key={employee.id}>
        <td>{employee.employeeCode}</td><td><strong>{employee.firstName} {employee.lastName}</strong><small>{employee.email}</small></td><td>{employee.department}<small>{employee.jobTitle}</small></td><td>{employee.country}</td><td>{new Intl.NumberFormat('en', { style: 'currency', currency: employee.currency, maximumFractionDigits: 0 }).format(Number(employee.salary))}</td><td><span className={`status ${employee.status.toLowerCase()}`}>{employee.status.toLowerCase()}</span></td>
      </tr>)}</tbody></table></div>
      <nav className="pagination" aria-label="Employee table pagination"><button disabled={pagination.page === 1 || loading} onClick={() => onPageChange(pagination.page - 1)}>Previous</button><span>Page {pagination.page} of {pagination.totalPages}</span><button disabled={pagination.page === pagination.totalPages || loading} onClick={() => onPageChange(pagination.page + 1)}>Next</button></nav>
    </section>
  );
}
