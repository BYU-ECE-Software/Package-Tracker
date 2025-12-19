// ===== PACKAGES API (app/api/packages/route.ts) =====

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PackageStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    const skip = (page - 1) * pageSize;
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    
    // Filters
    const status = searchParams.get('status') as PackageStatus | null;
    const studentId = searchParams.get('studentId');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build where clause
    const where: any = {};
    
    if (status) where.status = status;
    if (studentId) where.studentId = studentId;
    
    if (search) {
      where.OR = [
        { trackingNumber: { contains: search, mode: 'insensitive' } },
        { carrier: { contains: search, mode: 'insensitive' } },
        { sender: { contains: search, mode: 'insensitive' } },
        { student: { fullName: { contains: search, mode: 'insensitive' } } },
        { student: { netId: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    if (startDate || endDate) {
      where.dateArrived = {};
      if (startDate) where.dateArrived.gte = new Date(startDate);
      if (endDate) where.dateArrived.lte = new Date(endDate);
    }
    
    // Execute query
    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: order },
        include: {
          student: true,
          checkedInBy: true,
          checkedOutBy: true,
        },
      }),
      prisma.package.count({ where }),
    ]);
    
    return NextResponse.json({
      data: packages,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const new_package = await prisma.package.create({
      data: {
        trackingNumber: body.trackingNumber,
        carrier: body.carrier,
        sender: body.sender,
        expectedArrivalDate: body.expectedArrivalDate ? new Date(body.expectedArrivalDate) : null,
        studentId: body.studentId,
        notes: body.notes,
        location: body.location,
      },
      include: {
        student: true,
      },
    });
    
    return NextResponse.json(new_package, { status: 201 });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { error: 'Failed to create package' },
      { status: 500 }
    );
  }
}


