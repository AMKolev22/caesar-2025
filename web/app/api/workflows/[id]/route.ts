import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/instantiatePrisma";
import { authConfig } from "@/lib/auth.config";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";

// Function to verify if the current user has Admin or Manager role
async function verifyAdminOrManager() {
  // Get session information with auth config
  const session = await getServerSession(authConfig);
  if (!session?.customJwt) return false; // No JWT found - unauthorized

  try {
    // Verify JWT and decode user info
    const userInfo = jwt.verify(session.customJwt, process.env.JWT_SECRET);
    // Check if userInfo object and rank is Admin or Manager
    if (typeof userInfo === "object" && ["ADMIN", "MANAGER"].includes(userInfo.rank)) {
      return true; // Authorized
    }
  } catch {
    // Invalid or expired JWT - unauthorized
    return false;
  }
  return false; // Default unauthorized
}

// Handler to update an existing workflow by ID (PUT method)
export async function PUT(request: NextRequest, { params }) {
  // Check authorization
  const authorized = await verifyAdminOrManager();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Extract and validate the workflow ID parameter
  let { id } = params;
  id = parseInt(id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid workflow id" }, { status: 400 });
  }

  // Parse request body for updated workflow data
  const body = await request.json();

  try {
    // Update workflow in the database with the new data
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
    // Return the updated workflow as response
    return NextResponse.json(updated);
  } catch (error) {
    // Log and return error if update fails
    console.error("Workflow update error:", error);
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 });
  }
}

// Handler to delete a workflow by ID (DELETE method)
export async function DELETE(request: NextRequest, { params }) {
  // Check authorization
  const authorized = await verifyAdminOrManager();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Extract and validate the workflow ID parameter
  let { id } = params;
  id = parseInt(id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid workflow id" }, { status: 400 });
  }

  try {
    // Delete the workflow from the database
    await prisma.workflow.delete({ where: { id } });
    // Return success confirmation
    return NextResponse.json({ data: "success" }, { status: 200 });
  } catch (error) {
    // Log and return error if deletion fails
    console.error("Workflow delete error:", error);
    return NextResponse.json({ error: "Failed to delete workflow" }, { status: 500 });
  }
}

