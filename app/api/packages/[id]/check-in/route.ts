// ===== PACKAGE ACTIONS (app/api/packages/[id]/check-in/route.ts) =====

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
        dateArrived: new Date(),
        checkedInById: body.employeeId,
      },
      include: {
        recipient: true,
        checkedInBy: true,
      },
    });
    
    // TODO: Send notification to recipient
    
    return NextResponse.json(updatedPackage);
  } catch (error) {
    console.error('Error checking in package:', error);
    return NextResponse.json(
      { error: 'Failed to check in package' },
      { status: 500 }
    );
  }
}