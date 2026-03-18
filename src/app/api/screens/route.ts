import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const screens = await prisma.screen.findMany({
      include: {
        template: true,
        screenPromotions: { include: { promotion: true }, orderBy: { order: 'asc' } },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(screens);
  } catch (error) {
    console.error('[GET /api/screens]', error);
    return NextResponse.json({ error: 'Error fetching screens' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, templateId, displayMode, rotationInterval, showPrices, categories } = body;
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

    const slug = slugify(name);
    const screen = await prisma.screen.create({
      data: {
        name: name.trim(),
        slug,
        active: true,
        templateId: templateId ? parseInt(templateId) : null,
        displayMode: displayMode || 'list',
        rotationInterval: rotationInterval || 8,
        showPrices: showPrices ?? true,
        categories: JSON.stringify(categories || []),
      },
      include: { template: true, screenPromotions: { include: { promotion: true } } },
    });

    return NextResponse.json(screen, { status: 201 });
  } catch (error) {
    console.error('[POST /api/screens]', error);
    return NextResponse.json({ error: 'Error creating screen' }, { status: 500 });
  }
}
