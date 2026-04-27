// ===== PACKAGES API (app/api/packages/route.ts) =====

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
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
    const recipientId = searchParams.get('recipientId');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const carrierId = searchParams.get('carrierId');
    const senderId = searchParams.get('senderId');

    // Build where clause
    const where: Prisma.PackageWhereInput = {};
    const dateArrived: Prisma.DateTimeFilter = {};

    if (recipientId) where.recipientId = recipientId;
    if (activeOnly) where.datePickedUp = null;
    if (carrierId) where.carrierId = carrierId;
    if (senderId) where.senderId = senderId;

    if (search) {
      where.OR = [
        { carrier: { name: { contains: search, mode: 'insensitive' } } },
        { sender:  { name: { contains: search, mode: 'insensitive' } } },
        { recipient: { fullName: { contains: search, mode: 'insensitive' } } },
        { recipient: { netId:    { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    if (startDate || endDate) {
      if (startDate) dateArrived.gte = new Date(startDate);
      if (endDate) dateArrived.lte = new Date(endDate);
      where.dateArrived = dateArrived;
    }
    
    // Execute query
    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: order },
        include: {
          recipient: true,
          checkedInBy: true,
          checkedOutBy: true,
          carrier: true,
          sender: true,
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
        recipientId: body.recipientId,
        carrierId: body.carrierId ?? null,
        senderId:  body.senderId  ?? null,
        notes:     body.notes     ?? null,
      },
      include: {
        recipient: true,
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


