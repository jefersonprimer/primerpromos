import 'dotenv/config';
import { PrismaClient } from '../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const productsCount = await prisma.product.count();
    const offersCount = await prisma.offer.count();
    console.log(`Total Products in DB: ${productsCount}`);
    console.log(`Total Offers in DB: ${offersCount}`);

    if (offersCount > 0) {
      const sampleOffers = await prisma.offer.findMany({
        take: 3,
        include: { product: true }
      });
      console.log('Sample Offers:', JSON.stringify(sampleOffers, null, 2));
    }
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
