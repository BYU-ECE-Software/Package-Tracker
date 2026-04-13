import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const packageCount = await prisma.package.count({ where: { senderId: id } });
    if (packageCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${packageCount} package${packageCount === 1 ? '' : 's'} use this sender. Consider marking it as hidden instead.` },
        { status: 409 }
      );
    }

    await prisma.sender.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 });
    }
    console.error('Error deleting sender:', error);
    return NextResponse.json({ error: 'Failed to delete sender' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: { name?: string; isActive?: boolean } = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const sender = await prisma.sender.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(sender);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 });
    }
    console.error('Error updating sender:', error);
    return NextResponse.json({ error: 'Failed to update sender' }, { status: 500 });
  }
}
