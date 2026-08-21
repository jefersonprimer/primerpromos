import 'dotenv/config';
import { PrismaClient } from '../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface SpecValue {
  name: string;
  [key: string]: unknown;
}

interface SpecGroup {
  group: string;
  values?: SpecValue[];
  [key: string]: unknown;
}

async function main() {
  try {
    const products = await prisma.product.findMany({
      where: { specs: { not: null } },
      select: { category: true, specs: true }
    });

    const groups: Record<string, Set<string>> = {};

    for (const p of products) {
      const specs = p.specs as unknown as SpecGroup[];
      if (!Array.isArray(specs)) continue;
      for (const g of specs) {
        if (!groups[g.group]) groups[g.group] = new Set();
        if (Array.isArray(g.values)) {
          for (const v of g.values) {
            groups[g.group].add(v.name);
          }
        }
      }
    }

    console.log("All Spec Groups and Attributes in Database:");
    for (const [g, attrs] of Object.entries(groups)) {
      console.log(`\n[${g}]:`);
      for (const a of attrs) {
        console.log(`  - ${a}`);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
