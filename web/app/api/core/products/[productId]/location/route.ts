import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/instantiatePrisma";
import { authConfig } from "@/lib/auth.config";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";

export async function PUT(req: NextRequest) {
  // Get user session to check authentication
  const session = await getServerSession(authConfig);

  // If no valid session or customJwt, respond Unauthorized
  if (!session?.customJwt) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userInfo;
  try {
    // Verify JWT token from session
    userInfo = jwt.verify(session.customJwt, process.env.JWT_SECRET);
  } catch {
    // If token invalid or expired, respond Unauthorized
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  // Check if user has required rank to update location
  if (!["ADMIN", "MANAGER"].includes(userInfo.rank)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Parse JSON body to get productId and location
    const { productId, location } = await req.json();
    const id = parseInt(productId);

    // Validate location is a non-empty string
    if (!location || typeof location !== "string") {
      return NextResponse.json({ error: "Invalid location" }, { status: 400 });
    }

    // Update product's location in the database
    await prisma.product.update({
      where: { id },
      data: { location },
    });

    // Return success response
    return NextResponse.json({ success: true }, { status: 200 });
  } 
  catch (error) {
    // Log unexpected errors and respond with 500
    console.error('Location update error:', error);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}
