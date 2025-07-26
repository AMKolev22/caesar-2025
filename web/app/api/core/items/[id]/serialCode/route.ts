import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import jwt from 'jsonwebtoken';
import { authConfig } from '@/lib/auth.config';
import { prisma } from "@/lib/instantiatePrisma";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authConfig);

  if (!session?.customJwt) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let info: any;
  try {
    info = jwt.verify(session.customJwt, process.env.JWT_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  if (info.rank !== 'ADMIN' && info.rank !== 'MANAGER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = params;
    const { serialCode } = await request.json();
    const itemId = parseInt(id);

    if (!serialCode || typeof serialCode !== 'string' || serialCode.trim().length === 0) {
      return NextResponse.json(
        { error: 'Serial code is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const existingItem = await prisma.item.findUnique({
      where: { id: itemId },
      select: { id: true, serialCode: true },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: { serialCode: serialCode.trim() },
      select: {
        id: true,
        serialCode: true,
        status: true,
        assignedTo: true,
        productId: true,
        organisationId: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ message: 'Item serial code updated successfully', data: updatedItem });
  } catch (error) {
    console.error('Error updating item serial code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
