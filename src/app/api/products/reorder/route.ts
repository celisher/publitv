import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitBroadcast } from '@/lib/socket';

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();
    // items: [{ id: number, order: number }]
    await Promise.all(
      items.map(({ id, order }: { id: number; order: number }) =>
        prisma.product.update({ where: { id }, data: { order } })
      )
    );
    emitBroadcast('products:updated', { action: 'reorder' });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/products/reorder]', error);
    return NextResponse.json({ error: 'Error reordering products' }, { status: 500 });
  }
}
