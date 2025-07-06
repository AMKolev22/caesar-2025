import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { email, name, isAdmin } = await req.json()

  if (!email || !name || typeof isAdmin !== 'boolean') {
    return NextResponse.json(
      { success: false, error: 'Missing or invalid fields.' },
      { status: 400 }
    )
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })

  if (existingUser) {
    return NextResponse.json(
      { success: false, error: 'User already registered.' },
      { status: 409 }
    )
  }

  await prisma.user.create({
    data: { email, name, isAdmin }
  })

  return NextResponse.json(
    { success: true, message: 'User registered successfully.' },
    { status: 201 }
  )
}