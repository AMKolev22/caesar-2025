import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth.config"
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/instantiatePrisma";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: Request) {
  try {
    // Retrieve the current user session
    const session = await getServerSession(authConfig);

    // If no JWT token in session, respond with Unauthorized
    if (!session?.customJwt) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify and decode the JWT token
    const info = jwt.verify(session.customJwt, process.env.JWT_SECRET);

    // Extract itemId from the request JSON body
    const { itemId } = await request.json();

    // Validate that both email and itemId exist
    if (!info.email || !itemId) {
      return NextResponse.json(
        { error: "User email and item ID are required" },
        { status: 400 }
      );
    }

    // Find the user by email from the JWT payload
    const user = await prisma.user.findUnique({
      where: { email: info.email },
    });

    // If user is not found, respond with 404
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the item by its ID, include the associated product data
    const item = await prisma.item.findUnique({
      where: { id: parseInt(itemId) },
      include: { product: true },
    });

    // If item does not exist, respond with 404
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check if the item is assigned to the current user
    if (item.assignedTo !== user.id) {
      return NextResponse.json(
        { error: "Item is not assigned to you" },
        { status: 403 }
      );
    }

    // Confirm the item is currently in use
    if (item.status !== "IN_USE") {
      return NextResponse.json(
        { error: "Item is not currently in use" },
        { status: 400 }
      );
    }

    // Check if there's already a pending return request for this item by the user
    const existingReturnRequest = await prisma.request.findFirst({
      where: {
        userId: user.id,
        itemId: parseInt(itemId),
        type: "RETURN",
        status: "PENDING",
      },
    });

    // If a pending return request exists, block duplicates
    if (existingReturnRequest) {
      return NextResponse.json(
        { error: "A return request for this item is already pending" },
        { status: 400 }
      );
    }

    // Create a new return request in the database
    const returnRequest = await prisma.request.create({
      data: {
        userId: user.id,
        itemId: parseInt(itemId),
        organisationId: item.organisationId,
        type: "RETURN",
        status: "PENDING",
      },
    });

    // Log the status change for auditing
    await prisma.statusLog.create({
      data: {
        requestId: returnRequest.id,
        status: "PENDING",
        changedByName: user.name,
      },
    });

    // Respond with success and the new request ID
    return NextResponse.json({
      success: true,
      message: "Return request submitted successfully",
      requestId: returnRequest.id,
    });
  } catch (error) {
    // Log unexpected errors and respond with generic server error
    console.error("Error creating return request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
