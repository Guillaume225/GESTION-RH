import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const SEED_PASSWORD = process.env.SEED_PASSWORD || 'ChangeMeInProduction1!';

async function main() {
  console.log('🌱 Seeding database...');

  // Company settings
  await prisma.companySettings.upsert({
    where: { id: 'default-settings' },
    update: {},
    create: {
      id: 'default-settings',
      companyName: 'LABEL SAS',
      siret: '123 456 789 00012',
      address: '10 Rue de la Paix',
      phone: '+33 1 23 45 67 89',
      email: 'contact@label.fr',
      workingHoursPerWeek: 35,
      annualLeaveDays: 25,
      rttDays: 10,
    },
  });

  // Departments
  const [dirGen, dsi, drh, commercial] = await Promise.all([
    prisma.department.upsert({
      where: { name: 'Direction Générale' },
      update: {},
      create: { name: 'Direction Générale', description: 'Direction et stratégie' },
    }),
    prisma.department.upsert({
      where: { name: 'DSI' },
      update: {},
      create: { name: 'DSI', description: 'Direction des Systèmes d\'Information' },
    }),
    prisma.department.upsert({
      where: { name: 'Ressources Humaines' },
      update: {},
      create: { name: 'Ressources Humaines', description: 'Gestion du personnel' },
    }),
    prisma.department.upsert({
      where: { name: 'Commercial' },
      update: {},
      create: { name: 'Commercial', description: 'Ventes et développement' },
    }),
  ]);

  // Positions
  const [dirGenPos, devSenior, rhManager, commercialPos, devJunior] = await Promise.all([
    prisma.position.upsert({ where: { title: 'Directeur Général' }, update: {}, create: { title: 'Directeur Général', minSalary: 80000, maxSalary: 120000 } }),
    prisma.position.upsert({ where: { title: 'Développeur Senior' }, update: {}, create: { title: 'Développeur Senior', minSalary: 45000, maxSalary: 65000 } }),
    prisma.position.upsert({ where: { title: 'Responsable RH' }, update: {}, create: { title: 'Responsable RH', minSalary: 40000, maxSalary: 55000 } }),
    prisma.position.upsert({ where: { title: 'Commercial' }, update: {}, create: { title: 'Commercial', minSalary: 30000, maxSalary: 50000 } }),
    prisma.position.upsert({ where: { title: 'Développeur Junior' }, update: {}, create: { title: 'Développeur Junior', minSalary: 30000, maxSalary: 40000 } }),
  ]);

  // Roles & Permissions
  const adminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Accès complet au système',
      permissions: {
        create: [
          { action: 'manage', resource: 'all' },
        ],
      },
    },
  });

  await prisma.role.upsert({
    where: { name: 'HR_MANAGER' },
    update: {},
    create: {
      name: 'HR_MANAGER',
      description: 'Gestion des ressources humaines',
      permissions: {
        create: [
          { action: 'manage', resource: 'employees' },
          { action: 'manage', resource: 'leaves' },
          { action: 'manage', resource: 'payroll' },
          { action: 'manage', resource: 'recruitment' },
          { action: 'read', resource: 'reports' },
        ],
      },
    },
  });

  await prisma.role.upsert({
    where: { name: 'MANAGER' },
    update: {},
    create: {
      name: 'MANAGER',
      description: 'Gestion d\'équipe',
      permissions: {
        create: [
          { action: 'read', resource: 'employees' },
          { action: 'manage', resource: 'leaves' },
          { action: 'manage', resource: 'evaluations' },
          { action: 'read', resource: 'reports' },
        ],
      },
    },
  });

  await prisma.role.upsert({
    where: { name: 'EMPLOYEE' },
    update: {},
    create: {
      name: 'EMPLOYEE',
      description: 'Employé standard',
      permissions: {
        create: [
          { action: 'read', resource: 'self' },
          { action: 'create', resource: 'leaves' },
          { action: 'read', resource: 'payslips' },
        ],
      },
    },
  });

  // Users & Employees
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@label.fr' },
    update: {},
    create: {
      email: 'admin@label.fr',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  const adminEmployee = await prisma.employee.upsert({
    where: { employeeId: 'EMP-001' },
    update: {},
    create: {
      employeeId: 'EMP-001',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'admin@label.fr',
      phone: '+33 6 12 34 56 78',
      hireDate: new Date('2020-01-15'),
      contractType: 'CDI',
      salary: 95000,
      departmentId: dirGen.id,
      positionId: dirGenPos.id,
      userId: adminUser.id,
    },
  });

  const rhUser = await prisma.user.upsert({
    where: { email: 'rh@label.fr' },
    update: {},
    create: {
      email: 'rh@label.fr',
      passwordHash: await bcrypt.hash(SEED_PASSWORD, 12),
      role: 'HR_MANAGER',
    },
  });

  await prisma.employee.upsert({
    where: { employeeId: 'EMP-002' },
    update: {},
    create: {
      employeeId: 'EMP-002',
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'rh@label.fr',
      phone: '+33 6 98 76 54 32',
      hireDate: new Date('2021-03-01'),
      contractType: 'CDI',
      salary: 48000,
      departmentId: drh.id,
      positionId: rhManager.id,
      userId: rhUser.id,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@label.fr' },
    update: {},
    create: {
      email: 'manager@label.fr',
      passwordHash: await bcrypt.hash(SEED_PASSWORD, 12),
      role: 'MANAGER',
    },
  });

  const managerEmployee = await prisma.employee.upsert({
    where: { employeeId: 'EMP-003' },
    update: {},
    create: {
      employeeId: 'EMP-003',
      firstName: 'Pierre',
      lastName: 'Bernard',
      email: 'manager@label.fr',
      phone: '+33 6 11 22 33 44',
      hireDate: new Date('2021-06-15'),
      contractType: 'CDI',
      salary: 55000,
      departmentId: dsi.id,
      positionId: devSenior.id,
      userId: managerUser.id,
    },
  });

  const empUser = await prisma.user.upsert({
    where: { email: 'employe@label.fr' },
    update: {},
    create: {
      email: 'employe@label.fr',
      passwordHash: await bcrypt.hash('Employe1!', 12),
      role: 'EMPLOYEE',
    },
  });

  await prisma.employee.upsert({
    where: { employeeId: 'EMP-004' },
    update: {},
    create: {
      employeeId: 'EMP-004',
      firstName: 'Sophie',
      lastName: 'Leroy',
      email: 'employe@label.fr',
      phone: '+33 6 55 66 77 88',
      hireDate: new Date('2023-09-01'),
      contractType: 'CDI',
      salary: 35000,
      departmentId: dsi.id,
      positionId: devJunior.id,
      managerId: managerEmployee.id,
      userId: empUser.id,
    },
  });

  // Leave balances for current year
  const currentYear = new Date().getFullYear();
  const employees = await prisma.employee.findMany();
  for (const emp of employees) {
    await prisma.leaveBalance.upsert({
      where: { employeeId_type_year: { employeeId: emp.id, type: 'ANNUAL', year: currentYear } },
      update: {},
      create: { employeeId: emp.id, type: 'ANNUAL', year: currentYear, total: 25, used: 0 },
    });
    await prisma.leaveBalance.upsert({
      where: { employeeId_type_year: { employeeId: emp.id, type: 'RTT', year: currentYear } },
      update: {},
      create: { employeeId: emp.id, type: 'RTT', year: currentYear, total: 10, used: 0 },
    });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
