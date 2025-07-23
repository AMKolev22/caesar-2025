import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const { productName } = await req.json();
    const detailedProduct = await prisma.product.findUnique({
      where: { name: productName },
      include: {
        items: {
          include: {
            requests: {
              include: {
                user: {
                    select:{
                        name: true,
                        email: true,
                    }
                }
              },
            },
          },
        },
      },
    });

    return NextResponse.json({detailedProduct}, {status: 201});

}
