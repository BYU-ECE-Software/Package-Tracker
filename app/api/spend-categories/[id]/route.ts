// ===== SINGLE SPEND CATEGORY API (app/api/spend-categories/[id]/route.ts) =====

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const OTHER_CODE = 'other';
const isOther = (code: string) => code.trim().toLowerCase() === OTHER_CODE;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const row = await prisma.spendCategory.findUnique({ where: { id } });

    if (!row) {
      return NextResponse.json({ error: 'Spend category not found' }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (error) {
    console.error('Error fetching spend category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spend category' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // TODO: replace with role-based auth (admin/secretary check)
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.spendCategory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Spend category not found' }, { status: 404 });
    }

    if (isOther(existing.code)) {
      return NextResponse.json(
        { error: 'The "Other" category cannot be edited' },
        { status: 403 },
      );
    }

    if (body.code !== undefined && isOther(String(body.code))) {
      return NextResponse.json(
        { error: '"Other" is a reserved code' },
        { status: 403 },
      );
    }

    const updateData: Prisma.SpendCategoryUncheckedUpdateInput = {};
    if (body.code !== undefined) updateData.code = body.code;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.visibleToStudents !== undefined) {
      updateData.visibleToStudents = Boolean(body.visibleToStudents);
    }

    const updated = await prisma.spendCategory.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'P2025') {
      return NextResponse.json({ error: 'Spend category not found' }, { status: 404 });
    }
    if (code === 'P2002') {
      return NextResponse.json({ error: 'code must be unique' }, { status: 409 });
    }
    console.error('Error updating spend category:', error);
    return NextResponse.json(
      { error: 'Failed to update spend category' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // TODO: replace with role-based auth (admin/secretary check)
  try {
    const { id } = await params;

    const existing = await prisma.spendCategory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Spend category not found' }, { status: 404 });
    }

    if (isOther(existing.code)) {
      return NextResponse.json(
        { error: 'The "Other" category cannot be deleted' },
        { status: 403 },
      );
    }

    await prisma.spendCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'P2025') {
      return NextResponse.json({ error: 'Spend category not found' }, { status: 404 });
    }
    if (code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete: spend category is in use' },
        { status: 409 },
      );
    }
    console.error('Error deleting spend category:', error);
    return NextResponse.json(
      { error: 'Failed to delete spend category' },
      { status: 500 },
    );
  }
}
