// ===== PACKAGES API (app/api/packages/route.ts) =====

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import sendMail from '@/lib/mailer'; // Import your mailer utility
import { renderEmailTemplate, renderPlainText } from '@/lib/emailTemplate';

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

// app/api/packages/route.ts - ONLY THE POST FUNCTION (leave GET unchanged)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipientId, carrierId, senderId, notes, dateArrived, notificationSent, emailOptions } = body;

    const new_package = await prisma.package.create({
      data: {
        recipientId,
        carrierId: carrierId || null,
        senderId: senderId || null,
        notes: notes || null,
        dateArrived: dateArrived ? new Date(dateArrived) : new Date(),
        notificationSent: notificationSent || false,
      },
      include: { recipient: true },
    });

    // Send email notification if requested
    if (notificationSent && emailOptions && new_package.recipient?.email) {
      try {
        const { subject, body } = emailOptions;
        
        const html = renderEmailTemplate({
          name: new_package.recipient.fullName,
          subject,
          body,
        });

        const text = renderPlainText({
          name: new_package.recipient.fullName,
          body,
        });

        await sendMail({
          to: new_package.recipient.email,
          subject,
          text,
          html,
        });

        console.log(`✓ Notification sent to ${new_package.recipient.email}`);
      } catch (emailError) {
        // Log email failure but don't fail the package creation
        console.error('✗ Failed to send notification email:', emailError);
        // TODO: Consider updating package.notificationSent to false if email fails
      }
    } else if (notificationSent && !new_package.recipient?.email) {
      console.warn(`⚠ Cannot send notification: recipient ${recipientId} has no email on file`);
    }

    return NextResponse.json(new_package, { status: 201 });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}

