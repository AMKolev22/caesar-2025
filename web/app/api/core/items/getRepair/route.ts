import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

import { prisma } from "@/lib/instantiatePrisma"



export async function POST(req: NextRequest) {
  // Query requests where the related item's status is either BROKEN or UNDER_REPAIR
  const pending = await prisma.request.findMany({
    where: {
      item: {
        status: {
          in: ['BROKEN', 'UNDER_REPAIR']
        }
      },
    },
    // Order the results by creation date descending (most recent first)
    orderBy: {
      createdAt: 'desc',
    },
    // Select specific fields to return in the response
    select: {
      id: true,
      type: true,
      status: true,
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

  // If no matching requests found, return a message indicating no unavailable items
  if (pending.length === 0) {
    return NextResponse.json(
      { message: 'No items are currently unavailable.' },
      { status: 201 }
    );
  }

  // Return the list of pending requests with related user and item info
  return NextResponse.json({ pending }, { status: 201 });
}


