import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();



export async function POST(req: NextRequest) {
    const recent = await prisma.request.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            id: true,
            userId: false,
            user: {
                select: {
                    email: true,
                    name: true,
                }
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
    return NextResponse.json({recent}, {status: 201});
}
