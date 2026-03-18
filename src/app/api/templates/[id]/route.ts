import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitBroadcast } from '@/lib/socket';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const allowed = ['name','description','bgColor','overlayColor','primaryColor','secondaryColor',
      'priceColor','titleColor','fontStyle','titleSize','priceSize','layout','logoPosition',
      'showBanner','bannerText','bannerBgColor','priceGlowIntensity','bgImage','thumbnail','active'];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    const template = await prisma.template.update({ where: { id: parseInt(params.id) }, data });
    emitBroadcast('templates:updated', { action: 'update', template });
    return NextResponse.json(template);
  } catch (error) {
    console.error('[PATCH /api/templates/[id]]', error);
    return NextResponse.json({ error: 'Error updating template' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.template.delete({ where: { id: parseInt(params.id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/templates/[id]]', error);
    return NextResponse.json({ error: 'Error deleting template' }, { status: 500 });
  }
}
