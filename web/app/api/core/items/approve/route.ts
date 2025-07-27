import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import jwt from 'jsonwebtoken';
import { authConfig } from "@/lib/auth.config";
import { prisma } from '@/lib/instantiatePrisma';
import { ItemStatus, RequestStatus } from '@/generated/prisma';

export async function POST(req: NextRequest) {
  // Get the current session to authenticate the user
  const session = await getServerSession(authConfig);

  // Return 401 Unauthorized if no valid JWT in session
  if (!session?.customJwt) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let info: any;
  try {
    // Verify and decode the JWT token to get user info
    info = jwt.verify(session.customJwt, process.env.JWT_SECRET!);
  } catch {
    // Return 401 if the token is invalid or expired
    return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
  }

  // Check if user has required permissions (ADMIN or MANAGER)
  if (info.rank !== "ADMIN" && info.rank !== "MANAGER") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  // Extract the requestId from the incoming JSON body
  const { requestId } = await req.json();

  // Fetch the request by ID, including its related item and user
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { item: true, user: true },
  });

  // Return 404 if request not found
  if (!request) {
    return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
  }

  // Update the item to assign it to the user and set status to IN_USE
  await prisma.item.update({
    where: { id: request.itemId },
    data: {
      assignedTo: request.userId,
      status: ItemStatus.IN_USE,
    },
  });

  // Mark the request as approved
  await prisma.request.update({
    where: { id: requestId },
    data: {
      status: RequestStatus.APPROVED,
    },
  });

  // Return success message
  return NextResponse.json({ message: "Request approved successfully" });
}

