import { z } from 'zod';

const currencySchema = z.string().trim().regex(/^[A-Z]{3}$/, 'Currency must be a three-letter ISO code.');
const salarySchema = z.coerce.number().positive().max(99_999_999.99);

export const createEmployeeSchema = z.object({
  employeeCode: z.string().trim().min(1).max(50),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  department: z.string().trim().min(1).max(100),
  jobTitle: z.string().trim().min(1).max(150),
  country: z.string().trim().min(2).max(100),
  currency: currencySchema,
  salary: salarySchema,
});

export const updateEmployeeSchema = createEmployeeSchema.omit({ employeeCode: true, salary: true }).partial();
export const salaryUpdateSchema = z.object({ salary: salarySchema });

export const employeeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(10_000).default(25),
  search: z.string().trim().min(1).max(100).optional(),
  country: z.string().trim().min(2).max(100).optional(),
  department: z.string().trim().min(1).max(100).optional(),
  currency: currencySchema.optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  sortBy: z.enum(['employeeCode', 'firstName', 'lastName', 'email', 'department', 'jobTitle', 'country', 'salary', 'createdAt', 'updatedAt']).default('lastName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type SalaryUpdateInput = z.infer<typeof salaryUpdateSchema>;
export type EmployeeQuery = z.infer<typeof employeeQuerySchema>;
