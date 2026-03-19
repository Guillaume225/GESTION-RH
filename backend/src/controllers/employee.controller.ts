import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { employeeService } from '../services/employee.service';

export class EmployeeController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, departmentId, status } = req.query;
      const result = await employeeService.findAll({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        departmentId: departmentId as string,
        status: status as any,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await employeeService.findById(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await employeeService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await employeeService.update(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await employeeService.delete(req.params.id);
      res.json({ message: 'Employé désactivé' });
    } catch (error) {
      next(error);
    }
  }

  async getOrgChart(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await employeeService.getOrgChart();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getDepartments(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await employeeService.getDepartments();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPositions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await employeeService.getPositions(req.query.departmentId as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const employeeController = new EmployeeController();
