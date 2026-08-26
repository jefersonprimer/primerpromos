import prisma from '../app/lib/prisma';
import { slugify } from '../app/lib/utils';

async function main() {
  const allProducts = await prisma.product.findMany({
    select: { id: true, title: true }
  });
  const target = 'celular-samsung-galaxy-s24-ultra-5g-256gb-12-gb';
  const match = allProducts.find((p) => slugify(p.title) === target);
  console.log("Matching product:", match);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
