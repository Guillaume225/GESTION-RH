import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Paramètres entreprise
  await prisma.companySettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Mon Entreprise SAS',
      address: '123 Rue de la Paix, 75001 Paris',
      phone: '+33 1 23 45 67 89',
      email: 'contact@monentreprise.fr',
      workingDaysPerWeek: 5,
      workingHoursPerDay: 8,
      defaultLeaveBalance: 25,
    },
  });

  // Départements
  const rhDept = await prisma.department.upsert({
    where: { name: 'Ressources Humaines' },
    update: {},
    create: { name: 'Ressources Humaines', description: 'Département RH' },
  });

  const techDept = await prisma.department.upsert({
    where: { name: 'Technologie' },
    update: {},
    create: { name: 'Technologie', description: 'Département IT' },
  });

  const salesDept = await prisma.department.upsert({
    where: { name: 'Commercial' },
    update: {},
    create: { name: 'Commercial', description: 'Département commercial' },
  });

  // Postes
  const posDRH = await prisma.position.create({
    data: { title: 'Directeur RH', departmentId: rhDept.id, minSalary: 60000, maxSalary: 90000 },
  });

  const posRH = await prisma.position.create({
    data: { title: 'Chargé RH', departmentId: rhDept.id, minSalary: 35000, maxSalary: 50000 },
  });

  const posCTO = await prisma.position.create({
    data: { title: 'CTO', departmentId: techDept.id, minSalary: 70000, maxSalary: 100000 },
  });

  const posDev = await prisma.position.create({
    data: { title: 'Développeur', departmentId: techDept.id, minSalary: 38000, maxSalary: 55000 },
  });

  const posCommercial = await prisma.position.create({
    data: { title: 'Commercial', departmentId: salesDept.id, minSalary: 30000, maxSalary: 45000 },
  });

  // Utilisateur Admin
  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@monentreprise.fr' },
    update: {},
    create: {
      email: 'admin@monentreprise.fr',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  const adminEmployee = await prisma.employee.create({
    data: {
      employeeNumber: 'EMP-001',
      userId: adminUser.id,
      firstName: 'Admin',
      lastName: 'Système',
      positionId: posDRH.id,
      departmentId: rhDept.id,
      hireDate: new Date('2020-01-01'),
      baseSalary: 75000,
      contractType: 'CDI',
    },
  });

  // Employé RH
  const hrUser = await prisma.user.upsert({
    where: { email: 'rh@monentreprise.fr' },
    update: {},
    create: {
      email: 'rh@monentreprise.fr',
      password: hashedPassword,
      role: 'HR_MANAGER',
    },
  });

  await prisma.employee.create({
    data: {
      employeeNumber: 'EMP-002',
      userId: hrUser.id,
      firstName: 'Marie',
      lastName: 'Dupont',
      positionId: posRH.id,
      departmentId: rhDept.id,
      managerId: adminEmployee.id,
      hireDate: new Date('2021-03-15'),
      baseSalary: 42000,
      contractType: 'CDI',
    },
  });

  // Manager Tech
  const managerUser = await prisma.user.upsert({
    where: { email: 'cto@monentreprise.fr' },
    update: {},
    create: {
      email: 'cto@monentreprise.fr',
      password: hashedPassword,
      role: 'MANAGER',
    },
  });

  const managerEmployee = await prisma.employee.create({
    data: {
      employeeNumber: 'EMP-003',
      userId: managerUser.id,
      firstName: 'Pierre',
      lastName: 'Martin',
      positionId: posCTO.id,
      departmentId: techDept.id,
      hireDate: new Date('2020-06-01'),
      baseSalary: 85000,
      contractType: 'CDI',
    },
  });

  // Employé dev
  const devUser = await prisma.user.upsert({
    where: { email: 'dev@monentreprise.fr' },
    update: {},
    create: {
      email: 'dev@monentreprise.fr',
      password: hashedPassword,
      role: 'EMPLOYEE',
    },
  });

  await prisma.employee.create({
    data: {
      employeeNumber: 'EMP-004',
      userId: devUser.id,
      firstName: 'Jean',
      lastName: 'Bernard',
      positionId: posDev.id,
      departmentId: techDept.id,
      managerId: managerEmployee.id,
      hireDate: new Date('2022-09-01'),
      baseSalary: 45000,
      contractType: 'CDI',
    },
  });

  // Soldes de congés pour l'année en cours
  const currentYear = new Date().getFullYear();
  const employees = await prisma.employee.findMany();

  for (const emp of employees) {
    await prisma.leaveBalance.upsert({
      where: {
        employeeId_type_year: {
          employeeId: emp.id,
        type: 'PAID_LEAVE',
        year: currentYear,
        },
      },
      update: {},
      create: {
        employeeId: emp.id,
        type: 'PAID_LEAVE',
        year: currentYear,
        allocated: 25,
        used: 0,
        pending: 0,
        remaining: 25,
      },
    });

    await prisma.leaveBalance.upsert({
      where: {
        employeeId_type_year: {
          employeeId: emp.id,
        type: 'RTT',
        year: currentYear,
        },
      },
      update: {},
      create: {
        employeeId: emp.id,
        type: 'RTT',
        year: currentYear,
        allocated: 10,
        used: 0,
        pending: 0,
        remaining: 10,
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
