import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();



export async function POST(req: NextRequest) {
  const pending = await prisma.request.findMany({
    where: {
      item: {
        status: {
          in: ['BROKEN', 'UNDER_REPAIR']
        }
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
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

  if (pending.length === 0) {
    return NextResponse.json(
      { message: 'No items are currently unavailable.' },
      { status: 201 }
    );
  }

  return NextResponse.json({ pending }, { status: 201 });
}

