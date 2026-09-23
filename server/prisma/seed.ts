import prisma from '../src/config/prisma';
import { seedDatabase } from '../src/services/seedService';

seedDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
