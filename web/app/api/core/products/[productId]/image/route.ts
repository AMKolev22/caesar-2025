import { promises as fs } from 'fs';
import path from 'path';
import { PrismaClient } from '@/generated/prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from "@/lib/instantiatePrisma"

export async function DELETE(req: NextRequest, { params }) {
  try {
    const { productId } = await params;

    // finds the product to get image URL
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (product?.imageUrl) {
      const filepath = path.join(process.cwd(), 'public', product.imageUrl);

      try {
        await fs.unlink(filepath);
      } catch (err) {
        console.warn('Could not delete file:', err);
      }
    }

    // remove image URL from product
    await prisma.product.update({
      where: { id: parseInt(productId) },
      data: { imageUrl: null },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } 
  catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}