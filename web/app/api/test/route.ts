import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    
    const inventory = await prisma.product.findMany({
        include: {
            items: true,
        },
    })
    return NextResponse.json({inventory}, {status: 201});
}
