import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { prisma } from "@/lib/instantiatePrisma"

export async function POST(req: NextRequest) {
  
  const { email, name } = await req.json()

  if (!email || !name )
    return NextResponse.json({ success: false, error: 'Missing or invalid fields.' },{ status: 400 });

  const existsUser = await prisma.user.findUnique({ where: { email } });

  if (existsUser)
    return NextResponse.json({ success: false, error: 'User already registered' },{ status: 409 });

  await prisma.user.create({
    data: { email, name }
  })

  return NextResponse.json({ success: true, message: 'User registered successfully.' },{ status: 201 });
}