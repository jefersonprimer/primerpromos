import { notFound } from "next/navigation";
import prisma from "@/app/lib/prisma";
import CategoryPageContent from "./CategoryPageContent";
import { getCategoryFromSlug } from "@/app/lib/utils";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const dbCategory = getCategoryFromSlug(category);

  if (!dbCategory) {
    return { title: "Categoria não encontrada | Primer Promos" };
  }

  // Pluralized title for metadata
  const title = dbCategory.endsWith("r") || dbCategory.endsWith("l")
    ? `${dbCategory}es`
    : dbCategory.endsWith("m")
    ? `${dbCategory.slice(0, -1)}ns`
    : `${dbCategory}s`;

  return {
    title: `${title} em Destaque | Primer Promos`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const dbCategory = getCategoryFromSlug(category);

  if (!dbCategory) {
    notFound();
  }

  // Fetch all products matching the database category
  const productsRaw = await prisma.product.findMany({
    where: {
      category: dbCategory,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  const products = productsRaw.map((p) => ({
    ...p,
    cash_price: p.cash_price.toString(),
    installment_price: p.installment_price.toString(),
    created_at: p.created_at.toISOString(),
  }));

  // Standardize pluralized category title
  const pluralTitle = dbCategory.endsWith("r") || dbCategory.endsWith("l")
    ? `${dbCategory}es`
    : dbCategory.endsWith("m")
    ? `${dbCategory.slice(0, -1)}ns`
    : `${dbCategory}s`;

  return (
    <CategoryPageContent
      categoryName={pluralTitle}
      initialProducts={products}
    />
  );
}
