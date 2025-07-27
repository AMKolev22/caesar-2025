import { NextResponse } from 'next/server';
import { prisma } from "@/lib/instantiatePrisma";
import { authConfig } from "@/lib/auth.config";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";

export async function PUT(request, { params }) {
  // Get user session to check authentication
  const session = await getServerSession(authConfig);

  // If no valid session or customJwt, respond Unauthorized
  if (!session?.customJwt) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userInfo;
  try {
    // Verify JWT token from session
    userInfo = jwt.verify(session.customJwt, process.env.JWT_SECRET);
  } catch {
    // If token invalid or expired, respond Unauthorized
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  // Check if user has required rank to update product
  if (!["ADMIN", "MANAGER"].includes(userInfo.rank)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Extract productId from params and parse it as integer
    const param = await params;
    const id = parseInt(param.productId, 10);

    // Parse JSON body for new product name
    const { name } = await request.json();

    // Validate that name is a non-empty string
    if (!name || typeof name !== 'string' || name.trim().length === 0)
      return NextResponse.json({ error: 'Product name is required and must be a non-empty string' }, { status: 400 });

    // Check if the product exists by ID
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    // If product not found, return 404
    if (!existingProduct)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // Check if another product already uses the desired name (excluding current product)
    const nameExists = await prisma.product.findFirst({
      where: {
        name: name.trim(),
        id: { not: id },
      },
    });

    // If name exists in another product, return conflict 409
    if (nameExists)
      return NextResponse.json({ error: 'A product with this name already exists' }, { status: 409 });

    // Update product name in database
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

    // Return success message with updated product data
    return NextResponse.json({ message: 'Product name updated successfully', data: updatedProduct });
  } 
  catch (error) {
    // Log unexpected errors and respond with 500
    console.error('Error updating product name:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

