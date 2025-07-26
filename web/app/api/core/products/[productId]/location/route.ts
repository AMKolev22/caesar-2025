import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/instantiatePrisma";
import { authConfig } from "@/lib/auth.config";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!session?.customJwt) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userInfo;
  try {
    userInfo = jwt.verify(session.customJwt, process.env.JWT_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  if (!["ADMIN", "MANAGER"].includes(userInfo.rank)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { productId, location } = await req.json();
    const id = parseInt(productId);
    if (!location || typeof location !== "string") {
      return NextResponse.json({ error: "Invalid location" }, { status: 400 });
    }

    await prisma.product.update({
      where: { id },
      data: { location },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } 
  catch (error) {
    console.error('Location update error:', error);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}
