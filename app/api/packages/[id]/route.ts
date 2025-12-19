// ===== SINGLE PACKAGE API (app/api/packages/[id]/route.ts) =====


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const package = await prisma.package.findUnique({
      where: { id: params.id },
      include: {
        student: true,
        checkedInBy: true,
        checkedOutBy: true,
      },
    });
    
    if (!package) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(package);
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const updateData: any = {};
    
    if (body.trackingNumber !== undefined) updateData.trackingNumber = body.trackingNumber;
    if (body.carrier !== undefined) updateData.carrier = body.carrier;
    if (body.sender !== undefined) updateData.sender = body.sender;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.expectedArrivalDate !== undefined) {
      updateData.expectedArrivalDate = body.expectedArrivalDate ? new Date(body.expectedArrivalDate) : null;
    }
    if (body.dateArrived !== undefined) {
      updateData.dateArrived = body.dateArrived ? new Date(body.dateArrived) : null;
    }
    if (body.datePickedUp !== undefined) {
      updateData.datePickedUp = body.datePickedUp ? new Date(body.datePickedUp) : null;
    }
    if (body.checkedInById !== undefined) updateData.checkedInById = body.checkedInById;
    if (body.checkedOutById !== undefined) updateData.checkedOutById = body.checkedOutById;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.notificationSent !== undefined) updateData.notificationSent = body.notificationSent;
    
    const package = await prisma.package.update({
      where: { id: params.id },
      data: updateData,
      include: {
        student: true,
        checkedInBy: true,
        checkedOutBy: true,
      },
    });
    
    return NextResponse.json(package);
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
  { params }: { params: { id: string } }
) {
  try {
    await prisma.package.delete({
      where: { id: params.id },
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
