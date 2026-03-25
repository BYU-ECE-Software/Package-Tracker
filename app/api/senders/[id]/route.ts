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

    const sender = await prisma.sender.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(sender);
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 });
    }
    console.error('Error updating sender:', error);
    return NextResponse.json({ error: 'Failed to update sender' }, { status: 500 });
  }
}
