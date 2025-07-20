// app/api/workflows/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const db = new PrismaClient();
export async function GET(request: NextRequest) {
  const workflows = await db.workflow.findMany({
    include: { product: true, label: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(workflows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const created = await db.workflow.create({
    data: {
      productId:       body.productId,
      triggerType:     body.condition,       // match your enum names
      threshold:       body.threshold,
      actionType:      body.action,
      restockQuantity: body.restockQuantity,
      serialPattern:   body.serialPattern,
      labelId:         body.labelId,
      enabled:         body.enabled ?? true,
      // organisationId: you may need to pull from session/context here
    },
  });

  return NextResponse.json(created, { status: 201 });
}
