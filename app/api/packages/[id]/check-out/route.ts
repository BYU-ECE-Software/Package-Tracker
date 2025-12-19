// ===== PACKAGE CHECKOUT (app/api/packages/[id]/check-out/route.ts) =====

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const package = await prisma.package.update({
      where: { id: params.id },
      data: {
        status: 'PICKED_UP',
        datePickedUp: new Date(),
        checkedOutById: body.employeeId,
      },
      include: {
        student: true,
        checkedOutBy: true,
      },
    });
    
    return NextResponse.json(package);
  } catch (error) {
    console.error('Error checking out package:', error);
    return NextResponse.json(
      { error: 'Failed to check out package' },
      { status: 500 }
    );
  }
}