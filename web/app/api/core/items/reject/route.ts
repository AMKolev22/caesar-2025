import { NextRequest, NextResponse } from 'next/server';
import { ItemStatus, PrismaClient, RequestStatus } from '@/generated/prisma';
import { text } from 'stream/consumers';

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
        status: ItemStatus.AVAILABLE,
      },
    });

    await prisma.request.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.DENIED,
      },
    });

    const res = await fetch("http://localhost:3000/api/smtp", {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ to: request?.user.email, subject: "Your request was approved", html: `<p>Hello, ${request?.user.name}. The status of your request for <b>${request?.item.serialCode}</b> was changed to <b>${request?.status}</b></p>`, text: "Nodejs" }),
    })
    if (res.ok)
      return NextResponse.json({message: "successfully"});

    return NextResponse.json({message: "not successful"});
}
