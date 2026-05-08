// ===== SINGLE ITEM API (app/api/items/[id]/route.ts) =====

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Prisma, Status } from '@prisma/client';
import { prisma } from '@/lib/prisma';

function isStatus(value: unknown): value is Status {
  return typeof value === 'string' && (Object.values(Status) as string[]).includes(value);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // TODO: replace with role-based auth (admin/secretary check)
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Prisma.ItemUncheckedUpdateInput = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.link !== undefined) updateData.link = body.link || null;

    if (body.quantity !== undefined) {
      const q = Number(body.quantity);
      if (!Number.isInteger(q) || q < 1) {
        return NextResponse.json(
          { error: 'quantity must be a positive integer' },
          { status: 400 },
        );
      }
      updateData.quantity = q;
    }

    if (body.status !== undefined) {
      if (!isStatus(body.status)) {
        return NextResponse.json(
          { error: `Invalid status: ${body.status}` },
          { status: 400 },
        );
      }
      updateData.status = body.status;
    }

    // TODO Chunk 3: Item.file mutations move to a dedicated FormData upload route.

    const updated = await prisma.item.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'P2025') {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
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
    await prisma.item.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'P2025') {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 },
    );
  }
}
