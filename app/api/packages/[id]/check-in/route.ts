// ===== PACKAGE ACTIONS (app/api/packages/[id]/check-in/route.ts) =====

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
        status: 'ARRIVED',
        dateArrived: new Date(),
        checkedInById: body.employeeId,
        location: body.location,
      },
      include: {
        student: true,
        checkedInBy: true,
      },
    });
    
    // TODO: Send notification to student
    
    return NextResponse.json(package);
  } catch (error) {
    console.error('Error checking in package:', error);
    return NextResponse.json(
      { error: 'Failed to check in package' },
      { status: 500 }
    );
  }
}