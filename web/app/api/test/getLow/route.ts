import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    
    const inventory = await prisma.product.findMany({
        where: {
            totalQuantity: {
                lt: 5
            },
        },
        include: {
            items: false,
        },
    })
    return NextResponse.json({inventory}, {status: 201});
}
