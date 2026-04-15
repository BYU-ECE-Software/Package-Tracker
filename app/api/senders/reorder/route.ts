import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const orderedIds: unknown = body?.orderedIds;

    if (!Array.isArray(orderedIds) || !orderedIds.every((x) => typeof x === 'string')) {
      return NextResponse.json({ error: 'orderedIds must be a string array' }, { status: 400 });
    }

    const ids = orderedIds as string[];
    const existing = await prisma.sender.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    if (existing.length !== ids.length) {
      return NextResponse.json({ error: 'One or more sender IDs are invalid' }, { status: 400 });
    }

    await prisma.$transaction(
      ids.map((id, idx) => prisma.sender.update({ where: { id }, data: { order: idx } }))
    );

    return NextResponse.json({ reordered: true });
  } catch (error) {
    console.error('Error reordering senders:', error);
    return NextResponse.json({ error: 'Failed to reorder senders' }, { status: 500 });
  }
}
