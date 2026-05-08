// ===== ORDER RECEIPT SIGNED URL (app/api/orders/[id]/receipts/[filename]/url/route.ts) =====
//
// Returns a 1-hour presigned GET URL for a single receipt. Verifies the
// filename is actually associated with the order before signing so we don't
// hand out URLs to arbitrary bucket objects.

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { minioClient, ORDER_RECEIPTS_BUCKET } from '@/lib/minio/client';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; filename: string }> },
) {
  // TODO: replace with role-based auth (admin/secretary check)
  try {
    const { id, filename: rawFilename } = await params;
    const filename = decodeURIComponent(rawFilename);

    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, receipt: true },
    });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (!order.receipt.includes(filename)) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    const url = await minioClient.presignedGetObject(
      ORDER_RECEIPTS_BUCKET,
      filename,
      SIGNED_URL_TTL_SECONDS,
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Failed to sign receipt URL:', error);
    return NextResponse.json(
      { error: 'Failed to sign receipt URL' },
      { status: 500 },
    );
  }
}
