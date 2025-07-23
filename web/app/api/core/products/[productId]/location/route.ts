import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  try {
    const { productId, location } = await req.json();
    console.log("Product id: ", productId)
    await prisma.product.update({
      where: { id: parseInt(productId) },
      data: { location },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } 
  catch (error) {
    console.error('Location update error:', error);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}