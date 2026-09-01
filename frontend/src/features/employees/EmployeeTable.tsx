import { useState } from 'react';
import type { CreateEmployeeInput, EmployeeFilters, UpdateEmployeeInput } from '../../services/api';
import type { Employee, EmployeeStatus } from '../../types/employee';

type SortKey = 'employeeCode' | 'firstName' | 'department' | 'country' | 'salary' | 'status';
type SortDirection = 'asc' | 'desc';
type EmployeeTableProps = {
  employees: Employee[];
  filterOptions: { countries: string[]; departments: string[]; currencies: string[] };
  pagination: { page: number; total: number; totalPages: number };
  loading: boolean;
  onApplyFilters: (filters: EmployeeFilters) => void;
  onCreateEmployee: (employee: CreateEmployeeInput) => Promise<void>;
  onUpdateEmployee: (id: string, employee: Partial<UpdateEmployeeInput>, salary?: number) => Promise<void>;
  onDeactivateEmployee: (id: string) => Promise<void>;
  onPageChange: (page: number) => void;
  onSortChange: (key: SortKey, direction: SortDirection) => void;
};

const PAGE_SIZE = 30;

const emptyEmployee: CreateEmployeeInput = { employeeCode: '', firstName: '', lastName: '', email: '', department: '', jobTitle: '', country: '', currency: '', salary: 0 };

export function EmployeeTable({ employees, filterOptions, pagination, loading, onApplyFilters, onCreateEmployee, onUpdateEmployee, onDeactivateEmployee, onPageChange, onSortChange }: EmployeeTableProps) {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [department, setDepartment] = useState('');
  const [currency, setCurrency] = useState('');
  const [status, setStatus] = useState<EmployeeStatus | ''>('');
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'employeeCode', direction: 'asc' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState<CreateEmployeeInput>(emptyEmployee);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editEmployee, setEditEmployee] = useState<CreateEmployeeInput>(emptyEmployee);
  const [editing, setEditing] = useState(false);
  const applyFilters = () => onApplyFilters({ search: search.trim(), country, department, currency, status, page: 1, pageSize: PAGE_SIZE, sortBy: sort.key, sortOrder: sort.direction });
  const clearFilters = () => {
    setSearch('');
    setCountry('');
    setDepartment('');
    setCurrency('');
    setStatus('');
    onApplyFilters({ search: '', country: '', department: '', currency: '', status: '', page: 1, pageSize: PAGE_SIZE, sortBy: sort.key, sortOrder: sort.direction });
  };
  const toggleSort = (key: SortKey) => {
    const direction = sort.key === key && sort.direction === 'asc' ? 'desc' : 'asc';
    setSort({ key, direction });
    onSortChange(key, direction);
  };
  const sortLabel = (key: SortKey) => sort.key === key ? (sort.direction === 'asc' ? ' ▲' : ' ▼') : '';
  const updateEmployee = (field: keyof CreateEmployeeInput, value: string | number) => setNewEmployee((current) => ({ ...current, [field]: value }));
  const submitEmployee = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      await onCreateEmployee({ ...newEmployee, salary: Number(newEmployee.salary) });
      setNewEmployee(emptyEmployee);
      setShowCreateForm(false);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Unable to create employee.');
    } finally {
      setCreating(false);
    }
  };
  const openEditForm = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditEmployee({ ...employee, salary: Number(employee.salary) });
    setCreateError(null);
  };
  const submitEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingEmployee) return;
    setEditing(true);
    setCreateError(null);
    try {
      const { employeeCode: _employeeCode, salary, ...profile } = editEmployee;
      await onUpdateEmployee(editingEmployee.id, profile, Number(salary));
      setEditingEmployee(null);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Unable to update employee.');
    } finally {
      setEditing(false);
    }
  };
  const deactivate = async (employee: Employee) => {
    if (!window.confirm(`Deactivate ${employee.firstName} ${employee.lastName}?`)) return;
    try {
      await onDeactivateEmployee(employee.id);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Unable to update employee status.');
    }
  };

  return (
    <section className="employee-section">
      <div className="section-heading"><div><p className="eyebrow">Employee data</p><h2>Employees</h2></div><div className="heading-actions"><p className="muted">{pagination.total.toLocaleString()} matching records</p><button className="create-employee" type="button" onClick={() => { setCreateError(null); setShowCreateForm(true); }}>Add employee</button></div></div>
      <div className="filters">
        <input aria-label="Search employees" placeholder="Search name, code, or email" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select aria-label="Filter by country" value={country} onChange={(event) => setCountry(event.target.value)}><option value="">All countries</option>{filterOptions.countries.map((value) => <option key={value}>{value}</option>)}</select>
        <select aria-label="Filter by department" value={department} onChange={(event) => setDepartment(event.target.value)}><option value="">All departments</option>{filterOptions.departments.map((value) => <option key={value}>{value}</option>)}</select>
        <select aria-label="Filter by currency" value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="">All currencies</option>{filterOptions.currencies.map((value) => <option key={value}>{value}</option>)}</select>
        <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value as EmployeeStatus | '')}><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
        <button className="apply-filters" type="button" onClick={applyFilters} disabled={loading}>Apply filters</button><button className="clear-filters" type="button" onClick={clearFilters} disabled={loading}>Clear filters</button>
      </div>
      {showCreateForm && <div className="modal-backdrop" role="presentation"><div className="create-modal" role="dialog" aria-modal="true" aria-labelledby="create-employee-title">
        <div className="modal-heading"><div><p className="eyebrow">Employee data</p><h2 id="create-employee-title">Add employee</h2></div><button className="close-modal" type="button" aria-label="Close form" onClick={() => setShowCreateForm(false)}>×</button></div>
        <form className="employee-form" onSubmit={submitEmployee}>
          <label>Employee code<input required value={newEmployee.employeeCode} onChange={(event) => updateEmployee('employeeCode', event.target.value)} /></label>
          <label>First name<input required value={newEmployee.firstName} onChange={(event) => updateEmployee('firstName', event.target.value)} /></label>
          <label>Last name<input required value={newEmployee.lastName} onChange={(event) => updateEmployee('lastName', event.target.value)} /></label>
          <label>Email<input required type="email" value={newEmployee.email} onChange={(event) => updateEmployee('email', event.target.value)} /></label>
          <label>Department<input required value={newEmployee.department} onChange={(event) => updateEmployee('department', event.target.value)} /></label>
          <label>Job title<input required value={newEmployee.jobTitle} onChange={(event) => updateEmployee('jobTitle', event.target.value)} /></label>
          <label>Country<input required value={newEmployee.country} onChange={(event) => updateEmployee('country', event.target.value)} /></label>
          <label>Currency<input required maxLength={3} placeholder="USD" value={newEmployee.currency} onChange={(event) => updateEmployee('currency', event.target.value.toUpperCase())} /></label>
          <label>Annual salary<input required min="0.01" step="0.01" type="number" value={newEmployee.salary || ''} onChange={(event) => updateEmployee('salary', Number(event.target.value))} /></label>
          {createError && <p className="form-error" role="alert">{createError}</p>}
          <div className="form-actions"><button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button><button className="submit-employee" type="submit" disabled={creating}>{creating ? 'Adding...' : 'Add employee'}</button></div>
        </form>
      </div></div>}
      <div className="table-wrap"><table><thead><tr>
        <th><button onClick={() => toggleSort('employeeCode')}>Code{sortLabel('employeeCode')}</button></th>
        <th><button onClick={() => toggleSort('firstName')}>Employee{sortLabel('firstName')}</button></th>
        <th><button onClick={() => toggleSort('department')}>Department{sortLabel('department')}</button></th>
        <th><button onClick={() => toggleSort('country')}>Country{sortLabel('country')}</button></th>
        <th><button onClick={() => toggleSort('salary')}>Salary{sortLabel('salary')}</button></th>
        <th><button onClick={() => toggleSort('status')}>Status{sortLabel('status')}</button></th><th>Actions</th>
      </tr></thead><tbody>{employees.map((employee) => <tr key={employee.id}>
        <td>{employee.employeeCode}</td><td><strong>{employee.firstName} {employee.lastName}</strong><small>{employee.email}</small></td><td>{employee.department}<small>{employee.jobTitle}</small></td><td>{employee.country}</td><td>{new Intl.NumberFormat('en', { style: 'currency', currency: employee.currency, maximumFractionDigits: 0 }).format(Number(employee.salary))}</td><td><span className={`status ${employee.status.toLowerCase()}`}>{employee.status.toLowerCase()}</span></td><td className="row-actions"><button type="button" onClick={() => openEditForm(employee)}>Edit</button>{employee.status === 'ACTIVE' && <button type="button" onClick={() => void deactivate(employee)}>Deactivate</button>}</td>
      </tr>)}</tbody></table></div>
      {editingEmployee && <div className="modal-backdrop" role="presentation"><div className="create-modal" role="dialog" aria-modal="true" aria-labelledby="edit-employee-title">
        <div className="modal-heading"><div><p className="eyebrow">Employee data</p><h2 id="edit-employee-title">Edit employee</h2></div><button className="close-modal" type="button" aria-label="Close form" onClick={() => setEditingEmployee(null)}>×</button></div>
        <form className="employee-form" onSubmit={submitEdit}>
          <label>Employee code<input disabled value={editEmployee.employeeCode} /></label>
          <label>First name<input required value={editEmployee.firstName} onChange={(event) => setEditEmployee((current) => ({ ...current, firstName: event.target.value }))} /></label>
          <label>Last name<input required value={editEmployee.lastName} onChange={(event) => setEditEmployee((current) => ({ ...current, lastName: event.target.value }))} /></label>
          <label>Email<input required type="email" value={editEmployee.email} onChange={(event) => setEditEmployee((current) => ({ ...current, email: event.target.value }))} /></label>
          <label>Department<input required value={editEmployee.department} onChange={(event) => setEditEmployee((current) => ({ ...current, department: event.target.value }))} /></label>
          <label>Job title<input required value={editEmployee.jobTitle} onChange={(event) => setEditEmployee((current) => ({ ...current, jobTitle: event.target.value }))} /></label>
          <label>Country<input required value={editEmployee.country} onChange={(event) => setEditEmployee((current) => ({ ...current, country: event.target.value }))} /></label>
          <label>Currency<input required maxLength={3} value={editEmployee.currency} onChange={(event) => setEditEmployee((current) => ({ ...current, currency: event.target.value.toUpperCase() }))} /></label>
          <label>Annual salary<input required min="0.01" step="0.01" type="number" value={editEmployee.salary} onChange={(event) => setEditEmployee((current) => ({ ...current, salary: Number(event.target.value) }))} /></label>
          {createError && <p className="form-error" role="alert">{createError}</p>}
          <div className="form-actions"><button type="button" onClick={() => setEditingEmployee(null)}>Cancel</button><button className="submit-employee" type="submit" disabled={editing}>{editing ? 'Saving...' : 'Save changes'}</button></div>
        </form>
      </div></div>}
      <nav className="pagination" aria-label="Employee table pagination"><button disabled={pagination.page === 1 || loading} onClick={() => onPageChange(pagination.page - 1)}>Previous</button><span>Page {pagination.page} of {pagination.totalPages}</span><button disabled={pagination.page === pagination.totalPages || loading} onClick={() => onPageChange(pagination.page + 1)}>Next</button></nav>
    </section>
  );
}
