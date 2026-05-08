// ===== SPEND CATEGORIES API (app/api/spend-categories/route.ts) =====

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// "Other" is a reserved code: it's locked from edit/delete, and no other row
// may be created or renamed to match it (case-insensitive).
const OTHER_CODE = 'other';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    const skip = (page - 1) * pageSize;

    const search = searchParams.get('search');
    const visibleParam = searchParams.get('visibleToStudents');

    const where: Prisma.SpendCategoryWhereInput = {};

    if (visibleParam === 'true') where.visibleToStudents = true;
    if (visibleParam === 'false') where.visibleToStudents = false;

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.spendCategory.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { code: 'asc' },
      }),
      prisma.spendCategory.count({ where }),
    ]);

    // Float "Other" to the bottom regardless of alphabetical position.
    const sorted = [...rows].sort((a, b) => {
      const aOther = a.code.toLowerCase() === OTHER_CODE;
      const bOther = b.code.toLowerCase() === OTHER_CODE;
      if (aOther && !bOther) return 1;
      if (!aOther && bOther) return -1;
      return 0;
    });

    return NextResponse.json({
      data: sorted,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching spend categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spend categories' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  // TODO: replace with role-based auth (admin/secretary check)
  try {
    const body = await request.json();

    if (!body.code || !body.description) {
      return NextResponse.json(
        { error: 'code and description are required' },
        { status: 400 },
      );
    }

    if (String(body.code).trim().toLowerCase() === OTHER_CODE) {
      return NextResponse.json(
        { error: '"Other" is a reserved code' },
        { status: 403 },
      );
    }

    const created = await prisma.spendCategory.create({
      data: {
        code: body.code,
        description: body.description,
        visibleToStudents:
          body.visibleToStudents === undefined ? true : Boolean(body.visibleToStudents),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'P2002') {
      return NextResponse.json({ error: 'code must be unique' }, { status: 409 });
    }
    console.error('Error creating spend category:', error);
    return NextResponse.json(
      { error: 'Failed to create spend category' },
      { status: 500 },
    );
  }
}
