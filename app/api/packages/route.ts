// ===== PACKAGES API (app/api/packages/route.ts) =====

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sendAndLogNotification } from '@/lib/notifications/send';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    const skip = (page - 1) * pageSize;

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'dateArrived';
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
          notifications: { orderBy: { sentAt: 'desc' } },
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
    const {
      recipientId,
      carrierId,
      senderId,
      notes,
      dateArrived,
      checkedInById,
      emailOptions,
    } = body;

    if (!recipientId || !checkedInById) {
      return NextResponse.json(
        { error: 'recipientId and checkedInById are required' },
        { status: 400 }
      );
    }

    const new_package = await prisma.package.create({
      data: {
        recipientId,
        carrierId: carrierId || null,
        senderId: senderId || null,
        notes: notes || null,
        dateArrived: dateArrived ? new Date(dateArrived) : new Date(),
        checkedInById,
      },
      include: { recipient: true },
    });

    // Send + log the arrival notification if requested. Notification failures
    // are isolated from the package-create response: the package already
    // exists, so failing the request would mislead the client into retrying
    // and creating duplicates. The user can resend manually from SendEmailModal.
    if (emailOptions && new_package.recipient?.email) {
      try {
        await sendAndLogNotification({
          packageId: new_package.id,
          recipientId: new_package.recipientId,
          recipientEmail: new_package.recipient.email,
          recipientName: new_package.recipient.fullName,
          type: 'ARRIVAL',
          subject: emailOptions.subject,
          body: emailOptions.body,
        });
      } catch (mailError) {
        console.error(
          `Notification failed for package ${new_package.id} (package was created):`,
          mailError,
        );
      }
    } else if (emailOptions && !new_package.recipient?.email) {
      console.warn(`Cannot send notification: recipient ${recipientId} has no email on file`);
    }

    return NextResponse.json(new_package, { status: 201 });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}