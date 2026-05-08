// ===== ITEM FILE SIGNED URL (app/api/items/[id]/file/url/route.ts) =====
//
// Returns a 1-hour presigned GET URL for the item's file. Verifies the item
// has a file pointer set before signing.

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { minioClient, ITEM_FILES_BUCKET } from '@/lib/minio/client';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // TODO: replace with role-based auth (admin/secretary check)
  try {
    const { id } = await params;

    const item = await prisma.item.findUnique({
      where: { id },
      select: { id: true, file: true },
    });
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    if (!item.file) {
      return NextResponse.json(
        { error: 'Item has no file' },
        { status: 404 },
      );
    }

    const url = await minioClient.presignedGetObject(
      ITEM_FILES_BUCKET,
      item.file,
      SIGNED_URL_TTL_SECONDS,
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Failed to sign item file URL:', error);
    return NextResponse.json(
      { error: 'Failed to sign item file URL' },
      { status: 500 },
    );
  }
}
