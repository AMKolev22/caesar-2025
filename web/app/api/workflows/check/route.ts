// app/api/workflows/check/route.ts
import { NextResponse } from 'next/server';
import { checkAndExecuteWorkflows } from "@/lib/workflowEngine"

export async function GET() {
  await checkAndExecuteWorkflows();
  return NextResponse.json({ success: true });
}
