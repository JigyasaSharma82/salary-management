import { Router, type RequestHandler } from 'express';
import { dashboardFilterSchema } from './dashboard.schemas.js';
import type { DashboardService } from './dashboard.service.js';

const asyncHandler = (handler: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export const dashboardRouter = (service: DashboardService) => {
  const router = Router();

  router.get('/summary', asyncHandler(async (req, res) => {
    const filters = dashboardFilterSchema.parse(req.query);
    res.status(200).json({ data: await service.getSummary(filters) });
  }));

  router.get('/salary-insights', asyncHandler(async (req, res) => {
    const filters = dashboardFilterSchema.parse(req.query);
    res.status(200).json({ data: await service.getSalaryInsights(filters) });
  }));

  return router;
};
