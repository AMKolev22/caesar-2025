import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth.config"
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/instantiatePrisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Get the current session to authenticate the user
  const session = await getServerSession(authConfig);

  // Return 401 if no JWT in session
  if (!session?.customJwt) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let info;
  try {
    // Verify JWT token and extract user info
    info = jwt.verify(session.customJwt, process.env.JWT_SECRET);
  } catch {
    // Return 401 if token invalid or expired
    return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
  }

  // Parse request body, default 'type' to "BORROW" if not provided
  const { serialCode, type = "BORROW" } = await req.json();

  // Find user by email from JWT payload
  const user = await prisma.user.findUnique({
    where: { email: info.email },
  });

  // Find organisation by fixed name (consider making dynamic if needed)
  const organisation = await prisma.organisation.findUnique({
    where: { name: "TestOrganisation" },
  });

  // Find item matching the serial code and organisation ID
  const item = await prisma.item.findFirst({
    where: {
      serialCode,
      organisationId: organisation?.id,
    },
  });

  // Check for existence of user, organisation, and item before proceeding
  if (!user || !organisation || !item) {
    return NextResponse.json(
      { success: false, error: "User, organisation, or item not found" },
      { status: 404 }
    );
  }

  // Create a new request for the item borrow or other type
  const request = await prisma.request.create({
    data: {
      userId: user.id,
      itemId: item.id,
      organisationId: organisation.id,
      type,
      status: "PENDING",
    },
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  // Log the status change for the new request
  await prisma.statusLog.create({
    data: {
      requestId: request.id,
      status: "PENDING",
      changedByName: user.name,
    },
  });

  // Return the created request with status 201 Created
  return NextResponse.json({ request }, { status: 201 });
}

