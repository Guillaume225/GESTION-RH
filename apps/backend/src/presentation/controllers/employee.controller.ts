import type { Response, NextFunction } from 'express';
import type { EmployeeService } from '@application/services/employee.service.js';
import type { AuthRequest } from '@infrastructure/middleware/auth.middleware.js';
import { AppError } from '@infrastructure/errors/app-error.js';

export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  findAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.employeeService.findAll(req.query as any);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  findById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const employee = await this.employeeService.findById(req.params.id);
      res.json({ success: true, data: employee });
    } catch (err) {
      next(err);
    }
  };

  findMyProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) throw new AppError('Non authentifié', 401);
      const employee = await this.employeeService.findByUserId(req.userId);
      res.json({ success: true, data: employee });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const employee = await this.employeeService.create(req.body);
      res.status(201).json({ success: true, data: employee });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const employee = await this.employeeService.update(req.params.id, req.body);
      res.json({ success: true, data: employee });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.employeeService.delete(req.params.id);
      res.json({ success: true, message: 'Employé supprimé avec succès' });
    } catch (err) {
      next(err);
    }
  };

  getOrgChart = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orgChart = await this.employeeService.getOrgChart();
      res.json({ success: true, data: orgChart });
    } catch (err) {
      next(err);
    }
  };
}
