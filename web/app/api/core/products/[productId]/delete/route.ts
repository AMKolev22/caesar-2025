import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/instantiatePrisma';

export async function DELETE(request: NextRequest, { params }) {
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
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
