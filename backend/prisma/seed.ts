import { EmployeeStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const EMPLOYEE_COUNT = 10_000;
const BATCH_SIZE = 1_000;

const locations = [
  { country: 'India', currency: 'INR' },
  { country: 'United States', currency: 'USD' },
  { country: 'United Kingdom', currency: 'GBP' },
  { country: 'Germany', currency: 'EUR' },
  { country: 'Singapore', currency: 'SGD' },
] as const;

const departments = [
  { name: 'Engineering', title: 'Software Engineer', baseSalary: 85000 },
  { name: 'People Operations', title: 'HR Specialist', baseSalary: 60000 },
  { name: 'Finance', title: 'Financial Analyst', baseSalary: 70000 },
  { name: 'Sales', title: 'Account Executive', baseSalary: 65000 },
  { name: 'Operations', title: 'Operations Manager', baseSalary: 68000 },
] as const;

const firstNames = ['Aarav', 'Asha', 'David', 'Emma', 'Isha', 'James', 'Mei', 'Noah', 'Priya', 'Sofia'];
const lastNames = ['Brown', 'Garcia', 'Kumar', 'Mehta', 'Miller', 'Patel', 'Schmidt', 'Sharma', 'Tan', 'Wilson'];

const seedId = (index: number, segment: '8' | '9') =>
  `00000000-0000-4000-${segment}000-${String(index + 1).padStart(12, '0')}`;

const employeeData = Array.from({ length: EMPLOYEE_COUNT }, (_, index) => {
  const location = locations[index % locations.length];
  const department = departments[index % departments.length];
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
  const salary = department.baseSalary + (index % 20) * 2500;
  const sequence = String(index + 1).padStart(5, '0');

  return {
    employee: {
      id: seedId(index, '8'),
      employeeCode: `SEED-EMP-${sequence}`,
      firstName,
      lastName,
      email: `seed.employee.${sequence}@example.test`,
      department: department.name,
      jobTitle: department.title,
      country: location.country,
      currency: location.currency,
      salary,
      status: EmployeeStatus.ACTIVE,
    },
    salaryHistory: {
      id: seedId(index, '9'),
      employeeId: seedId(index, '8'),
      current: salary,
    },
  };
});

async function seed() {
  for (let start = 0; start < employeeData.length; start += BATCH_SIZE) {
    const batch = employeeData.slice(start, start + BATCH_SIZE);
    await prisma.$transaction([
      prisma.employee.createMany({ data: batch.map(({ employee }) => employee), skipDuplicates: true }),
      prisma.salaryHistory.createMany({ data: batch.map(({ salaryHistory }) => salaryHistory), skipDuplicates: true }),
    ]);
  }

  const seededEmployeeCount = await prisma.employee.count({
    where: { employeeCode: { startsWith: 'SEED-EMP-' } },
  });
  console.log(`Seeded ${seededEmployeeCount} employee records.`);
}

seed()
  .catch((error: unknown) => {
    console.error('Employee seeding failed.', error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
