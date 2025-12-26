import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reset() {
  console.log('🗑️  Tyhjennetään tietokanta...');
  
  await prisma.alert.deleteMany();
  await prisma.dailyStats.deleteMany();
  await prisma.reading.deleteMany();
  await prisma.device.deleteMany();
  
  console.log('✨ Tietokanta tyhjennetty!');
  console.log('💡 Aja "npm run db:seed" luodaksesi uuden seed-datan');
}

reset()
  .catch((e) => {
    console.error('❌ Virhe:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
