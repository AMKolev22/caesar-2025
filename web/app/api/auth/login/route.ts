import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/instantiatePrisma"

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email)
    return NextResponse.json({ success: false, error: 'Email is required.' },{ status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user)
    return NextResponse.json({ success: false, error: 'User not found' },{ status: 404 });

  return NextResponse.json({ success: true, user },{ status: 200 });

}

