import { NextResponse } from 'next/server';
import { checkAndExecuteWorkflows } from "@/lib/workflowEngine";
import { authConfig } from "@/lib/auth.config";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";

async function verifyAdminOrManager() {
  const session = await getServerSession(authConfig);
  if (!session?.customJwt) return false;

  try {
    const userInfo = jwt.verify(session.customJwt, process.env.JWT_SECRET);
    if (typeof userInfo === "object" && ["ADMIN", "MANAGER"].includes(userInfo.rank)) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export async function GET() {
  const authorized = await verifyAdminOrManager();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await checkAndExecuteWorkflows();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Workflow check error:", error);
    return NextResponse.json({ error: "Failed to check workflows" }, { status: 500 });
  }
}
