// ===== LINE MEMO OPTIONS API (app/api/line-memo-options/route.ts) =====
//
// NOTE: LineMemoOption.id is an Int (manually entered Workday code), not a
// CUID like every other entity in this app. Routes use parseInt for the id.

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    const skip = (page - 1) * pageSize;

    const search = searchParams.get('search');
    const where: Prisma.LineMemoOptionWhereInput = {};

    if (search) {
      where.description = { contains: search, mode: 'insensitive' };
    }

    const [rows, total] = await Promise.all([
      prisma.lineMemoOption.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { id: 'asc' },
      }),
      prisma.lineMemoOption.count({ where }),
    ]);

    return NextResponse.json({
      data: rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching line memo options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch line memo options' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  // TODO: replace with role-based auth (admin/secretary check)
  try {
    const body = await request.json();

    const id = Number(body.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { error: 'id must be an integer (Workday memo code)' },
        { status: 400 },
      );
    }
    if (!body.description) {
      return NextResponse.json({ error: 'description is required' }, { status: 400 });
    }

    const created = await prisma.lineMemoOption.create({
      data: { id, description: body.description },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'P2002') {
      return NextResponse.json({ error: 'id must be unique' }, { status: 409 });
    }
    console.error('Error creating line memo option:', error);
    return NextResponse.json(
      { error: 'Failed to create line memo option' },
      { status: 500 },
    );
  }
}
