import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from "@/lib/instantiatePrisma"
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const token = (await cookies()).get('token')?.value;
    const info = jwt.verify(token, process.env.JWT_SECRET);
    const { itemId, originalRequestId } = await request.json();

    if (!info.email || !itemId) {
      return NextResponse.json(
        { error: 'User email and item ID are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: info.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const item = await prisma.item.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        product: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    if (item.assignedTo !== user.id) {
      return NextResponse.json(
        { error: 'Item is not assigned to you' },
        { status: 403 }
      );
    }

    if (item.status !== 'IN_USE') {
      return NextResponse.json(
        { error: 'Item is not currently in use' },
        { status: 400 }
      );
    }

    const existingRepairRequest = await prisma.request.findFirst({
      where: {
        userId: user.id,
        itemId: parseInt(itemId),
        type: 'REPAIR',
        status: 'PENDING',
      },
    });

    if (existingRepairRequest) {
      return NextResponse.json(
        { error: 'A repair request for this item is already pending' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedItem = await tx.item.update({
        where: { id: parseInt(itemId) },
        data: {
          status: 'BROKEN',
          assignedTo: null,
        },
      });

      const repairRequest = await tx.request.create({
        data: {
          userId: user.id,
          itemId: parseInt(itemId),
          organisationId: item.organisationId,
          type: 'REPAIR',
          status: 'PENDING',
        },
      });

      await tx.statusLog.create({
        data: {
          requestId: repairRequest.id,
          status: 'PENDING',
          changedByName: user.name,
        },
      });

      await tx.product.update({
        where: { id: item.productId },
        data: {
          totalQuantity: {
            decrement: 1,
          },
        },
      });

      return { updatedItem, repairRequest };
    });

    return NextResponse.json({
      success: true,
      message: 'Item flagged as broken and repair request submitted successfully',
      requestId: result.repairRequest.id,
    });

  } catch (error) {
    console.error('Error flagging item as broken:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}