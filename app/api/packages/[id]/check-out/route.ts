// ===== PACKAGE CHECKOUT (app/api/packages/[id]/check-out/route.ts) =====

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        datePickedUp: new Date(),
        checkedOutById: body.employeeId,
      },
      include: {
        recipient: true,
        checkedOutBy: true,
      },
    });
    
    return NextResponse.json(updatedPackage);
  } catch (error) {
    console.error('Error checking out package:', error);
    return NextResponse.json(
      { error: 'Failed to check out package' },
      { status: 500 }
    );
  }
}