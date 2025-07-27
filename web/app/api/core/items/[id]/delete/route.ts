import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import jwt from 'jsonwebtoken';
import { authConfig } from '@/lib/auth.config';
import { prisma } from '@/lib/instantiatePrisma';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Get the current session and ensure the user is authenticated
  const session = await getServerSession(authConfig);

  if (!session?.customJwt) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let info: any;
  try {
    // Verify and decode the JWT token
    info = jwt.verify(session.customJwt, process.env.JWT_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // Check if the user has sufficient permissions
  if (info.rank !== 'ADMIN' && info.rank !== 'MANAGER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = Number(params.id);

  // Validate the item ID
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
  }

  try {
    // Find the item to ensure it exists and get its associated productId
    const item = await prisma.item.findUnique({
      where: { id },
      select: { productId: true },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Delete related QR codes and requests before deleting the item itself
    await prisma.qRCode.deleteMany({ where: { itemId: id } });
    await prisma.request.deleteMany({ where: { itemId: id } });

    // Delete the item
    await prisma.item.delete({ where: { id } });

    // Decrement the total quantity in the associated product
    await prisma.product.update({
      where: { id: item.productId },
      data: { totalQuantity: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Handle unexpected errors
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
