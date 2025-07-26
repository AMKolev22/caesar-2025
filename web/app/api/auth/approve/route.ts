import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import jwt from 'jsonwebtoken';
import { authConfig } from "@/lib/auth.config" 
import { prisma } from '@/lib/instantiatePrisma'; 

export async function POST(req: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!session || !session.customJwt) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(session.customJwt, process.env.JWT_SECRET!);

    if (decoded.rank !== 'ADMIN' && decoded.rank !== 'MANAGER')
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { email } = body;

    if (!email)
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { allowed: true },
    });

    return NextResponse.json({ success: true, updatedUser }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
  }
}
