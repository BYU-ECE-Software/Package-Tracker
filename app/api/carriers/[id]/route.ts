import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
