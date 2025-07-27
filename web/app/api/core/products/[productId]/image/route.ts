import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/instantiatePrisma";
import { authConfig } from "@/lib/auth.config";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";

export async function DELETE(req: NextRequest, { params }) {
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

  // Check if user has required rank to delete image
  if (!["ADMIN", "MANAGER"].includes(userInfo.rank)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Extract productId from params (no need to await here)
    const { productId } = params;
    const id = parseInt(productId);

    // Find product by id
    const product = await prisma.product.findUnique({
      where: { id },
    });

    // If product has an image URL, attempt to delete the file from local storage
    if (product?.imageUrl) {
      // Build absolute file path (assuming images are stored under /public)
      const filepath = path.join(process.cwd(), 'public', product.imageUrl);

      try {
        // Delete the image file asynchronously
        await fs.unlink(filepath);
      } catch (err) {
        // Log any errors deleting the file but don't fail the request
        console.warn('Could not delete file:', err);
      }
    }

    // Update the product to remove the imageUrl field (set to null)
    await prisma.product.update({
      where: { id },
      data: { imageUrl: null },
    });

    // Respond with success after deletion and update
    return NextResponse.json({ success: true }, { status: 200 });
  } 
  catch (error) {
    // Log any unexpected errors and respond with 500
    console.error('Delete image error:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}

