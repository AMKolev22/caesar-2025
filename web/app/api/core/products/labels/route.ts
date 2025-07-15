import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma'
const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  try {
    const { productId, labelIds } = await req.json();

    // Remove existing labels for this product
    await prisma.productLabel.deleteMany({
      where: { productId: parseInt(productId) },
    });

    // Add new labels
    if (labelIds.length > 0) {
      await prisma.productLabel.createMany({
        data: labelIds.map(labelId => ({
          productId: parseInt(productId),
          labelId: parseInt(labelId),
        })),
      });
    }

    return NextResponse.json({ message: 'Labels updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating product labels:', error);
    return NextResponse.json({ error: 'Failed to update labels' }, { status: 500 });
  }
}