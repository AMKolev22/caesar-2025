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

export async function PUT(request: NextRequest, { params }) {
  const authorized = await verifyAdminOrManager();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let { id } = params;
  id = parseInt(id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid workflow id" }, { status: 400 });
  }

  const body = await request.json();

  try {
    const updated = await prisma.workflow.update({
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
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Workflow update error:", error);
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }) {
  const authorized = await verifyAdminOrManager();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let { id } = await params;
  id = parseInt(id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid workflow id" }, { status: 400 });
  }

  try {
    await prisma.workflow.delete({ where: { id } });
    return NextResponse.json({ data: "success" }, { status: 200 });
  } catch (error) {
    console.error("Workflow delete error:", error);
    return NextResponse.json({ error: "Failed to delete workflow" }, { status: 500 });
  }
}
