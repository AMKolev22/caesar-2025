import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import jwt from 'jsonwebtoken';
import { authConfig } from '@/lib/auth.config';
import { prisma } from '@/lib/instantiatePrisma';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
  }

  try {
    const item = await prisma.item.findUnique({
      where: { id },
      select: { productId: true },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await prisma.qRCode.deleteMany({ where: { itemId: id } });
    await prisma.request.deleteMany({ where: { itemId: id } });
    await prisma.item.delete({ where: { id } });

    await prisma.product.update({
      where: { id: item.productId },
      data: { totalQuantity: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
