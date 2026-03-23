import type { Response, NextFunction } from 'express';
import type { PayrollService } from '@application/services/payroll.service.js';
import type { AuthRequest } from '@infrastructure/middleware/auth.middleware.js';

export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  getPayslips = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.payrollService.getPayslips(req.query as any);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getPayslipById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const payslip = await this.payrollService.getPayslipById(req.params.id);
      res.json({ success: true, data: payslip });
    } catch (err) {
      next(err);
    }
  };

  generatePayslip = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { employeeId, month, year } = req.body;
      const payslip = await this.payrollService.generatePayslip(employeeId, month, year);
      res.status(201).json({ success: true, data: payslip });
    } catch (err) {
      next(err);
    }
  };

  validatePayslip = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const payslip = await this.payrollService.validatePayslip(req.params.id);
      res.json({ success: true, data: payslip });
    } catch (err) {
      next(err);
    }
  };

  generateBulk = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { month, year } = req.body;
      const result = await this.payrollService.generateBulkPayslips(month, year);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}
