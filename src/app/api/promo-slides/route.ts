import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitBroadcast } from '@/lib/socket';

export async function GET(req: NextRequest) {
  const screenId = req.nextUrl.searchParams.get('screenId');

  const where = screenId ? { screenId: parseInt(screenId) } : {};

  const slides = await prisma.promoSlide.findMany({
    where,
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { screen: { select: { id: true, name: true, slug: true } } },
  });

  return NextResponse.json(slides);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const slide = await prisma.promoSlide.create({
      data: {
        screenId: parseInt(body.screenId),
        title: body.title,
        price: body.price ? parseFloat(body.price) : null,
        priceUnit: body.priceUnit || '$/kg',
        productImage: body.productImage || null,
        bgImage: body.bgImage || null,
        bgColor: body.bgColor || '#c0392b',
        titleColor: body.titleColor || '#ffffff',
        priceColor: body.priceColor || '#ffdd00',
        accentColor: body.accentColor || '#d4ac0d',
        active: body.active ?? true,
        order: body.order ?? 0,
      },
    });

    // Notify TV screens
    const screen = await prisma.screen.findUnique({ where: { id: parseInt(body.screenId) } });
    if (screen) {
      emitBroadcast('screen:update', { slug: screen.slug });
      emitBroadcast('promoSlides:updated', { action: 'create' });
    }

    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    console.error('[POST /api/promo-slides]', error);
    return NextResponse.json({ error: 'Error creating promo slide' }, { status: 500 });
  }
}
