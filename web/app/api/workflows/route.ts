import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/instantiatePrisma";
import { authConfig } from "@/lib/auth.config";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";

// Helper function to verify if the current user is an Admin or Manager
async function verifyAdminOrManager() {
  // Get the current session using server-side session handler
  const session = await getServerSession(authConfig);
  
  // Return false if no session or missing JWT token
  if (!session?.customJwt) return false;

  try {
    // Verify the JWT token with the secret key
    const userInfo = jwt.verify(session.customJwt, process.env.JWT_SECRET);
    
    // Check if userInfo is an object and the rank is either ADMIN or MANAGER
    if (typeof userInfo === "object" && ["ADMIN", "MANAGER"].includes(userInfo.rank)) {
      return true; // Authorized
    }
  } catch {
    // Return false if JWT verification fails
    return false;
  }
  
  // Default to false if none of the above conditions met
  return false;
}

// GET endpoint to fetch workflows, only accessible by Admins or Managers
export async function GET(request: NextRequest) {
  // Check if user is authorized
  const authorized = await verifyAdminOrManager();
  
  // Return 401 Unauthorized if not authorized
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch workflows from DB including related product and label, sorted by creation date descending
  const workflows = await prisma.workflow.findMany({
    include: { product: true, label: true },
    orderBy: { createdAt: 'desc' },
  });

  // Return the workflows as JSON response
  return NextResponse.json(workflows);
}

// POST endpoint to create a new workflow, only accessible by Admins or Managers
export async function POST(request: NextRequest) {
  // Check if user is authorized
  const authorized = await verifyAdminOrManager();
  
  // Return 401 Unauthorized if not authorized
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse the incoming JSON request body
  const body = await request.json();

  // Create a new workflow record in the database using the request body data
  const created = await prisma.workflow.create({
    data: {
      productId:       body.productId,
      triggerType:     body.condition,
      threshold:       body.threshold,
      actionType:      body.action,
      restockQuantity: body.restockQuantity,
      serialPattern:   body.serialPattern,
      labelId:         body.labelId,
      enabled:         body.enabled ?? true, // Default to true if not provided
    },
  });

  // Return the created workflow with 201 Created status
  return NextResponse.json(created, { status: 201 });
}
