import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/instantiatePrisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;
  console.log("email:", email);

  if (!email) {
    return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      rank: user.rank,
    },
    process.env.JWT_SECRET,
    { expiresIn: '600h' }
  );

  return NextResponse.json({ success: true, jwtToken: token }, { status: 200 });
}

