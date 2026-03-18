import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitBroadcast } from '@/lib/socket';
import { parsePrice } from '@/lib/utils';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
      include: { category: true },
    });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error('[GET /api/products/[id]]', error);
    return NextResponse.json({ error: 'Error fetching product' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { name, price, description, image, active, featured, order, categoryId } = body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim().toUpperCase();
    if (price !== undefined) data.price = parsePrice(String(price));
    if (description !== undefined) data.description = description?.trim() || null;
    if (image !== undefined) data.image = image || null;
    if (active !== undefined) data.active = active;
    if (featured !== undefined) data.featured = featured;
    if (order !== undefined) data.order = order;
    if (categoryId !== undefined) data.categoryId = parseInt(categoryId);
    const product = await prisma.product.update({
      where: { id: parseInt(params.id) },
      data,
      include: { category: true },
    });
    emitBroadcast('products:updated', { action: 'update', product });
    return NextResponse.json(product);
  } catch (error) {
    console.error('[PATCH /api/products/[id]]', error);
    return NextResponse.json({ error: 'Error updating product' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({ where: { id: parseInt(params.id) } });
    emitBroadcast('products:updated', { action: 'delete', id: parseInt(params.id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/products/[id]]', error);
    return NextResponse.json({ error: 'Error deleting product' }, { status: 500 });
  }
}
