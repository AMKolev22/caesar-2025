import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/instantiatePrisma"
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET

export async function POST(req: NextRequest) {
  const { email, name } = await req.json();
  console.log(JWT_SECRET);

  if (!email || !name)
    return NextResponse.json({ success: false, error: 'Missing or invalid fields.' }, { status: 400 } );

  const existsUser = await prisma.user.findUnique({ where: { email } });

  if (existsUser) 
    return NextResponse.json({ success: false, error: 'User already registered' },{ status: 409 });

  const newUser = await prisma.user.create({
    data: { email, name }
  });

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, rank: newUser.rank },
    JWT_SECRET,
    { expiresIn: '600h' }
  );

  (await cookies()).set('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 6000 * 60
  });


  return NextResponse.json({ success: true, message: 'User registered successfully.' },{ status: 201 });
}
