import { NextResponse } from 'next/server';
import { prisma } from "@/lib/instantiatePrisma";
import { authConfig } from "@/lib/auth.config";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";

export async function PUT(request, { params }) {
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
    const param = await params;
    const id = parseInt(param.productId, 10);
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0)
      return NextResponse.json({ error: 'Product name is required and must be a non-empty string' }, { status: 400 });

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!existingProduct)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const nameExists = await prisma.product.findFirst({
      where: {
        name: name.trim(),
        id: { not: id },
      },
    });

    if (nameExists)
      return NextResponse.json({ error: 'A product with this name already exists' }, { status: 409 });

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        description: true,
        totalQuantity: true,
        location: true,
        organisationId: true,
      },
    });

    return NextResponse.json({ message: 'Product name updated successfully', data: updatedProduct });
  } 
  catch (error) {
    console.error('Error updating product name:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
