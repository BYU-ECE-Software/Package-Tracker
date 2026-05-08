// ===== PROFESSORS API (app/api/professors/route.ts) =====

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

function normalizeEmail(raw: unknown): string | null {
  if (raw === undefined || raw === null) return null;
  const s = String(raw).trim().toLowerCase();
  return s === '' ? null : s;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    const skip = (page - 1) * pageSize;

    const search = searchParams.get('search');
    const where: Prisma.ProfessorWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.professor.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      }),
      prisma.professor.count({ where }),
    ]);

    return NextResponse.json({
      data: rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching professors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professors' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  // TODO: replace with role-based auth (admin/secretary check)
  try {
    const body = await request.json();

    if (!body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: 'firstName and lastName are required' },
        { status: 400 },
      );
    }

    const created = await prisma.professor.create({
      data: {
        firstName: String(body.firstName).trim(),
        lastName: String(body.lastName).trim(),
        title: body.title ? String(body.title).trim() : null,
        email: normalizeEmail(body.email),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating professor:', error);
    return NextResponse.json(
      { error: 'Failed to create professor' },
      { status: 500 },
    );
  }
}
