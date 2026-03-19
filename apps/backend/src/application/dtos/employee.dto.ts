import { z } from 'zod';

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis').max(100),
  lastName: z.string().min(1, 'Nom requis').max(100),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  hireDate: z.string().datetime({ message: 'Date d\'embauche requise' }),
  contractType: z.enum(['CDI', 'CDD', 'INTERIM', 'STAGE', 'ALTERNANCE', 'FREELANCE']),
  salary: z.number().positive().optional(),
  departmentId: z.string().uuid().optional(),
  positionId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const employeeFilterSchema = z.object({
  search: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']).optional(),
  contractType: z.enum(['CDI', 'CDD', 'INTERIM', 'STAGE', 'ALTERNANCE', 'FREELANCE']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().default('lastName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>;
export type EmployeeFilterDto = z.infer<typeof employeeFilterSchema>;
