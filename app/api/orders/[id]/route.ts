// ===== SINGLE ORDER API (app/api/orders/[id]/route.ts) =====

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Prisma, Status } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// PUT does not send emails. Emails on status changes are explicitly
// triggered through POST /api/orders/[id]/notify, which mirrors the
// Package-Tracker convention of separating data updates from notification
// sends (see app/api/notifications/route.ts). The route below preserves
// item edits and field updates only.

const ORDER_INCLUDE = {
  items: true,
  user: true,
  vendor: true,
  professor: true,
  spendCategory: true,
  lineMemoOption: true,
  purchasedBy: true,
} as const;

function isStatus(value: unknown): value is Status {
  return typeof value === 'string' && (Object.values(Status) as string[]).includes(value);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
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

    const updateData: Prisma.OrderUncheckedUpdateInput = {};

    // Scalars
    if (body.requestDate !== undefined) updateData.requestDate = new Date(body.requestDate);
    if (body.purpose !== undefined) updateData.purpose = body.purpose;
    if (body.workTag !== undefined) updateData.workTag = body.workTag;
    if (body.shippingPreference !== undefined) {
      updateData.shippingPreference = body.shippingPreference || null;
    }
    if (body.comment !== undefined) updateData.comment = body.comment || null;
    if (body.cartLink !== undefined) updateData.cartLink = body.cartLink || null;
    if (body.adminComment !== undefined) {
      updateData.adminComment = body.adminComment || null;
    }
    if (body.tax !== undefined) {
      updateData.tax = body.tax === null ? null : Number(body.tax);
    }
    if (body.total !== undefined) {
      updateData.total = body.total === null ? null : Number(body.total);
    }
    if (body.creditCard !== undefined) {
      updateData.creditCard = body.creditCard === null ? null : Boolean(body.creditCard);
    }
    if (body.purchaseDate !== undefined) {
      updateData.purchaseDate = body.purchaseDate ? new Date(body.purchaseDate) : null;
    }

    // Status (explicit; no derivation from items, matching Purchase-Tracker behavior).
    if (body.status !== undefined) {
      if (!isStatus(body.status)) {
        return NextResponse.json(
          { error: `Invalid status: ${body.status}` },
          { status: 400 },
        );
      }
      updateData.status = body.status;
    }

    // Required relations (must remain non-null)
    if (body.vendorId !== undefined) updateData.vendorId = body.vendorId;
    if (body.professorId !== undefined) updateData.professorId = body.professorId;
    if (body.spendCategoryId !== undefined) updateData.spendCategoryId = body.spendCategoryId;
    if (body.userId !== undefined) updateData.userId = body.userId;

    // Optional relations (nullable)
    if (body.lineMemoOptionId !== undefined) {
      updateData.lineMemoOptionId =
        body.lineMemoOptionId === null ? null : Number(body.lineMemoOptionId);
    }
    if (body.purchasedById !== undefined) {
      updateData.purchasedById = body.purchasedById || null;
    }

    // Order.receipt is mutated only via the dedicated upload routes
    // (POST/DELETE /api/orders/:id/receipts). Reject any attempt to set it
    // here so the upload pipeline stays the single source of truth.
    if (body.receipt !== undefined) {
      return NextResponse.json(
        {
          error:
            'receipt is not editable here; use POST/DELETE /api/orders/:id/receipts',
        },
        { status: 400 },
      );
    }

    // Optional inline item updates. Each entry must include `id`; only the
    // listed fields are updated. Status/quantity are validated the same way
    // as the dedicated /api/items/[id] PUT.
    type ItemPatch = {
      id: string;
      name?: string;
      quantity?: number;
      status?: Status;
      link?: string | null;
    };
    let itemPatches: ItemPatch[] = [];
    if (body.items !== undefined) {
      if (!Array.isArray(body.items)) {
        return NextResponse.json(
          { error: 'items must be an array' },
          { status: 400 },
        );
      }
      for (let i = 0; i < body.items.length; i++) {
        const raw = body.items[i] as Record<string, unknown>;
        if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string') {
          return NextResponse.json(
            { error: `items[${i}].id is required` },
            { status: 400 },
          );
        }
        const patch: ItemPatch = { id: raw.id };
        if (raw.name !== undefined) patch.name = String(raw.name);
        if (raw.link !== undefined) patch.link = raw.link ? String(raw.link) : null;
        if (raw.quantity !== undefined) {
          const q = Number(raw.quantity);
          if (!Number.isInteger(q) || q < 1) {
            return NextResponse.json(
              { error: `items[${i}].quantity must be a positive integer` },
              { status: 400 },
            );
          }
          patch.quantity = q;
        }
        if (raw.status !== undefined) {
          if (!isStatus(raw.status)) {
            return NextResponse.json(
              { error: `items[${i}].status is invalid` },
              { status: 400 },
            );
          }
          patch.status = raw.status;
        }
        itemPatches.push(patch);
      }
    }

    // Order update + per-item updates run in a single transaction so a bad
    // item id doesn't leave the order half-updated.
    const updated = await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id }, data: updateData });

      for (const patch of itemPatches) {
        const { id: itemId, ...data } = patch;
        await tx.item.update({
          where: { id: itemId, orderId: id },
          data,
        });
      }

      return tx.order.findUnique({
        where: { id },
        include: ORDER_INCLUDE,
      });
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'P2025') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
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
    // Item.orderId has onDelete: Cascade in the schema, so a single delete
    // call cleans up associated items automatically.
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'P2025') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete: order has dependent records' },
        { status: 409 },
      );
    }
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 },
    );
  }
}
