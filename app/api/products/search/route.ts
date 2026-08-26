import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const requireSpecs = searchParams.get('requireSpecs') === 'true';
    const category = searchParams.get('category') || undefined;

    const products = await prisma.product.findMany({
      where: {
        AND: [
          category ? { category } : {},
          query ? { title: { contains: query, mode: 'insensitive' } } : {},
        ]
      },
      take: 50,
    });

    // Filter out products without specifications if required
    const filteredProducts = requireSpecs
      ? products.filter((p) => p.specs !== null && p.specs !== undefined)
      : products;

    const formattedProducts = filteredProducts
      .slice(0, 20)
      .map((p) => ({
        ...p,
        cash_price: p.cash_price.toString(),
        installment_price: p.installment_price.toString(),
        created_at: p.created_at.toISOString(),
      }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
