import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

import { prisma } from "@/lib/instantiatePrisma"



export async function POST(req: NextRequest) {

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
    if (pending.length == 0)
        return NextResponse.json({message: "No pending requests currently."}, {status: 201});
    return NextResponse.json({pending}, {status: 201});
}
