import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import jwt from 'jsonwebtoken';
import { authConfig } from "@/lib/auth.config";
import { prisma } from '@/lib/instantiatePrisma';
import { ItemStatus, RequestStatus } from '@/generated/prisma';

export async function POST(req: NextRequest) {
  // Get the user session to verify authentication
  const session = await getServerSession(authConfig);

  // If no JWT token present in session, respond with Unauthorized
  if (!session?.customJwt) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let info: any;
  try {
    // Verify and decode the JWT token using the secret key
    info = jwt.verify(session.customJwt, process.env.JWT_SECRET!);
  } catch {
    // If token verification fails, respond with Invalid or expired token
    return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
  }

  // Allow only users with ADMIN or MANAGER rank to proceed
  if (info.rank !== "ADMIN" && info.rank !== "MANAGER") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  // Extract the requestId from the POST request body
  const { requestId } = await req.json();

  // Retrieve the request, including associated item and user data
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { item: true, user: true },
  });

  // If the request does not exist, respond with Not Found
  if (!request) {
    return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
  }

  // Update the item: assign it to the user and set status to IN_USE
  await prisma.item.update({
    where: { id: request.itemId },
    data: {
      assignedTo: request.userId,
      status: ItemStatus.IN_USE,
    },
  });

  // Update the request status to APPROVED
  await prisma.request.update({
    where: { id: requestId },
    data: {
      status: RequestStatus.APPROVED,
    },
  });

  // Return success message after updates
  return NextResponse.json({ message: "successfully" });
}

