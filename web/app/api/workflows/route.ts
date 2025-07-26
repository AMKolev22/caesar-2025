import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/instantiatePrisma";
import { authConfig } from "@/lib/auth.config";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";

async function verifyAdminOrManager() {
  const session = await getServerSession(authConfig);
  if (!session?.customJwt) return false;

  try {
    const userInfo = jwt.verify(session.customJwt, process.env.JWT_SECRET);
    if (typeof userInfo === "object" && ["ADMIN", "MANAGER"].includes(userInfo.rank)) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export async function GET(request: NextRequest) {
  const authorized = await verifyAdminOrManager();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workflows = await prisma.workflow.findMany({
    include: { product: true, label: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(workflows);
}

export async function POST(request: NextRequest) {
  const authorized = await verifyAdminOrManager();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
