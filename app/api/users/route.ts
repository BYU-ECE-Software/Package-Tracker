// ===== USERS API (app/api/users/route.ts) =====

import { NextRequest, NextResponse } from 'next/server';
import { Prisma, Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    const skip = (page - 1) * pageSize;
    
    const role = searchParams.get('role') as Role | null;
    const search = searchParams.get('search');
    
    const where: Prisma.UserWhereInput = {};
    
    if (role) where.role = role;
    
    if (search) {
      // Note: email is intentionally excluded — every BYU email contains
      // "byu.edu", so any single letter in the domain matches every user.
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { netId: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch the alphabetical page from the DB, then rank by relevance below.
    // For relevance to be meaningful when paging, we over-fetch slightly so
    // the rank pass has a real candidate pool to reorder.
    const fetchSize = search ? Math.max(pageSize * 3, 30) : pageSize;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: fetchSize,
        orderBy: { fullName: 'asc' },
      }),
      prisma.user.count({ where }),
    ]);

    // Rank: prefix match on fullName (rank 0), word-start match within
    // fullName (rank 1), prefix on netId (rank 2), everything else (rank 3).
    // Stable secondary sort by fullName preserves alphabetical order within
    // each rank.
    const ranked = search
      ? users
          .map((u) => {
            const q = search.toLowerCase();
            const name = u.fullName.toLowerCase();
            const netId = u.netId.toLowerCase();
            let rank = 3;
            if (name.startsWith(q)) rank = 0;
            else if (name.split(/\s+/).some((w) => w.startsWith(q))) rank = 1;
            else if (netId.startsWith(q)) rank = 2;
            return { user: u, rank };
          })
          .sort((a, b) => a.rank - b.rank)
          .slice(0, pageSize)
          .map((r) => r.user)
      : users;

    return NextResponse.json({
      data: ranked,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const user = await prisma.user.create({
      data: {
        netId: body.netId,
        email: body.email,
        fullName: body.fullName,
        role: body.role || 'STUDENT',
      },
    });
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
