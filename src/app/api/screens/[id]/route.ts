import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitToScreen } from '@/lib/socket';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const screen = await prisma.screen.findUnique({
      where: { id: parseInt(params.id) },
      include: { template: true, screenPromotions: { include: { promotion: true }, orderBy: { order: 'asc' } } },
    });
    if (!screen) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(screen);
  } catch (error) {
    console.error('[GET /api/screens/[id]]', error);
    return NextResponse.json({ error: 'Error fetching screen' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { name, active, templateId, displayMode, rotationInterval, showPrices, categories } = body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim();
    if (active !== undefined) data.active = active;
    if (templateId !== undefined) data.templateId = templateId ? parseInt(templateId) : null;
    if (displayMode !== undefined) data.displayMode = displayMode;
    if (rotationInterval !== undefined) data.rotationInterval = parseInt(rotationInterval);
    if (showPrices !== undefined) data.showPrices = showPrices;
    if (categories !== undefined) data.categories = JSON.stringify(categories);

    const screen = await prisma.screen.update({
      where: { id: parseInt(params.id) },
      data,
      include: { template: true, screenPromotions: { include: { promotion: true }, orderBy: { order: 'asc' } } },
    });

    // Emit update to the specific TV screen
    emitToScreen(screen.slug, 'screen:update', { slug: screen.slug });
    return NextResponse.json(screen);
  } catch (error) {
    console.error('[PATCH /api/screens/[id]]', error);
    return NextResponse.json({ error: 'Error updating screen' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.screen.delete({ where: { id: parseInt(params.id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/screens/[id]]', error);
    return NextResponse.json({ error: 'Error deleting screen' }, { status: 500 });
  }
}
