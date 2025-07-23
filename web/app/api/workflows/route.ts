// app/api/workflows/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();
export async function GET(request: NextRequest) {
  const workflows = await prisma.workflow.findMany({
    include: { product: true, label: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(workflows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const created = await prisma.workflow.create({
    data: {
      productId:       body.productId,
      triggerType:     body.condition,      
      threshold:       body.threshold,
      actionType:      body.action,
      restockQuantity: body.restockQuantity,
      serialPattern:   body.serialPattern,
      labelId:         body.labelId,
      enabled:         body.enabled ?? true,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
