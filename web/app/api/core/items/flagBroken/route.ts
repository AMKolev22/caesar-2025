import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth.config"
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/instantiatePrisma";
import { NextResponse, NextRequest } from "next/server";
export async function POST(req: Request) {
  try {
    // Get current session and verify JWT token
    const session = await getServerSession(authConfig);
    if (!session?.customJwt) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const info = jwt.verify(session.customJwt, process.env.JWT_SECRET);

    // Extract itemId from request body
    const { itemId } = await req.json();

    // Basic validation for user email and itemId presence
    if (!info.email || !itemId) {
      return NextResponse.json(
        { error: "User email and item ID are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: info.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find item by ID with related product info
    const item = await prisma.item.findUnique({
      where: { id: parseInt(itemId) },
      include: { product: true },
    });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Verify item is assigned to the user making the request
    if (item.assignedTo !== user.id) {
      return NextResponse.json(
        { error: "Item is not assigned to you" },
        { status: 403 }
      );
    }

    // Check item status is currently IN_USE before flagging broken
    if (item.status !== "IN_USE") {
      return NextResponse.json(
        { error: "Item is not currently in use" },
        { status: 400 }
      );
    }

    // Check if a pending repair request for this item by this user already exists
    const existingRepairRequest = await prisma.request.findFirst({
      where: {
        userId: user.id,
        itemId: parseInt(itemId),
        type: "REPAIR",
        status: "PENDING",
      },
    });
    if (existingRepairRequest) {
      return NextResponse.json(
        { error: "A repair request for this item is already pending" },
        { status: 400 }
      );
    }

    // Use a transaction to update item, create repair request, log status, and update product quantity
    const result = await prisma.$transaction(async (tx) => {
      // Mark item as BROKEN and unassign it
      const updatedItem = await tx.item.update({
        where: { id: parseInt(itemId) },
        data: {
          status: "BROKEN",
          assignedTo: null,
        },
      });

      // Create a new repair request with PENDING status
      const repairRequest = await tx.request.create({
        data: {
          userId: user.id,
          itemId: parseInt(itemId),
          organisationId: item.organisationId,
          type: "REPAIR",
          status: "PENDING",
        },
      });

      // Log the status change for the repair request
      await tx.statusLog.create({
        data: {
          requestId: repairRequest.id,
          status: "PENDING",
          changedByName: user.name,
        },
      });

      // Decrement the product's totalQuantity by 1 since the item is now broken
      await tx.product.update({
        where: { id: item.productId },
        data: {
          totalQuantity: {
            decrement: 1,
          },
        },
      });

      return { updatedItem, repairRequest };
    });

    // Return success response with the repair request ID
    return NextResponse.json({
      success: true,
      message: "Item flagged as broken and repair request submitted successfully",
      requestId: result.repairRequest.id,
    });
  } catch (error) {
    console.error("Error flagging item as broken:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
