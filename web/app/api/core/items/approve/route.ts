import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import jwt from 'jsonwebtoken';
import { authConfig } from "@/lib/auth.config";
import { prisma } from '@/lib/instantiatePrisma';
import { ItemStatus, RequestStatus } from '@/generated/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!session?.customJwt) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let info: any;
  try {
    info = jwt.verify(session.customJwt, process.env.JWT_SECRET!);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
  }

  if (info.rank !== "ADMIN" && info.rank !== "MANAGER") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const { requestId } = await req.json();

  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { item: true, user: true },
  });

  if (!request) {
    return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
  }

  await prisma.item.update({
    where: { id: request.itemId },
    data: {
      assignedTo: request.userId,
      status: ItemStatus.IN_USE,
    },
  });

  await prisma.request.update({
    where: { id: requestId },
    data: {
      status: RequestStatus.APPROVED,
    },
  });

  return NextResponse.json({ message: "successfully" });
}
