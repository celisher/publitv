import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitBroadcast } from '@/lib/socket';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.price !== undefined) data.price = body.price ? parseFloat(body.price) : null;
    if (body.priceUnit !== undefined) data.priceUnit = body.priceUnit;
    if (body.productImage !== undefined) data.productImage = body.productImage;
    if (body.bgImage !== undefined) data.bgImage = body.bgImage;
    if (body.bgColor !== undefined) data.bgColor = body.bgColor;
    if (body.titleColor !== undefined) data.titleColor = body.titleColor;
    if (body.priceColor !== undefined) data.priceColor = body.priceColor;
    if (body.accentColor !== undefined) data.accentColor = body.accentColor;
    if (body.active !== undefined) data.active = body.active;
    if (body.order !== undefined) data.order = body.order;
    if (body.screenId !== undefined) data.screenId = parseInt(body.screenId);

    const slide = await prisma.promoSlide.update({ where: { id }, data });

    // Get the screen slug for socket notification
    const screen = await prisma.screen.findUnique({ where: { id: slide.screenId } });
    if (screen) {
      emitBroadcast('screen:update', { slug: screen.slug });
      emitBroadcast('promoSlides:updated', { action: 'update' });
    }

    return NextResponse.json(slide);
  } catch (error) {
    console.error('[PATCH /api/promo-slides/[id]]', error);
    return NextResponse.json({ error: 'Error updating promo slide' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    const slide = await prisma.promoSlide.findUnique({ where: { id } });
    await prisma.promoSlide.delete({ where: { id } });

    if (slide) {
      const screen = await prisma.screen.findUnique({ where: { id: slide.screenId } });
      if (screen) {
        emitBroadcast('screen:update', { slug: screen.slug });
      }
      emitBroadcast('promoSlides:updated', { action: 'delete' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/promo-slides/[id]]', error);
    return NextResponse.json({ error: 'Error deleting promo slide' }, { status: 500 });
  }
}
