import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const packageCount = await prisma.package.count({ where: { vendorId: id } });
    if (packageCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${packageCount} package${packageCount === 1 ? '' : 's'} use this vendor. Consider marking it as hidden instead.` },
        { status: 409 }
      );
    }

    await prisma.vendor.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }
    console.error('Error deleting vendor:', error);
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: { name?: string; hidden?: boolean } = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.hidden !== undefined) updateData.hidden = body.hidden;

    const vendor = await prisma.vendor.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(vendor);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }
    console.error('Error updating vendor:', error);
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}
