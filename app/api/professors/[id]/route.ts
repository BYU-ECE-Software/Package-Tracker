// ===== SINGLE PROFESSOR API (app/api/professors/[id]/route.ts) =====

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

function normalizeEmail(raw: unknown): string | null {
  if (raw === undefined || raw === null) return null;
  const s = String(raw).trim().toLowerCase();
  return s === '' ? null : s;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const row = await prisma.professor.findUnique({ where: { id } });

    if (!row) {
      return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (error) {
    console.error('Error fetching professor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professor' },
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

    const updateData: Prisma.ProfessorUncheckedUpdateInput = {};
    if (body.firstName !== undefined) updateData.firstName = String(body.firstName).trim();
    if (body.lastName !== undefined) updateData.lastName = String(body.lastName).trim();
    if (body.title !== undefined) {
      updateData.title = body.title ? String(body.title).trim() : null;
    }
    if (body.email !== undefined) updateData.email = normalizeEmail(body.email);

    const updated = await prisma.professor.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'P2025') {
      return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }
    console.error('Error updating professor:', error);
    return NextResponse.json(
      { error: 'Failed to update professor' },
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
    await prisma.professor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'P2025') {
      return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }
    if (code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete: professor is referenced by orders' },
        { status: 409 },
      );
    }
    console.error('Error deleting professor:', error);
    return NextResponse.json(
      { error: 'Failed to delete professor' },
      { status: 500 },
    );
  }
}
