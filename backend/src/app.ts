import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { prisma } from './lib/prisma.js';
import { PrismaEmployeeRepository } from './modules/employees/employee.repository.js';
import { employeeRouter } from './modules/employees/employee.routes.js';
import { EmployeeService } from './modules/employees/employee.service.js';
import { PrismaDashboardRepository } from './modules/dashboard/dashboard.repository.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { DashboardService } from './modules/dashboard/dashboard.service.js';

export const createApp = (
  employeeService = new EmployeeService(new PrismaEmployeeRepository(prisma)),
  dashboardService = new DashboardService(new PrismaDashboardRepository(prisma)),
) => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));
  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
  app.use('/api/v1/employees', employeeRouter(employeeService));
  app.use('/api/v1/dashboard', dashboardRouter(dashboardService));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
