import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const category = searchParams.get('category') || undefined;

    const skip = (page - 1) * limit;

    const products = await prisma.product.findMany({
      where: category ? { category } : undefined,
      orderBy: {
        created_at: 'desc',
      },
      skip,
      take: limit,
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
