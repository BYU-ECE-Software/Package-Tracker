// ===== ORDERS API (app/api/orders/route.ts) =====

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Prisma, Status } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sendOrderEmail } from '@/lib/notifications/sendOrderEmail';
import { buildDefaultOrderEmail } from '@/lib/notifications/orderEmailTemplates';

const ORDER_INCLUDE = {
  items: true,
  user: true,
  vendor: true,
  professor: true,
  spendCategory: true,
  lineMemoOption: true,
  purchasedBy: true,
} as const;

// Map a sort key to a Prisma orderBy clause. Whitelisted to avoid exposing
// arbitrary columns through the query string.
function buildOrderBy(
  sortBy: string | null,
  order: 'asc' | 'desc',
): Prisma.OrderOrderByWithRelationInput {
  switch (sortBy) {
    case 'status':
      return { status: order };
    case 'purchaseDate':
      return { purchaseDate: order };
    case 'vendor':
      return { vendor: { name: order } };
    case 'shippingPreference':
      return { shippingPreference: order };
    case 'studentName':
      return { user: { fullName: order } };
    case 'professor':
      return { professor: { lastName: order } };
    case 'total':
      return { total: order };
    case 'requestDate':
    default:
      return { requestDate: order };
  }
}

function isStatus(value: unknown): value is Status {
  return typeof value === 'string' && (Object.values(Status) as string[]).includes(value);
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;

    const page = parseInt(sp.get('page') || '1');
    const pageSize = parseInt(sp.get('pageSize') || '25');
    const skip = (page - 1) * pageSize;

    const sortBy = sp.get('sortBy');
    const order = sp.get('order') === 'asc' ? 'asc' : 'desc';

    const status = sp.get('status');
    const userId = sp.get('userId');
    const professorId = sp.get('professorId');
    const spendCategoryId = sp.get('spendCategoryId');
    const vendorId = sp.get('vendorId');
    const purchasedById = sp.get('purchasedById');
    const startDate = sp.get('startDate');
    const endDate = sp.get('endDate');
    const query = sp.get('query');

    const where: Prisma.OrderWhereInput = {};
    const requestDate: Prisma.DateTimeFilter = {};

    if (status) {
      if (!isStatus(status)) {
        return NextResponse.json(
          { error: `Invalid status: ${status}` },
          { status: 400 },
        );
      }
      where.status = status;
    }
    if (userId) where.userId = userId;
    if (professorId) where.professorId = professorId;
    if (spendCategoryId) where.spendCategoryId = spendCategoryId;
    if (vendorId) where.vendorId = vendorId;
    if (purchasedById) where.purchasedById = purchasedById;

    if (startDate) requestDate.gte = new Date(startDate);
    if (endDate) requestDate.lte = new Date(endDate);
    if (startDate || endDate) where.requestDate = requestDate;

    if (query) {
      const orFilters: Prisma.OrderWhereInput[] = [
        { vendor: { name: { contains: query, mode: 'insensitive' } } },
        { user: { fullName: { contains: query, mode: 'insensitive' } } },
        { user: { netId: { contains: query, mode: 'insensitive' } } },
        { user: { email: { contains: query, mode: 'insensitive' } } },
        { professor: { firstName: { contains: query, mode: 'insensitive' } } },
        { professor: { lastName: { contains: query, mode: 'insensitive' } } },
        { items: { some: { name: { contains: query, mode: 'insensitive' } } } },
      ];

      // Status keyword match (e.g., "purchased" -> Status.PURCHASED).
      const upper = query.trim().toUpperCase();
      if (isStatus(upper)) orFilters.push({ status: upper });

      // Numeric total match: strip "$", commas, whitespace.
      const numeric = Number(query.replace(/[$,\s]/g, ''));
      if (Number.isFinite(numeric)) orFilters.push({ total: numeric });

      where.OR = orFilters;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [buildOrderBy(sortBy, order), { createdAt: 'desc' }],
        include: ORDER_INCLUDE,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      data: orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  // Public endpoint: anyone with the form URL can submit a request.
  // TODO: revisit when real auth lands. Once OIT auth is wired, drop the
  // fullName/netId/email body fields and resolve the requester from the
  // session instead of connectOrCreate.
  try {
    const body = await request.json();

    // Required scalars
    const required = [
      'requestDate',
      'vendorId',
      'professorId',
      'spendCategoryId',
      'purpose',
      'workTag',
      'fullName',
      'netId',
      'email',
    ] as const;
    for (const k of required) {
      if (!body[k]) {
        return NextResponse.json({ error: `${k} is required` }, { status: 400 });
      }
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'items must be a non-empty array' },
        { status: 400 },
      );
    }

    // Validate item shapes up front so the create call doesn't half-succeed.
    const items = body.items.map((raw: unknown, i: number) => {
      const item = raw as Record<string, unknown>;
      if (!item || typeof item !== 'object') {
        throw new Error(`items[${i}] must be an object`);
      }
      if (!item.name || typeof item.name !== 'string') {
        throw new Error(`items[${i}].name is required`);
      }
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error(`items[${i}].quantity must be a positive integer`);
      }
      const status = item.status === undefined ? Status.REQUESTED : item.status;
      if (!isStatus(status)) {
        throw new Error(`items[${i}].status is invalid`);
      }
      return {
        name: item.name,
        quantity,
        status,
        link: typeof item.link === 'string' && item.link ? item.link : null,
        // file is intentionally not accepted here; uploads land in Chunk 3.
      };
    });

    const netId = String(body.netId).toLowerCase().trim();
    const email = String(body.email).toLowerCase().trim();

    const created = await prisma.order.create({
      data: {
        requestDate: new Date(body.requestDate),
        purpose: body.purpose,
        workTag: body.workTag,
        shippingPreference: body.shippingPreference || null,
        comment: body.comment || null,
        cartLink: body.cartLink || null,
        tax: body.tax === undefined || body.tax === null ? null : Number(body.tax),
        total:
          body.total === undefined || body.total === null ? null : Number(body.total),
        status: Status.REQUESTED,

        vendor: { connect: { id: body.vendorId } },
        professor: { connect: { id: body.professorId } },
        spendCategory: { connect: { id: body.spendCategoryId } },
        ...(body.lineMemoOptionId
          ? { lineMemoOption: { connect: { id: Number(body.lineMemoOptionId) } } }
          : {}),

        user: {
          connectOrCreate: {
            where: { netId },
            create: {
              netId,
              email,
              fullName: body.fullName,
            },
          },
        },

        items: { create: items },
      },
      include: ORDER_INCLUDE,
    });

    // Optionally send a "request received" email. Failures are isolated
    // from the create response so the client doesn't retry and create a
    // duplicate order; the user can resend manually if needed.
    const emailOptions = body.emailOptions as
      | { subject?: string; body?: string }
      | undefined;
    if (emailOptions && created.user?.email) {
      const defaults = buildDefaultOrderEmail('ORDER_REQUESTED', {
        orderId: created.id,
        vendorName: created.vendor?.name ?? null,
        total: created.total,
      });
      try {
        await sendOrderEmail({
          orderId: created.id,
          recipientEmail: created.user.email,
          recipientName: created.user.fullName,
          type: 'ORDER_REQUESTED',
          subject: emailOptions.subject ?? defaults.subject,
          body: emailOptions.body ?? defaults.body,
        });
      } catch (mailError) {
        console.error(
          `Order-requested email failed for order ${created.id} (order was created):`,
          mailError,
        );
      }
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith('items[')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const code = (error as { code?: string })?.code;
    if (code === 'P2025') {
      // FK target missing (vendor, professor, spend category, or line memo).
      return NextResponse.json(
        { error: 'Referenced record not found (vendor, professor, spend category, or line memo)' },
        { status: 400 },
      );
    }
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 },
    );
  }
}
