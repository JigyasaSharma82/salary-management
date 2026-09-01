import { useMemo, useState } from 'react';
import type { Employee, EmployeeStatus } from '../../types/employee';

type SortKey = 'employeeCode' | 'firstName' | 'department' | 'country' | 'salary' | 'status';
type SortDirection = 'asc' | 'desc';
type EmployeeTableProps = { employees: Employee[] };

const PAGE_SIZE = 25;
const searchableFields = (employee: Employee) => [employee.employeeCode, employee.firstName, employee.lastName, employee.email].join(' ').toLowerCase();
const unique = (values: string[]) => [...new Set(values)].sort();

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [department, setDepartment] = useState('');
  const [currency, setCurrency] = useState('');
  const [status, setStatus] = useState<EmployeeStatus | ''>('');
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'employeeCode', direction: 'asc' });
  const [page, setPage] = useState(1);

  const filteredEmployees = useMemo(() => {
    const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return employees
      .filter((employee) => terms.every((term) => searchableFields(employee).includes(term)))
      .filter((employee) => !country || employee.country === country)
      .filter((employee) => !department || employee.department === department)
      .filter((employee) => !currency || employee.currency === currency)
      .filter((employee) => !status || employee.status === status)
      .sort((left, right) => {
        const leftValue = sort.key === 'salary' ? Number(left.salary) : `${left[sort.key]} ${sort.key === 'firstName' ? left.lastName : ''}`;
        const rightValue = sort.key === 'salary' ? Number(right.salary) : `${right[sort.key]} ${sort.key === 'firstName' ? right.lastName : ''}`;
        const result = typeof leftValue === 'number' && typeof rightValue === 'number'
          ? leftValue - rightValue
          : String(leftValue).localeCompare(String(rightValue));
        return result * (sort.direction === 'asc' ? 1 : -1);
      });
  }, [employees, search, country, department, currency, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const displayedEmployees = filteredEmployees.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const updateFilter = (update: () => void) => { update(); setPage(1); };
  const toggleSort = (key: SortKey) => setSort((current) => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }));
  const sortLabel = (key: SortKey) => sort.key === key ? (sort.direction === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <section className="employee-section">
      <div className="section-heading"><div><p className="eyebrow">Employee data</p><h2>Employees</h2></div><p className="muted">{filteredEmployees.length.toLocaleString()} matching records</p></div>
      <div className="filters">
        <input aria-label="Search employees" placeholder="Search name, code, or email" value={search} onChange={(event) => updateFilter(() => setSearch(event.target.value))} />
        <select aria-label="Filter by country" value={country} onChange={(event) => updateFilter(() => setCountry(event.target.value))}><option value="">All countries</option>{unique(employees.map((employee) => employee.country)).map((value) => <option key={value}>{value}</option>)}</select>
        <select aria-label="Filter by department" value={department} onChange={(event) => updateFilter(() => setDepartment(event.target.value))}><option value="">All departments</option>{unique(employees.map((employee) => employee.department)).map((value) => <option key={value}>{value}</option>)}</select>
        <select aria-label="Filter by currency" value={currency} onChange={(event) => updateFilter(() => setCurrency(event.target.value))}><option value="">All currencies</option>{unique(employees.map((employee) => employee.currency)).map((value) => <option key={value}>{value}</option>)}</select>
        <select aria-label="Filter by status" value={status} onChange={(event) => updateFilter(() => setStatus(event.target.value as EmployeeStatus | ''))}><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
      </div>
      <div className="table-wrap"><table><thead><tr>
        <th><button onClick={() => toggleSort('employeeCode')}>Code{sortLabel('employeeCode')}</button></th>
        <th><button onClick={() => toggleSort('firstName')}>Employee{sortLabel('firstName')}</button></th>
        <th><button onClick={() => toggleSort('department')}>Department{sortLabel('department')}</button></th>
        <th><button onClick={() => toggleSort('country')}>Country{sortLabel('country')}</button></th>
        <th><button onClick={() => toggleSort('salary')}>Salary{sortLabel('salary')}</button></th>
        <th><button onClick={() => toggleSort('status')}>Status{sortLabel('status')}</button></th>
      </tr></thead><tbody>{displayedEmployees.map((employee) => <tr key={employee.id}>
        <td>{employee.employeeCode}</td><td><strong>{employee.firstName} {employee.lastName}</strong><small>{employee.email}</small></td><td>{employee.department}<small>{employee.jobTitle}</small></td><td>{employee.country}</td><td>{new Intl.NumberFormat('en', { style: 'currency', currency: employee.currency, maximumFractionDigits: 0 }).format(Number(employee.salary))}</td><td><span className={`status ${employee.status.toLowerCase()}`}>{employee.status.toLowerCase()}</span></td>
      </tr>)}</tbody></table></div>
      <nav className="pagination" aria-label="Employee table pagination"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage} of {totalPages}</span><button disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Next</button></nav>
    </section>
  );
}
