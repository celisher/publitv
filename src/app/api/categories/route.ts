import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitBroadcast } from '@/lib/socket';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('[GET /api/categories]', error);
    return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, color, icon, active, order } = body;
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

    const slug = slugify(name);
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        color: color || '#c0392b',
        icon: icon || null,
        active: active ?? true,
        order: order ?? 0,
      },
      include: { _count: { select: { products: true } } },
    });

    emitBroadcast('categories:updated', { action: 'create', category });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('[POST /api/categories]', error);
    return NextResponse.json({ error: 'Error creating category' }, { status: 500 });
  }
}
