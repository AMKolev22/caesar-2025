import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

import { prisma } from "@/lib/instantiatePrisma"

export async function POST(req: Request) {
  try {
    
    const { email, enteredCode } = await req.json();

    const res = await prisma.twoFA.findFirst({
      where: {
        userEmail: email,
      },
      orderBy :{
        id: 'desc',
      }
    });

    if (!res)
      return NextResponse.json({ success: false, error: "Code not found" },{ status: 404 });
    console.log(res.code);

    if (res.code !== Number(enteredCode))
      return NextResponse.json({ success: false, error: "Invalid code" },{ status: 400 });

    await prisma.twoFA.deleteMany({
      where: {
        userEmail: email,
      },
    });

    return NextResponse.json({ success: true, message: "Code verified." });
  } 
  catch (error: any) {
    console.error('Query error:', error);
    return NextResponse.json({ success: false, error: error.message },{ status: 500 });
  }
}
