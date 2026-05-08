// ===== SECRETARIES API (app/api/users/secretaries/route.ts) =====
//
// Dedicated convenience endpoint that returns all SECRETARY users, sorted by
// fullName. Equivalent to GET /api/users?role=SECRETARY but without
// pagination metadata — handy for populating dropdowns (e.g., the
// purchasedBy picker on the order form).

import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const secretaries = await prisma.user.findMany({
      where: { role: Role.SECRETARY },
      orderBy: { fullName: 'asc' },
    });

    return NextResponse.json(secretaries);
  } catch (error) {
    console.error('Error fetching secretaries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch secretaries' },
      { status: 500 },
    );
  }
}
