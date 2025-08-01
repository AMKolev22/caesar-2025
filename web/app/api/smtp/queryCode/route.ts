import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

import { prisma } from "@/lib/instantiatePrisma"

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    await prisma.twoFA.upsert({
      where: { userEmail: email },
      update: { code: Number(code) },
      create: { userEmail: email, code: Number(code) },
    });

    return NextResponse.json({ success: true, message: "Code saved" });
  } 
  catch (error: any) {
    console.error('Query error:', error);
    return NextResponse.json({ success: false, error: error.message },{ status: 500 });
  }
}
