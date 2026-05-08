// ===== ORDERS BY USER API (app/api/orders/user/[userId]/route.ts) =====

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ORDER_INCLUDE = {
  items: true,
  user: true,
  vendor: true,
  professor: true,
  spendCategory: true,
  lineMemoOption: true,
  purchasedBy: true,
} as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;

    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { requestDate: 'desc' },
      include: ORDER_INCLUDE,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders for user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 },
    );
  }
}
