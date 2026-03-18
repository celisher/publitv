import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const screen = await prisma.screen.findUnique({
      where: { slug: params.slug },
      include: {
        template: true,
        screenPromotions: {
          where: { promotion: { active: true } },
          include: { promotion: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!screen) return NextResponse.json({ error: 'Screen not found' }, { status: 404 });
    if (!screen.active) return NextResponse.json({ error: 'Screen is inactive' }, { status: 403 });

    // Parse category IDs from screen
    const categoryIds: number[] = JSON.parse(screen.categories || '[]');

    // Fetch products for the assigned categories (or all if empty)
    const products = await prisma.product.findMany({
      where: {
        active: true,
        ...(categoryIds.length > 0 ? { categoryId: { in: categoryIds } } : {}),
      },
      include: { category: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });

    // Fetch active categories
    const categories = await prisma.category.findMany({
      where: {
        active: true,
        ...(categoryIds.length > 0 ? { id: { in: categoryIds } } : {}),
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });

    // Fetch app settings
    const settingsArr = await prisma.appSetting.findMany();
    const settings: Record<string, string> = {};
    for (const s of settingsArr) settings[s.key] = s.value;

    const promotions = screen.screenPromotions
      .map((sp) => sp.promotion)
      .filter((p) => {
        const now = new Date();
        if (p.startDate && new Date(p.startDate) > now) return false;
        if (p.endDate && new Date(p.endDate) < now) return false;
        return true;
      });

    return NextResponse.json({
      screen,
      template: screen.template,
      products,
      categories,
      promotions,
      settings,
    });
  } catch (error) {
    console.error('[GET /api/tv/[slug]]', error);
    return NextResponse.json({ error: 'Error loading TV data' }, { status: 500 });
  }
}
