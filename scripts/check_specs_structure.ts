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
    const productsWithSpecs = await prisma.product.findMany({
      where: {
        specs: {
          not: null
        }
      },
      take: 5
    });

    console.log(`Found ${productsWithSpecs.length} products with specs.`);
    for (const p of productsWithSpecs) {
      console.log(`\nProduct ID ${p.id}: ${p.title}`);
      console.log('Specs structure (keys/first few):', JSON.stringify(p.specs, null, 2).slice(0, 1000));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
