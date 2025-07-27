import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import jwt from 'jsonwebtoken';
import { authConfig } from '@/lib/auth.config';
import { prisma } from "@/lib/instantiatePrisma";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // Get the current session to authenticate user
  const session = await getServerSession(authConfig);

  // Return 401 if no JWT found in session
  if (!session?.customJwt) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let info: any;
  try {
    // Verify and decode JWT to get user info
    info = jwt.verify(session.customJwt, process.env.JWT_SECRET!);
  } catch {
    // Return 401 if token is invalid or expired
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // Allow only users with ADMIN or MANAGER rank to update
  if (info.rank !== 'ADMIN' && info.rank !== 'MANAGER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Extract item ID from route parameters
    const { id } = params;
    // Parse JSON body to get the new serial code
    const { serialCode } = await request.json();
    const itemId = parseInt(id);

    // Validate serialCode: must be non-empty string
    if (!serialCode || typeof serialCode !== 'string' || serialCode.trim().length === 0) {
      return NextResponse.json(
        { error: 'Serial code is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Check if the item exists in the database
    const existingItem = await prisma.item.findUnique({
      where: { id: itemId },
      select: { id: true, serialCode: true },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Update the serial code of the item and return relevant details
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

    // Return success message and updated item data
    return NextResponse.json({ message: 'Item serial code updated successfully', data: updatedItem });
  } catch (error) {
    // Log and handle any unexpected errors
    console.error('Error updating item serial code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

