import 'dotenv/config';
import { PrismaClient } from '../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface BuscapeProductDetails {
  specs?: any;
}

async function fetchBuscapeProductDetails(productUrl: string): Promise<BuscapeProductDetails> {
  const result: BuscapeProductDetails = {};
  try {
    const response = await fetch(productUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (!response.ok) return result;
    const html = await response.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
    if (!match || !match[1]) return result;
    
    const nextData = JSON.parse(match[1]);
    const reduxState = nextData?.props?.initialReduxState;
    if (!reduxState) return result;

    const productsRoot = reduxState?.products;
    if (productsRoot) {
      const productKeys = Object.keys(productsRoot);
      if (productKeys.length > 0) {
        const firstProd = productsRoot[productKeys[0]];
        if (firstProd && firstProd.attributes) {
          result.specs = firstProd.attributes;
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching:`, error);
  }
  return result;
}

async function main() {
  try {
    const products = await prisma.product.findMany({
      where: {
        source_site: 'buscape',
      },
      take: 5,
    });

    console.log(`Found ${products.length} Buscapé products to check.`);
    for (const prod of products) {
      console.log(`Processing ID ${prod.id}: ${prod.title}`);
      const details = await fetchBuscapeProductDetails(prod.product_url);
      if (details.specs) {
        await prisma.product.update({
          where: { id: prod.id },
          data: { specs: details.specs }
        });
        console.log(`Updated specs for product ID ${prod.id}`);
      } else {
        console.log(`No specs found for product ID ${prod.id}`);
      }
    }
  } catch (error) {
    console.error('Error backfilling specs:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
