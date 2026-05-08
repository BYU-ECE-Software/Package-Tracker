// ===== SINGLE LINE MEMO OPTION API (app/api/line-memo-options/[id]/route.ts) =====

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) ? n : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (id === null) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const row = await prisma.lineMemoOption.findUnique({ where: { id } });
    if (!row) {
      return NextResponse.json(
        { error: 'Line memo option not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(row);
  } catch (error) {
    console.error('Error fetching line memo option:', error);
    return NextResponse.json(
      { error: 'Failed to fetch line memo option' },
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
    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (id === null) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const updateData: Prisma.LineMemoOptionUncheckedUpdateInput = {};
    if (body.description !== undefined) updateData.description = body.description;

    const updated = await prisma.lineMemoOption.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'P2025') {
      return NextResponse.json(
        { error: 'Line memo option not found' },
        { status: 404 },
      );
    }
    console.error('Error updating line memo option:', error);
    return NextResponse.json(
      { error: 'Failed to update line memo option' },
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
    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (id === null) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    await prisma.lineMemoOption.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'P2025') {
      return NextResponse.json(
        { error: 'Line memo option not found' },
        { status: 404 },
      );
    }
    if (code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete: line memo option is in use' },
        { status: 409 },
      );
    }
    console.error('Error deleting line memo option:', error);
    return NextResponse.json(
      { error: 'Failed to delete line memo option' },
      { status: 500 },
    );
  }
}
