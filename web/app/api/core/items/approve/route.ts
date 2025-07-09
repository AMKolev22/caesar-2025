import { NextRequest, NextResponse } from 'next/server';
import { ItemStatus, PrismaClient, RequestStatus } from '@/generated/prisma';

const prisma = new PrismaClient();


export async function POST(req: NextRequest) {
    
    const { requestId } = await req.json();

    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { item: true, user: true },
    });

     await prisma.item.update({
      where: { id: request.itemId },
      data: {
        assignedTo: request.userId,
        status: ItemStatus.IN_USE,
      },
    });

    await prisma.request.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.APPROVED,
      },
    });
    return NextResponse.json({message: "successfully"});
}
