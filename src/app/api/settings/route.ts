import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitBroadcast } from '@/lib/socket';

export async function GET() {
  try {
    const settings = await prisma.appSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    return NextResponse.json(map);
  } catch (error) {
    console.error('[GET /api/settings]', error);
    return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // body: { key: value, key2: value2, ... }
    const updates = await Promise.all(
      Object.entries(body).map(([key, value]) =>
        prisma.appSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );
    emitBroadcast('settings:updated', body);
    return NextResponse.json({ success: true, updated: updates.length });
  } catch (error) {
    console.error('[POST /api/settings]', error);
    return NextResponse.json({ error: 'Error updating settings' }, { status: 500 });
  }
}
