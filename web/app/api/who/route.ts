import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authConfig);
  console.log("session: ", session);

  if (!session || !session.customJwt)
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const user = jwt.verify(session.customJwt, process.env.JWT_SECRET);
    return NextResponse.json({ success: true, user }, { status: 200 });
  } 
  catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
  }
}
