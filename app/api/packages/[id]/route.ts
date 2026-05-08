// ===== SINGLE PACKAGE API (app/api/packages/[id]/route.ts) =====

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const package_record = await prisma.package.findUnique({
      where: { id },
      include: {
        recipient: true,
        checkedInBy: true,
        checkedOutBy: true,
        pickedUpBy: true,
        carrier: true,
        vendor: true,
        notifications: { orderBy: { sentAt: 'desc' } },
      },
    });

    if (!package_record) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(package_record);
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

    const updateData: Prisma.PackageUncheckedUpdateInput = {};
    
    // Dropdown fields
    if (body.carrierId !== undefined) updateData.carrierId = body.carrierId;
    if (body.vendorId !== undefined) updateData.vendorId = body.vendorId;
    
    // Date fields
    if (body.dateArrived !== undefined && body.dateArrived !== null) {
      updateData.dateArrived = new Date(body.dateArrived);
    }
    if (body.datePickedUp !== undefined) {
      updateData.datePickedUp = body.datePickedUp ? new Date(body.datePickedUp) : null;
    }
    
    // User relationships
    if (body.checkedInById !== undefined) {
      if (!body.checkedInById) {
        return NextResponse.json({ error: 'checkedInById cannot be empty' }, { status: 400 });
      }
      updateData.checkedInById = body.checkedInById;
    }
    if (body.checkedOutById !== undefined) updateData.checkedOutById = body.checkedOutById;
    if (body.pickedUpByUserId !== undefined) updateData.pickedUpByUserId = body.pickedUpByUserId;
    
    // Boolean/status fields
    if (body.deliveredToOffice !== undefined) updateData.deliveredToOffice = body.deliveredToOffice;
    
    // Text fields
    if (body.notes !== undefined) updateData.notes = body.notes;
    
    const updatedPackage = await prisma.package.update({
      where: { id },
      data: updateData,
      include: {
        recipient: true,
        checkedInBy: true,
        checkedOutBy: true,
        pickedUpBy: true,
        carrier: true,
        vendor: true,
        notifications: { orderBy: { sentAt: 'desc' } },
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