import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/instantiatePrisma";
import { authConfig } from "@/lib/auth.config";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";

export async function PUT(request: NextRequest, { params }) {
  // Retrieve user session
  const session = await getServerSession(authConfig);

  // Check if JWT is present in session
  if (!session?.customJwt) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userInfo;
  try {
    // Verify JWT and extract user information
    userInfo = jwt.verify(session.customJwt, process.env.JWT_SECRET);
  } catch {
    // If JWT verification fails, respond with unauthorized
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  // Only allow users with ADMIN or MANAGER roles to proceed
  if (!["ADMIN", "MANAGER"].includes(userInfo.rank)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Extract productId from URL parameters
    const { productId } = await params;
    // Parse request body JSON to get description
    const { description } = await request.json();

    // Validate description: must be string or null/undefined
    if (description !== null && description !== undefined && typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Product description must be a string or null' },
        { status: 400 }
      );
    }

    // Update the product description in the database
    const updatedProduct = await prisma.product.update({
      where: { id: Number(productId) },
      data: { description },
      // Select relevant fields to return
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
    return NextResponse.json({
      message: 'Product description updated successfully',
      data: updatedProduct,
    });

  } catch (error) {
    // Log any errors and return a 500 response
    console.error('Error updating product description:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

