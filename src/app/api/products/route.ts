import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitBroadcast } from '@/lib/socket';
import { parsePrice } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const active = searchParams.get('active');

    const products = await prisma.product.findMany({
      where: {
        ...(categoryId ? { categoryId: parseInt(categoryId) } : {}),
        ...(active !== null ? { active: active === 'true' } : {}),
      },
      include: { category: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('[GET /api/products]', error);
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, price, description, image, active, featured, order, categoryId } = body;

    if (!name || price === undefined || !categoryId) {
      return NextResponse.json({ error: 'name, price and categoryId are required' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim().toUpperCase(),
        price: parsePrice(String(price)),
        description: description?.trim() || null,
        image: image || null,
        active: active ?? true,
        featured: featured ?? false,
        order: order ?? 0,
        categoryId: parseInt(categoryId),
      },
      include: { category: true },
    });

    // Notify all TV screens to refresh
    emitBroadcast('products:updated', { action: 'create', product });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('[POST /api/products]', error);
    return NextResponse.json({ error: 'Error creating product' }, { status: 500 });
  }
}
