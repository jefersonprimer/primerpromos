import { Metadata } from "next";
import prisma from "@/app/lib/prisma";
import ComparadorClient from "./ComparadorClient";

import { type Product } from "@/app/components/ProductCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comparador de Produtos | Primer Promos",
  description: "Compare smartphones, notebooks, hardware e muito mais lado a lado para encontrar a melhor oferta e especificação.",
};

interface PageProps {
  searchParams: Promise<{ ids?: string }>;
}

export default async function ComparadorPage({ searchParams }: PageProps) {
  const { ids } = await searchParams;
  
  let initialProducts: Product[] = [];
  if (ids) {
    const idList = ids
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));

    if (idList.length > 0) {
      const dbProducts = await prisma.product.findMany({
        where: {
          id: { in: idList },
        },
      });
      initialProducts = dbProducts.map((p) => ({
        ...p,
        cash_price: p.cash_price.toString(),
        installment_price: p.installment_price.toString(),
        created_at: p.created_at.toISOString(),
      }));
    }
  }

  // Get some default categories that have specs
  const categoriesWithSpecs = await prisma.product.findMany({
    where: {
      category: { not: null },
    },
    select: {
      category: true,
      specs: true,
    },
  });

  const categories = Array.from(
    new Set(
      categoriesWithSpecs
        .filter((c) => c.specs !== null && c.specs !== undefined)
        .map((c) => c.category as string)
        .filter(Boolean)
    )
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <ComparadorClient 
          initialProducts={initialProducts} 
          availableCategories={categories}
        />
      </main>
    </div>
  );
}
