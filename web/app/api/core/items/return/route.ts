import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userEmail, itemId, originalRequestId } = await request.json();

    if (!userEmail || !itemId) {
      return NextResponse.json(
        { error: 'User email and item ID are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
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

    const existingReturnRequest = await prisma.request.findFirst({
      where: {
        userId: user.id,
        itemId: parseInt(itemId),
        type: 'RETURN',
        status: 'PENDING',
      },
    });

    if (existingReturnRequest) {
      return NextResponse.json(
        { error: 'A return request for this item is already pending' },
        { status: 400 }
      );
    }

    const returnRequest = await prisma.request.create({
      data: {
        userId: user.id,
        itemId: parseInt(itemId),
        organisationId: item.organisationId,
        type: 'RETURN',
        status: 'PENDING',
      },
    });

    await prisma.statusLog.create({
      data: {
        requestId: returnRequest.id,
        status: 'PENDING',
        changedByName: user.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Return request submitted successfully',
      requestId: returnRequest.id,
    });

  } catch (error) {
    console.error('Error creating return request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}