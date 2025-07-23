import { NextResponse, NextRequest } from 'next/server';
import { prisma } from "@/lib/instantiatePrisma" 

export async function PUT(request: NextRequest, { params }) {
  try {
    const { id } = params;
    const { serialCode } = await request.json();
    const itemId = parseInt(id);

    if (!serialCode || typeof serialCode !== 'string' || serialCode.trim().length === 0)
      return NextResponse.json({ error: 'Serial code is required and must be a non-empty string' }, { status: 400 });

    const existingItem = await prisma.item.findUnique({
      where: { id: itemId },
      select: { id: true, serialCode: true }
    });

    if (!existingItem)
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });

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
            name: true
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ message: 'Item serial code updated successfully', data: updatedItem });
  } 
  catch (error) {
    console.error('Error updating item serial code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}