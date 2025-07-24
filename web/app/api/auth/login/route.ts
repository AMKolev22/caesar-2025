import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/instantiatePrisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) 
    return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) 
    return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });

  const cookieStore = await cookies();
  cookieStore.set('token', '', { path: '/', maxAge: 0 });

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      rank: user.rank,
    },
    JWT_SECRET,
    { expiresIn: '600h' }
  );

  (await cookies()).set('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 6000 * 60,
  });
  console.log("this is a test");
  // console.log((await cookies()).get("token"));

  return NextResponse.json({ success: true }, { status: 200 });
}
