// ===== SINGLE PACKAGE API (app/api/packages/[id]/route.ts) =====


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updatedPackage = await prisma.package.findUnique({
      where: { id },
      include: {
        student: true,
        checkedInBy: true,
        checkedOutBy: true,
      },
    });
    
    if (!updatedPackage) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedPackage);
  } catch (error) {
    console.error('Error fetching package:', error);
    return NextResponse.json(
      { error: 'Failed to fetch package' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};
    
    if (body.carrierId        !== undefined) updateData.carrierId        = body.carrierId;
    if (body.senderId         !== undefined) updateData.senderId         = body.senderId;
    if (body.dateArrived      !== undefined) updateData.dateArrived      = body.dateArrived  ? new Date(body.dateArrived)  : null;
    if (body.datePickedUp     !== undefined) updateData.datePickedUp     = body.datePickedUp ? new Date(body.datePickedUp) : null;
    if (body.checkedInById    !== undefined) updateData.checkedInById    = body.checkedInById;
    if (body.checkedOutById   !== undefined) updateData.checkedOutById   = body.checkedOutById;
    if (body.deliveredToOffice !== undefined) updateData.deliveredToOffice = body.deliveredToOffice;
    if (body.notes            !== undefined) updateData.notes            = body.notes;
    if (body.notificationSent !== undefined) updateData.notificationSent = body.notificationSent;
    
    const updatedPackage = await prisma.package.update({
      where: { id },
      data: updateData,
      include: {
        student: true,
        checkedInBy: true,
        checkedOutBy: true,
      },
    });
    
    return NextResponse.json(updatedPackage);
  } catch (error) {
    console.error('Error updating package:', error);
    return NextResponse.json(
      { error: 'Failed to update package' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.package.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { error: 'Failed to delete package' },
      { status: 500 }
    );
  }
}
