import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import jwt from 'jsonwebtoken';
import { authConfig } from "@/lib/auth.config" 
import { prisma } from '@/lib/instantiatePrisma'; 

export async function POST(req: NextRequest) {
  // Get the current session to authenticate the user
  const session = await getServerSession(authConfig);

  // Return 401 if session or JWT token is missing
  if (!session || !session.customJwt) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify and decode JWT token to get user info
    const decoded: any = jwt.verify(session.customJwt, process.env.JWT_SECRET!);

    // Check if user has the required rank (ADMIN or MANAGER)
    if (decoded.rank !== 'ADMIN' && decoded.rank !== 'MANAGER') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Parse the request JSON body
    const body = await req.json();
    const { email } = body;

    // Validate that email is provided
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    // Check if a user with the given email exists
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    // Update the user to set 'allowed' to true
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { allowed: true },
    });

    // Respond with success and the updated user info
    return NextResponse.json({ success: true, updatedUser }, { status: 200 });

  } catch (err) {
    // Handle invalid or expired JWT tokens
    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
  }
}

