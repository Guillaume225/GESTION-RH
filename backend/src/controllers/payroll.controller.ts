import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { payrollService } from '../services/payroll.service';

export class PayrollController {
  async getPayslips(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, employeeId, year, month, status } = req.query;
      const result = await payrollService.getPayslips({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        employeeId: employeeId as string,
        year: year ? Number(year) : undefined,
        month: month ? Number(month) : undefined,
        status: status as string,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPayslipById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await payrollService.getPayslipById(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async generatePayslip(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { employeeId, year, month } = req.body;
      const result = await payrollService.generatePayslip(employeeId, year, month);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async generateBulkPayslips(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { year, month } = req.body;
      const results = await payrollService.generateBulkPayslips(year, month);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  async validatePayslip(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await payrollService.validatePayslip(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const payrollController = new PayrollController();
