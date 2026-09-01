import { Router } from 'express';
import { employeeController } from './employee.controller.js';
import type { EmployeeService } from './employee.service.js';

export const employeeRouter = (service: EmployeeService) => {
  const controller = employeeController(service);
  const router = Router();

  router.get('/', controller.list);
  router.get('/filter-options', controller.filterOptions);
  router.post('/', controller.create);
  router.get('/:id', controller.getById);
  router.patch('/:id', controller.update);
  router.patch('/:id/salary', controller.updateSalary);
  router.patch('/:id/deactivate', controller.deactivate);
  router.delete('/:id', controller.deactivate);

  return router;
};
