import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/instantiatePrisma';
import { authConfig } from '@/lib/auth.config';
import { getServerSession } from 'next-auth';
import jwt from 'jsonwebtoken';

export async function DELETE(request: NextRequest, { params }) {
  const session = await getServerSession(authConfig);

  if (!session?.customJwt) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userInfo;
  try {
    userInfo = jwt.verify(session.customJwt, process.env.JWT_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  if (!["ADMIN", "MANAGER"].includes(userInfo.rank)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let { productId } = await params;
  productId = Number(productId);

  if (isNaN(productId))
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });

  try {
    const items = await prisma.item.findMany({
      where: { productId },
      select: { id: true },
    });
    const itemIds = items.map((item) => item.id);

    await prisma.$transaction([
      prisma.statusLog.deleteMany({
        where: {
          request: {
            itemId: { in: itemIds },
          },
        },
      }),

      prisma.request.deleteMany({
        where: {
          itemId: { in: itemIds },
        },
      }),

      prisma.qRCode.deleteMany({
        where: {
          itemId: { in: itemIds },
        },
      }),

      prisma.item.deleteMany({
        where: { productId },
      }),

      prisma.productLabel.deleteMany({
        where: { productId },
      }),

      prisma.workflow.deleteMany({
        where: { productId },
      }),

      prisma.product.delete({
        where: { id: productId },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
