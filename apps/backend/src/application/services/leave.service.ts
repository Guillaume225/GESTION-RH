import type { ILeaveRepository } from '../../domain/repositories/leave.repository.js';
import type { CreateLeaveDto, ReviewLeaveDto } from '../dtos/leave.dto.js';
import { AppError } from '../../infrastructure/errors/app-error.js';
import { calculateBusinessDays } from '@erp-rh/utils';

export class LeaveService {
  constructor(private leaveRepo: ILeaveRepository) {}

  async findAll(page: number, limit: number, employeeId?: string) {
    return this.leaveRepo.findAll({ page, limit }, employeeId);
  }

  async findById(id: string) {
    const leave = await this.leaveRepo.findById(id);
    if (!leave) throw new AppError('Demande de congé non trouvée', 404);
    return leave;
  }

  async create(employeeId: string, dto: CreateLeaveDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate < startDate) {
      throw new AppError('La date de fin doit être après la date de début', 400);
    }

    const days = calculateBusinessDays(startDate, endDate);
    if (days <= 0) {
      throw new AppError('La période doit contenir au moins un jour ouvré', 400);
    }

    // Check balance
    const year = startDate.getFullYear();
    const balances = await this.leaveRepo.getBalances(employeeId, year);
    const balance = balances.find((b) => b.type === dto.type);

    if (balance) {
      const remaining = balance.total - balance.used - balance.pending;
      if (days > remaining) {
        throw new AppError(`Solde insuffisant. Reste: ${remaining} jour(s)`, 400);
      }
    }

    const leave = await this.leaveRepo.create({
      employeeId,
      type: dto.type,
      status: 'PENDING',
      startDate,
      endDate,
      days,
      reason: dto.reason ?? null,
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
    });

    // Update pending balance
    await this.leaveRepo.updateBalance(employeeId, dto.type, year, { pending: days });

    return leave;
  }

  async review(id: string, reviewerId: string, dto: ReviewLeaveDto) {
    const leave = await this.leaveRepo.findById(id);
    if (!leave) throw new AppError('Demande de congé non trouvée', 404);
    if (leave.status !== 'PENDING') throw new AppError('Cette demande a déjà été traitée', 400);

    const year = leave.startDate.getFullYear();

    if (dto.status === 'APPROVED') {
      await this.leaveRepo.updateBalance(leave.employeeId, leave.type, year, {
        used: leave.days,
        pending: -leave.days,
      });
    } else {
      await this.leaveRepo.updateBalance(leave.employeeId, leave.type, year, {
        pending: -leave.days,
      });
    }

    return this.leaveRepo.update(id, {
      status: dto.status,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNote: dto.reviewNote ?? null,
    });
  }

  async getBalances(employeeId: string) {
    const year = new Date().getFullYear();
    return this.leaveRepo.getBalances(employeeId, year);
  }

  async getTeamCalendar(managerEmployeeId: string, startDate: Date, endDate: Date) {
    return this.leaveRepo.getTeamCalendar(managerEmployeeId, startDate, endDate);
  }
}
