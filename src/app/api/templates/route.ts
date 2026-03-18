import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error('[GET /api/templates]', error);
    return NextResponse.json({ error: 'Error fetching templates' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, bgColor, overlayColor, primaryColor, secondaryColor,
      priceColor, titleColor, fontStyle, titleSize, priceSize, layout,
      logoPosition, showBanner, bannerText, bannerBgColor, priceGlowIntensity, bgImage } = body;

    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

    const slug = slugify(name);
    const template = await prisma.template.create({
      data: {
        name: name.trim(), slug, description: description || null,
        bgColor: bgColor || '#0d0d0d', overlayColor: overlayColor || 'rgba(0,0,0,0.6)',
        primaryColor: primaryColor || '#ff4500', secondaryColor: secondaryColor || '#d4ac0d',
        priceColor: priceColor || '#ff4500', titleColor: titleColor || '#ffffff',
        fontStyle: fontStyle || 'bold', titleSize: titleSize || '4xl', priceSize: priceSize || '3xl',
        layout: layout || 'grid', logoPosition: logoPosition || 'top-left',
        showBanner: showBanner ?? true, bannerText: bannerText || null,
        bannerBgColor: bannerBgColor || '#c0392b',
        priceGlowIntensity: priceGlowIntensity ?? 40,
        bgImage: bgImage || null, active: true,
      },
    });
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('[POST /api/templates]', error);
    return NextResponse.json({ error: 'Error creating template' }, { status: 500 });
  }
}
