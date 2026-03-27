import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const packageCount = await prisma.package.count({ where: { carrierId: id } });
    if (packageCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${packageCount} package${packageCount === 1 ? '' : 's'} use this carrier. Consider marking it as hidden instead.` },
        { status: 409 }
      );
    }

    await prisma.carrier.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Carrier not found' }, { status: 404 });
    }
    console.error('Error deleting carrier:', error);
    return NextResponse.json({ error: 'Failed to delete carrier' }, { status: 500 });
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

    const carrier = await prisma.carrier.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(carrier);
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Carrier not found' }, { status: 404 });
    }
    console.error('Error updating carrier:', error);
    return NextResponse.json({ error: 'Failed to update carrier' }, { status: 500 });
  }
}
