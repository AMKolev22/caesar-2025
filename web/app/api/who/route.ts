import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

export async function GET() {
  // Retrieve the current user's session using server-side session handler
  const session = await getServerSession(authConfig);
  console.log("session: ", session);

  // If no session or missing customJwt token, respond with unauthorized
  if (!session || !session.customJwt)
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    // Verify the JWT token stored in the session using the secret key
    const user = jwt.verify(session.customJwt, process.env.JWT_SECRET);

    // Return success response with the decoded user info from token
    return NextResponse.json({ success: true, user }, { status: 200 });
  } 
  catch (err) {
    // If verification fails (token invalid or expired), respond with 401 Unauthorized
    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
  }
}

