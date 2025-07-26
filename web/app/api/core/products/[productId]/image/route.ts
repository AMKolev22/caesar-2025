import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/instantiatePrisma";
import { authConfig } from "@/lib/auth.config";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";

export async function DELETE(req: NextRequest, { params }) {
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
    const { productId } = await params;
    const id = parseInt(productId);

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (product?.imageUrl) {
      const filepath = path.join(process.cwd(), 'public', product.imageUrl);

      try {
        await fs.unlink(filepath);
      } catch (err) {
        console.warn('Could not delete file:', err);
      }
    }

    await prisma.product.update({
      where: { id },
      data: { imageUrl: null },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } 
  catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
