import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';

export const DEFAULT_CATEGORIES = [
  { name: 'Food', icon: 'Utensils', color: '#10b981' },
  { name: 'Travel', icon: 'Plane', color: '#f59e0b' },
  { name: 'Education', icon: 'GraduationCap', color: '#3b82f6' },
  { name: 'Housing', icon: 'Home', color: '#8b5cf6' },
  { name: 'Utilities', icon: 'Zap', color: '#06b6d4' },
  { name: 'Healthcare', icon: 'HeartPulse', color: '#ec4899' },
  { name: 'Entertainment', icon: 'Film', color: '#f97316' },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#14b8a6' },
  { name: 'Transportation', icon: 'Car', color: '#64748b' },
  { name: 'Other', icon: 'MoreHorizontal', color: '#6b7280' },
];

export async function seedDatabase() {
  console.log('Seeding database with default categories and Step 31/32 demo data...');

  // 1. Seed or update Default Categories
  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, isDefault: true },
    });
    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          isDefault: true,
        },
      });
    }
  }

  // 2. Create or Reset Demo User
  const demoEmail = 'demo@smartbudget.ai';
  let demoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  const hashedPassword = await bcrypt.hash('password123', 10);

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: demoEmail,
        password: hashedPassword,
        name: 'Alex Rivera',
      },
    });
  } else {
    // Clear previous budgets and expenses for clean demo state
    await prisma.expense.deleteMany({ where: { userId: demoUser.id } });
    await prisma.budget.deleteMany({ where: { userId: demoUser.id } });
    await prisma.aIConversation.deleteMany({ where: { userId: demoUser.id } });
  }

  // Fetch created categories
  const categories = await prisma.category.findMany();
  const getCat = (name: string) => categories.find((c) => c.name.toLowerCase() === name.toLowerCase())!;

  const foodCat = getCat('Food');
  const travelCat = getCat('Travel');
  const eduCat = getCat('Education');
  const entCat = getCat('Entertainment');

  const demoMonth = '2026-09';

  // 3. Create Budgets (Step 31: Food: ₹8,000, Travel: ₹5,000, Education: ₹7,000, Entertainment: ₹3,000)
  // Total Budget = ₹23,000
  await prisma.budget.createMany({
    data: [
      { userId: demoUser.id, categoryId: foodCat.id, month: demoMonth, amount: 8000 },
      { userId: demoUser.id, categoryId: travelCat.id, month: demoMonth, amount: 5000 },
      { userId: demoUser.id, categoryId: eduCat.id, month: demoMonth, amount: 7000 },
      { userId: demoUser.id, categoryId: entCat.id, month: demoMonth, amount: 3000 },
    ],
  });

  // 4. Create Expenses
  // Food Spent = ₹6,500 (Remaining = ₹1,500)
  // Travel Spent = ₹6,200 (Overspent = ₹1,200)
  // Education Spent = ₹4,000 (Remaining = ₹3,000)
  // Entertainment Spent = ₹2,700 (Remaining = ₹300, 90% used - near limit)
  // Total Spent = ₹19,400 (Total Remaining = ₹3,600)
  await prisma.expense.createMany({
    data: [
      // Food
      {
        userId: demoUser.id,
        categoryId: foodCat.id,
        title: 'Supermarket Groceries & Pantry',
        amount: 2200,
        date: new Date('2026-09-04T10:30:00Z'),
        description: 'Monthly staples, organic produce, dairy',
      },
      {
        userId: demoUser.id,
        categoryId: foodCat.id,
        title: 'Family Weekend Dinner',
        amount: 1800,
        date: new Date('2026-09-11T19:45:00Z'),
        description: 'Dinner at Italian Bistro',
      },
      {
        userId: demoUser.id,
        categoryId: foodCat.id,
        title: 'Weekly Farm Fresh Vegetables',
        amount: 1500,
        date: new Date('2026-09-18T11:15:00Z'),
        description: 'Fresh vegetables, fruits and supplies',
      },
      {
        userId: demoUser.id,
        categoryId: foodCat.id,
        title: 'Artisan Cafe & Bakery',
        amount: 1000,
        date: new Date('2026-09-22T16:00:00Z'),
        description: 'Coffee meetings and pastries',
      },

      // Travel (Overspent)
      {
        userId: demoUser.id,
        categoryId: travelCat.id,
        title: 'Highway Roadtrip Fuel & Expressway Tolls',
        amount: 3800,
        date: new Date('2026-09-06T08:00:00Z'),
        description: 'Interstate travel for family vacation',
      },
      {
        userId: demoUser.id,
        categoryId: travelCat.id,
        title: 'Weekend Heritage Resort Stay',
        amount: 2400,
        date: new Date('2026-09-13T14:30:00Z'),
        description: 'Lodging booking reservation',
      },

      // Education
      {
        userId: demoUser.id,
        categoryId: eduCat.id,
        title: 'Full-Stack & AI Systems Certification',
        amount: 3000,
        date: new Date('2026-09-02T09:00:00Z'),
        description: 'Professional development specialization',
      },
      {
        userId: demoUser.id,
        categoryId: eduCat.id,
        title: 'System Design & Architecture Books',
        amount: 1000,
        date: new Date('2026-09-15T13:20:00Z'),
        description: 'Technical reference books and guides',
      },

      // Entertainment (Near limit - 90%)
      {
        userId: demoUser.id,
        categoryId: entCat.id,
        title: 'Music Festival Concert Tickets',
        amount: 1200,
        date: new Date('2026-09-08T18:00:00Z'),
        description: 'Live performance passes',
      },
      {
        userId: demoUser.id,
        categoryId: entCat.id,
        title: 'Annual Media Streaming Renewals',
        amount: 900,
        date: new Date('2026-09-10T12:00:00Z'),
        description: 'Music and video premium subscriptions',
      },
      {
        userId: demoUser.id,
        categoryId: entCat.id,
        title: 'IMAX Cinema Weekend Outing',
        amount: 600,
        date: new Date('2026-09-20T20:15:00Z'),
        description: 'Sci-fi movie premiere and snacks',
      },
    ],
  });

  const existingSettings = await prisma.settings.findUnique({
    where: { userId: demoUser.id },
  });
  if (!existingSettings) {
    await prisma.settings.create({
      data: {
        userId: demoUser.id,
        currency: '₹',
      },
    });
  }

  // Seed or Reset Financial Profile for Demo User (Section 3 & 22)
  await prisma.financialProfile.upsert({
    where: { userId: demoUser.id },
    update: {
      monthlyIncome: 60000,
      incomeFrequency: 'monthly',
      earningMembers: 2,
      householdMembers: 4,
      dependents: 2,
      children: 2,
      adults: 2,
      seniors: 0,
      monthlyRent: 12000,
      monthlyEmi: 5000,
      monthlyUtilities: 3000,
      monthlyInsurance: 2000,
      otherFixedExpenses: 2000,
      monthlySavingsGoal: 10000,
      emergencyFundGoal: 150000,
    },
    create: {
      userId: demoUser.id,
      monthlyIncome: 60000,
      incomeFrequency: 'monthly',
      earningMembers: 2,
      householdMembers: 4,
      dependents: 2,
      children: 2,
      adults: 2,
      seniors: 0,
      monthlyRent: 12000,
      monthlyEmi: 5000,
      monthlyUtilities: 3000,
      monthlyInsurance: 2000,
      otherFixedExpenses: 2000,
      monthlySavingsGoal: 10000,
      emergencyFundGoal: 150000,
    },
  });

  console.log('Database seeded successfully with Financial Profile!');
}
