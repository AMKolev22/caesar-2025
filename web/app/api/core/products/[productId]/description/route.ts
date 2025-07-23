import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/instantiatePrisma"


export async function PUT(request: NextRequest, { params }) {
  try {
    const { id } = params;
    const { description } = await request.json();
    const productId = parseInt(id);

    // can be null, undefined, or string
    if (description !== null && description !== undefined && typeof description !== 'string') 
      return NextResponse.json({ error: 'Product description must be a string or null'}, { status: 400 });

    // updates product description
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { description },
      select: {
        id: true,
        name: true,
        description: true,
        totalQuantity: true,
        location: true,
        organisationId: true
      }
    });

    return NextResponse.json({ message: 'Product description updated successfully', data: updatedProduct });

  } 
  catch (error) {
    console.error('Error updating product description:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
