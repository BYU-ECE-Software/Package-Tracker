import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const senders = await prisma.sender.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(senders);
  } catch (error) {
    console.error('Error fetching senders:', error);
    return NextResponse.json({ error: 'Failed to fetch senders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const maxOrder = await prisma.sender.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    const sender = await prisma.sender.create({
      data: {
        name: body.name,
        isActive: body.isActive ?? true,
        order: nextOrder,
      },
    });

    return NextResponse.json(sender, { status: 201 });
  } catch (error) {
    console.error('Error creating sender:', error);
    return NextResponse.json({ error: 'Failed to create sender' }, { status: 500 });
  }
}
