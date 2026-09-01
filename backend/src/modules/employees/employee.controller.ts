import type { RequestHandler } from 'express';
import { z } from 'zod';
import {
  createEmployeeSchema,
  employeeQuerySchema,
  salaryUpdateSchema,
  updateEmployeeSchema,
} from './employee.schemas.js';
import type { EmployeeService } from './employee.service.js';

const idSchema = z.string().uuid();
const asyncHandler = (handler: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export const employeeController = (service: EmployeeService) => ({
  list: asyncHandler(async (req, res) => {
    const query = employeeQuerySchema.parse(req.query);
    const result = await service.list(query);
    res.status(200).json({
      data: result.data,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / query.pageSize),
      },
    });
  }),

  getById: asyncHandler(async (req, res) => {
    const employee = await service.getById(idSchema.parse(req.params.id));
    res.status(200).json({ data: employee });
  }),

  create: asyncHandler(async (req, res) => {
    const employee = await service.create(createEmployeeSchema.parse(req.body));
    res.status(201).json({ data: employee });
  }),

  update: asyncHandler(async (req, res) => {
    const employee = await service.update(idSchema.parse(req.params.id), updateEmployeeSchema.parse(req.body));
    res.status(200).json({ data: employee });
  }),

  updateSalary: asyncHandler(async (req, res) => {
    const employee = await service.updateSalary(idSchema.parse(req.params.id), salaryUpdateSchema.parse(req.body).salary);
    res.status(200).json({ data: employee });
  }),

  deactivate: asyncHandler(async (req, res) => {
    const employee = await service.deactivate(idSchema.parse(req.params.id));
    res.status(200).json({ data: employee });
  }),
});
