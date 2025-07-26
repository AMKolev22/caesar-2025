import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/instantiatePrisma";
import { authConfig } from "@/lib/auth.config";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";

export async function PUT(request: NextRequest, { params }) {
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
    const { description } = await request.json();

    if (description !== null && description !== undefined && typeof description !== 'string')
      return NextResponse.json({ error: 'Product description must be a string or null' }, { status: 400 });

    const updatedProduct = await prisma.product.update({
      where: { id: Number(productId) },
      data: { description },
      select: {
        id: true,
        name: true,
        description: true,
        totalQuantity: true,
        location: true,
        organisationId: true
      }
    });

    return NextResponse.json({ message: 'Product description updated successfully', data: updatedProduct });

  } catch (error) {
    console.error('Error updating product description:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
