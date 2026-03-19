// ─── Enums ─────────────────────────────────────────
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  HR_MANAGER = 'HR_MANAGER',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
}

export enum ContractType {
  CDI = 'CDI',
  CDD = 'CDD',
  INTERIM = 'INTERIM',
  STAGE = 'STAGE',
  ALTERNANCE = 'ALTERNANCE',
  FREELANCE = 'FREELANCE',
}

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  UNPAID = 'UNPAID',
  RTT = 'RTT',
  FAMILY_EVENT = 'FAMILY_EVENT',
  OTHER = 'OTHER',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum PayslipStatus {
  DRAFT = 'DRAFT',
  VALIDATED = 'VALIDATED',
  PAID = 'PAID',
}

export enum JobOfferStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum CandidateStage {
  NEW = 'NEW',
  SCREENING = 'SCREENING',
  INTERVIEW = 'INTERVIEW',
  TECHNICAL_TEST = 'TECHNICAL_TEST',
  OFFER = 'OFFER',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
}

export enum EvaluationType {
  ANNUAL = 'ANNUAL',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  PROBATION = 'PROBATION',
  PROJECT = 'PROJECT',
}

export enum EvaluationStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum TrainingStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TrainingType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
  ONLINE = 'ONLINE',
  CONFERENCE = 'CONFERENCE',
}

export enum DocumentType {
  CONTRACT = 'CONTRACT',
  PAYSLIP = 'PAYSLIP',
  CERTIFICATE = 'CERTIFICATE',
  ID_DOCUMENT = 'ID_DOCUMENT',
  MEDICAL = 'MEDICAL',
  OTHER = 'OTHER',
}

// ─── DTOs ──────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// ─── Auth ──────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  employee?: EmployeeSummaryDto;
}

// ─── Employee ──────────────────────────────────────

export interface EmployeeSummaryDto {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  avatarUrl?: string;
  position?: string;
  department?: string;
}

export interface EmployeeDto extends EmployeeSummaryDto {
  email: string;
  phone?: string;
  dateOfBirth?: string;
  hireDate: string;
  contractType: ContractType;
  status: EmployeeStatus;
  salary?: number;
  address?: string;
  city?: string;
  zipCode?: string;
  managerId?: string;
  departmentId?: string;
  positionId?: string;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  hireDate: string;
  contractType: ContractType;
  salary?: number;
  address?: string;
  city?: string;
  zipCode?: string;
  departmentId?: string;
  positionId?: string;
  managerId?: string;
}

// ─── Leave ─────────────────────────────────────────

export interface LeaveRequestDto {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  status: LeaveStatus;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface CreateLeaveRequest {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface LeaveBalanceDto {
  type: LeaveType;
  total: number;
  used: number;
  remaining: number;
}

// ─── Payroll ───────────────────────────────────────

export interface PayslipDto {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  grossSalary: number;
  netSalary: number;
  totalDeductions: number;
  status: PayslipStatus;
  items: PayslipItemDto[];
  createdAt: string;
}

export interface PayslipItemDto {
  label: string;
  type: 'EARNING' | 'DEDUCTION';
  base?: number;
  rate?: number;
  amount: number;
}

// ─── Recruitment ───────────────────────────────────

export interface JobOfferDto {
  id: string;
  title: string;
  description: string;
  departmentId?: string;
  departmentName?: string;
  contractType: ContractType;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  status: JobOfferStatus;
  candidatesCount: number;
  createdAt: string;
}

export interface CandidateDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  stage: CandidateStage;
  jobOfferId: string;
  jobOfferTitle: string;
  resumeUrl?: string;
  notes?: string;
  appliedAt: string;
}

// ─── Performance ───────────────────────────────────

export interface EvaluationDto {
  id: string;
  employeeId: string;
  employeeName: string;
  evaluatorId: string;
  evaluatorName: string;
  type: EvaluationType;
  status: EvaluationStatus;
  period: string;
  overallRating?: number;
  objectives: ObjectiveDto[];
  createdAt: string;
}

export interface ObjectiveDto {
  id: string;
  title: string;
  description?: string;
  weight: number;
  rating?: number;
  comment?: string;
}

// ─── Training ──────────────────────────────────────

export interface TrainingDto {
  id: string;
  title: string;
  description?: string;
  provider?: string;
  type: TrainingType;
  status: TrainingStatus;
  duration?: number;
  maxParticipants?: number;
  enrolledCount: number;
  startDate?: string;
  endDate?: string;
}

// ─── Document ──────────────────────────────────────

export interface DocumentDto {
  id: string;
  name: string;
  type: DocumentType;
  filePath: string;
  fileSize?: number;
  employeeId: string;
  employeeName: string;
  createdAt: string;
}

// ─── Dashboard / Reporting ─────────────────────────

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaves: number;
  openPositions: number;
  upcomingTrainings: number;
  recentHires: number;
}

export interface DepartmentDistribution {
  name: string;
  count: number;
  percentage: number;
}

// ─── Notification ──────────────────────────────────

export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}
