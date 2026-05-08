// ===== ORDER RECEIPTS UPLOAD/DELETE (app/api/orders/[id]/receipts/route.ts) =====
//
// POST: multipart upload of a single receipt file, appends the generated
//   object key to Order.receipt and returns the updated order.
// DELETE: removes a single filename from Order.receipt and the bucket.
//
// Form field name is "receipt" (matches the column on the Order model,
// following the template's "field name = column name" convention).

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { minioClient, ORDER_RECEIPTS_BUCKET } from '@/lib/minio/client';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// Basic placeholder ceiling — receipts are typically PDFs/photos and rarely
// exceed a few MB. TODO: discuss real limits with stakeholder; consider also
// adding a MIME-type allowlist (PDF + common image formats) and a per-order
// receipt-count cap.
const MAX_RECEIPT_BYTES = 25 * 1024 * 1024; // 25 MB

const ORDER_INCLUDE = {
  items: true,
  user: true,
  vendor: true,
  professor: true,
  spendCategory: true,
  lineMemoOption: true,
  purchasedBy: true,
} as const;

function extFromFilename(name: string) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i).toLowerCase() : '';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // TODO: replace with role-based auth (admin/secretary check)
  try {
    const { id } = await params;

    const existing = await prisma.order.findUnique({
      where: { id },
      select: { id: true, receipt: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const form = await request.formData();
    const file = form.get('receipt');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing file (field name must be 'receipt')" },
        { status: 400 },
      );
    }

    if (file.size > MAX_RECEIPT_BYTES) {
      return NextResponse.json(
        { error: `Receipt exceeds ${MAX_RECEIPT_BYTES / (1024 * 1024)} MB limit` },
        { status: 413 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const objectName = `${randomUUID()}${extFromFilename(file.name)}`;

    await minioClient.putObject(
      ORDER_RECEIPTS_BUCKET,
      objectName,
      buffer,
      buffer.length,
      file.type ? { 'Content-Type': file.type } : undefined,
    );

    const updated = await prisma.order.update({
      where: { id },
      data: { receipt: { set: [...existing.receipt, objectName] } },
      include: ORDER_INCLUDE,
    });

    return NextResponse.json(updated, { status: 201 });
  } catch (error) {
    console.error('Receipt upload failed:', error);
    return NextResponse.json(
      { error: 'Failed to upload receipt' },
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
    const filename = request.nextUrl.searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'filename query param is required' },
        { status: 400 },
      );
    }

    const existing = await prisma.order.findUnique({
      where: { id },
      select: { id: true, receipt: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!existing.receipt.includes(filename)) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    // Best-effort bucket delete — if MinIO is unreachable we still want the
    // DB pointer cleared so the user isn't stuck with a dangling reference.
    // TODO: orphan cleanup. A failed remove here leaks an object in the
    // bucket; add a periodic reconciliation job (or audit script) that lists
    // bucket keys and removes anything not referenced by any Order.receipt
    // or Item.file.
    try {
      await minioClient.removeObject(ORDER_RECEIPTS_BUCKET, filename);
    } catch (mErr) {
      console.error(
        `MinIO delete failed for ${filename} (DB pointer will still be cleared):`,
        mErr,
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { receipt: { set: existing.receipt.filter((f) => f !== filename) } },
      include: ORDER_INCLUDE,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Receipt delete failed:', error);
    return NextResponse.json(
      { error: 'Failed to delete receipt' },
      { status: 500 },
    );
  }
}
