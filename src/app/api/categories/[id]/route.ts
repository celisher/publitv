import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitBroadcast } from '@/lib/socket';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { name, color, icon, active, order } = body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim();
    if (color !== undefined) data.color = color;
    if (icon !== undefined) data.icon = icon;
    if (active !== undefined) data.active = active;
    if (order !== undefined) data.order = order;
    const category = await prisma.category.update({
      where: { id: parseInt(params.id) },
      data,
      include: { _count: { select: { products: true } } },
    });
    emitBroadcast('categories:updated', { action: 'update', category });
    return NextResponse.json(category);
  } catch (error) {
    console.error('[PATCH /api/categories/[id]]', error);
    return NextResponse.json({ error: 'Error updating category' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.category.delete({ where: { id: parseInt(params.id) } });
    emitBroadcast('categories:updated', { action: 'delete', id: parseInt(params.id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/categories/[id]]', error);
    return NextResponse.json({ error: 'Error deleting category' }, { status: 500 });
  }
}
