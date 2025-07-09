import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// TO DO IMPLEMENT CHECKING FOR DUPCLITE REQUESTS FOR SAME ITEM. THEY STACK AS OF NOW.

export async function POST(req: NextRequest) {
    
    const { userEmail, serialCode, type = 'BORROW' } = await req.json();

    const user = await prisma.user.findUnique({
         where: { email: userEmail } 
    });

    const organisation = await prisma.organisation.findUnique({ 
        where: { name: "TestOrganisation" } 
    });
    
    const item = await prisma.item.findFirst({
      where: {
        serialCode,
        organisationId: organisation.id,
      },
    });
    
    const request = await prisma.request.create({
      data: {
        userId: user.id,
        itemId: item.id,
        organisationId: organisation.id,
        type,
        status: 'PENDING',
      },
    });


    await prisma.statusLog.create({
      data: {
        requestId: request.id,
        status: 'PENDING',
        changedByName: user.name,
      },
    });

    return NextResponse.json({data: "izobshto ne mi se zanimava"}, {status: 201});

}
