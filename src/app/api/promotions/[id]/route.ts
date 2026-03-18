import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitBroadcast } from '@/lib/socket';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const allowed = ['title','subtitle','image','type','active','priority','startDate','endDate','bgColor','textColor'];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        if (key === 'startDate' || key === 'endDate') {
          data[key] = body[key] ? new Date(body[key]) : null;
        } else {
          data[key] = body[key];
        }
      }
    }
    const promotion = await prisma.promotion.update({ where: { id: parseInt(params.id) }, data });
    emitBroadcast('promotions:updated', { action: 'update', promotion });
    return NextResponse.json(promotion);
  } catch (error) {
    console.error('[PATCH /api/promotions/[id]]', error);
    return NextResponse.json({ error: 'Error updating promotion' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.promotion.delete({ where: { id: parseInt(params.id) } });
    emitBroadcast('promotions:updated', { action: 'delete', id: parseInt(params.id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/promotions/[id]]', error);
    return NextResponse.json({ error: 'Error deleting promotion' }, { status: 500 });
  }
}
