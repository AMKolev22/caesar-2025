import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET() {
  const token = (await cookies()).get('token')?.value;

  if (!token) 
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    console.log(user);
    return Response.json({ success: true, user }, { status: 200 });
  } 
  catch (err) {
    console.error('jwt failed:', err);
    return Response.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
  }
}
