// app/api/workflows/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const db = new PrismaClient();

export async function PUT(request: NextRequest, { params }) {
    let { id } = await params;
    id = parseInt(id, 10);
  const body = await request.json();

  const updated = await db.workflow.update({
    where: { id },
    data: {
      productId:       body.productId,
      triggerType:     body.condition,
      threshold:       body.threshold,
      actionType:      body.action,
      restockQuantity: body.restockQuantity,
      serialPattern:   body.serialPattern,
      labelId:         body.labelId,
      enabled:         body.enabled,
    },
  });
  console.log(updated);

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }) {
    let { id } = await params;
    id = parseInt(id, 10);

  await db.workflow.delete({ where: { id } });
  return NextResponse.json({ data: "success" }, { status: 200 });

}
