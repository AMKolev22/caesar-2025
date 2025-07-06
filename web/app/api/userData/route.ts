import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid email' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organisation: true,
        requests: true,
        assignedItems: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/user] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
