import { NextRequest, NextResponse } from 'next/server';
import { checkAndExecuteWorkflows } from "@/lib/workflowEngine";
import { authConfig } from "@/lib/auth.config";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";

// Function to verify if the current user is either an Admin or Manager
async function verifyAdminOrManager() {
  // Retrieve the current session using the authentication config
  const session = await getServerSession(authConfig);
  
  // If there is no session or no JWT token in the session, deny access
  if (!session?.customJwt) return false;

  try {
    // Verify the JWT token with the secret key to get user information
    const userInfo = jwt.verify(session.customJwt, process.env.JWT_SECRET);
    
    // Check if userInfo is an object and user rank is either ADMIN or MANAGER
    if (typeof userInfo === "object" && ["ADMIN", "MANAGER"].includes(userInfo.rank)) {
      return true; // User is authorized
    }
  } catch {
    // If JWT verification fails, deny access
    return false;
  }

  // Default to deny access if no conditions above met
  return false;
}

// POST request handler to trigger workflow checks, only accessible to authorized users
export async function POST(req: NextRequest) {
  // Verify if the user has Admin or Manager privileges
  const authorized = await verifyAdminOrManager();
  
  // If unauthorized, return 401 Unauthorized response
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Call the function to check and execute workflows
    await checkAndExecuteWorkflows();
    
    // Return success response if workflows checked without errors
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log any error that occurred during workflow checks
    console.error("Workflow check error:", error);
    
    // Return a 500 Internal Server Error response with an error message
    return NextResponse.json({ error: "Failed to check workflows" }, { status: 500 });
  }
}
