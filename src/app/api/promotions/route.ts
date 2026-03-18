import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitBroadcast } from '@/lib/socket';

export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(promotions);
  } catch (error) {
    console.error('[GET /api/promotions]', error);
    return NextResponse.json({ error: 'Error fetching promotions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subtitle, image, type, active, priority, startDate, endDate, bgColor, textColor } = body;
    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

    const promotion = await prisma.promotion.create({
      data: {
        title: title.trim(),
        subtitle: subtitle?.trim() || null,
        image: image || null,
        type: type || 'banner',
        active: active ?? true,
        priority: priority ?? 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        bgColor: bgColor || null,
        textColor: textColor || null,
      },
    });

    emitBroadcast('promotions:updated', { action: 'create', promotion });
    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error('[POST /api/promotions]', error);
    return NextResponse.json({ error: 'Error creating promotion' }, { status: 500 });
  }
}
