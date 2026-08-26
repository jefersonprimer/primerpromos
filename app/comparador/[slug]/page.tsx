import { Metadata } from "next";
import prisma from "@/app/lib/prisma";
import ComparadorClient from "../ComparadorClient";
import { slugify } from "@/app/lib/utils";

import { type Product } from "@/app/components/ProductCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comparador de Produtos | Primer Promos",
  description: "Compare smartphones, notebooks, hardware e muito mais lado a lado para encontrar a melhor oferta e especificação.",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ComparadorSlugPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Extract products from slug parts (e.g. slug-1-vs-slug-2)
  const parts = slug.split(/-vs-/i);

  const allProducts = await prisma.product.findMany({
    select: { id: true, title: true }
  });

  const idList = parts
    .map((part) => {
      const match = allProducts.find((p) => slugify(p.title) === part);
      return match ? match.id : null;
    })
    .filter((id): id is number => id !== null);

  let initialProducts: Product[] = [];
  if (idList.length > 0) {
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: idList },
      },
    });

    // Maintain the order of IDs as requested in the URL slug
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    initialProducts = idList
      .map((id) => productMap.get(id))
      .filter((p): p is NonNullable<typeof p> => !!p)
      .map((p) => ({
        ...p,
        cash_price: p.cash_price.toString(),
        installment_price: p.installment_price.toString(),
        created_at: p.created_at.toISOString(),
        specs: p.specs as Record<string, unknown> | null,
      }));
  }

  // Get categories with specs for filtering
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
