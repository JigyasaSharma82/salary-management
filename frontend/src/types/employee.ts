export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export type Employee = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  country: string;
  currency: string;
  salary: string;
  status: EmployeeStatus;
};

export type DashboardSummary = {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
};

export type SalaryInsight = {
  currency: string;
  employeeCount: number;
  averageSalary: string;
};
