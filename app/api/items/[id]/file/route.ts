// ===== ITEM FILE UPLOAD/DELETE (app/api/items/[id]/file/route.ts) =====
//
// POST: multipart upload of a single item file (replaces any existing file).
// DELETE: clears Item.file and removes the bucket object.
//
// Form field name is "file" (matches the column on the Item model).

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { minioClient, ITEM_FILES_BUCKET } from '@/lib/minio/client';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// Basic placeholder ceiling — item attachments are usually datasheets,
// quotes, or screenshots. TODO: discuss real limits with stakeholder;
// consider a MIME-type allowlist as well.
const MAX_ITEM_FILE_BYTES = 25 * 1024 * 1024; // 25 MB

function extFromFilename(name: string) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i).toLowerCase() : '';
}

// TODO: orphan cleanup. A failed remove here leaks the object in the bucket
// (and a successful upload-then-DB-failure would too). Add a periodic
// reconciliation job that lists bucket keys and removes anything not
// referenced by any Item.file or Order.receipt.
async function bestEffortRemove(objectName: string | null | undefined) {
  if (!objectName) return;
  try {
    await minioClient.removeObject(ITEM_FILES_BUCKET, objectName);
  } catch (mErr) {
    console.error(
      `MinIO delete failed for ${objectName} (DB will still be updated):`,
      mErr,
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // TODO: replace with role-based auth (admin/secretary check)
  try {
    const { id } = await params;

    const existing = await prisma.item.findUnique({
      where: { id },
      select: { id: true, file: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const form = await request.formData();
    const file = form.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing file (field name must be 'file')" },
        { status: 400 },
      );
    }

    if (file.size > MAX_ITEM_FILE_BYTES) {
      return NextResponse.json(
        { error: `File exceeds ${MAX_ITEM_FILE_BYTES / (1024 * 1024)} MB limit` },
        { status: 413 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const objectName = `${randomUUID()}${extFromFilename(file.name)}`;

    await minioClient.putObject(
      ITEM_FILES_BUCKET,
      objectName,
      buffer,
      buffer.length,
      file.type ? { 'Content-Type': file.type } : undefined,
    );

    const updated = await prisma.item.update({
      where: { id },
      data: { file: objectName },
    });

    // Clean up the previous object after the DB pointer has moved.
    await bestEffortRemove(existing.file);

    return NextResponse.json(updated, { status: 201 });
  } catch (error) {
    console.error('Item file upload failed:', error);
    return NextResponse.json(
      { error: 'Failed to upload item file' },
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

    const existing = await prisma.item.findUnique({
      where: { id },
      select: { id: true, file: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    if (!existing.file) {
      return NextResponse.json(
        { error: 'Item has no file to delete' },
        { status: 404 },
      );
    }

    await bestEffortRemove(existing.file);

    const updated = await prisma.item.update({
      where: { id },
      data: { file: null },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Item file delete failed:', error);
    return NextResponse.json(
      { error: 'Failed to delete item file' },
      { status: 500 },
    );
  }
}
