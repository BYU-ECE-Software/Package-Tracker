import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const WINDOW_DAYS = 7;

export async function GET() {
  try {
    const since = new Date();
    since.setDate(since.getDate() - WINDOW_DAYS);

    // Aggregate packages received in the last WINDOW_DAYS by recipient.
    // Most packages first, most-recent arrival as tiebreaker.
    const grouped = await prisma.package.groupBy({
      by: ['recipientId'],
      where: { dateArrived: { gte: since } },
      _count: { _all: true },
      _max: { dateArrived: true },
      orderBy: [
        { _count: { recipientId: 'desc' } },
        { _max: { dateArrived: 'desc' } },
      ],
    });

    if (grouped.length === 0) {
      return NextResponse.json([]);
    }

    const users = await prisma.user.findMany({
      where: { id: { in: grouped.map((g) => g.recipientId) } },
    });

    // Preserve the aggregation's ranking order
    const userById = new Map(users.map((u) => [u.id, u]));
    const ordered = grouped
      .map((g) => userById.get(g.recipientId))
      .filter((u): u is NonNullable<typeof u> => Boolean(u));

    return NextResponse.json(ordered);
  } catch (error) {
    console.error('Error fetching top recipients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top recipients' },
      { status: 500 },
    );
  }
}
