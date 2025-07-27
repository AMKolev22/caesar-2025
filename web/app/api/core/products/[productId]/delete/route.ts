import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/instantiatePrisma';
import { authConfig } from '@/lib/auth.config';
import { getServerSession } from 'next-auth';
import jwt from 'jsonwebtoken';

export async function DELETE(request: NextRequest, { params }) {
  // Get user session
  const session = await getServerSession(authConfig);

  // Check for valid JWT in session
  if (!session?.customJwt) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userInfo;
  try {
    // Verify JWT and extract user info
    userInfo = jwt.verify(session.customJwt, process.env.JWT_SECRET);
  } catch {
    // JWT invalid or expired
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  // Restrict to ADMIN or MANAGER roles only
  if (!["ADMIN", "MANAGER"].includes(userInfo.rank)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Extract productId from URL parameters and convert to number
  let { productId } = await params;
  productId = Number(productId);

  // Validate productId is a valid number
  if (isNaN(productId))
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });

  try {
    // Find all items associated with the product to delete
    const items = await prisma.item.findMany({
      where: { productId },
      select: { id: true },
    });

    // Extract item IDs to use for cascading deletes
    const itemIds = items.map((item) => item.id);

    // Perform multiple delete operations in a transaction to maintain data integrity
    await prisma.$transaction([
      // Delete all status logs connected to requests for these items
      prisma.statusLog.deleteMany({
        where: {
          request: {
            itemId: { in: itemIds },
          },
        },
      }),

      // Delete all requests related to these items
      prisma.request.deleteMany({
        where: {
          itemId: { in: itemIds },
        },
      }),

      // Delete all QR codes related to these items
      prisma.qRCode.deleteMany({
        where: {
          itemId: { in: itemIds },
        },
      }),

      // Delete all items belonging to the product
      prisma.item.deleteMany({
        where: { productId },
      }),

      // Delete all labels linked to the product
      prisma.productLabel.deleteMany({
        where: { productId },
      }),

      // Delete all workflows associated with the product
      prisma.workflow.deleteMany({
        where: { productId },
      }),

      // Finally, delete the product itself
      prisma.product.delete({
        where: { id: productId },
      }),
    ]);

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log error and return 500 Internal Server Error on failure
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

