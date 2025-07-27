import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

import { prisma } from "@/lib/instantiatePrisma"



export async function POST(req: NextRequest) {
  // Fetch all requests ordered by newest first
  const recent = await prisma.request.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      type: true,
      status: true,
      userId: false, // explicitly excluded
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      item: {
        select: {
          serialCode: true,
          status: true,
          product: {
            select: {
              name: true,
              totalQuantity: true,
            },
          },
        },
      },
    },
  });

  // Return the list of recent requests with HTTP 200 OK
  return NextResponse.json({ recent }, { status: 200 });
}

