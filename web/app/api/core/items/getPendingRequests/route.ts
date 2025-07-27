import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

import { prisma } from "@/lib/instantiatePrisma"



export async function POST(req: NextRequest) {
  // Fetch all requests with status 'PENDING', ordered by newest first
  const pending = await prisma.request.findMany({
    where: {
      status: 'PENDING',
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      type: true,
      status: true,
      userId: false, // explicitly excluded userId
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

  // If no pending requests, return a message
  if (pending.length === 0)
    return NextResponse.json(
      { message: "No pending requests currently." },
      { status: 200 } // 200 OK is more suitable here than 201 (Created)
    );

  // Return list of pending requests
  return NextResponse.json({ pending }, { status: 200 });
}

