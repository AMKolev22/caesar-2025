import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/instantiatePrisma';
import { authConfig } from "@/lib/auth.config";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";

// Configure Cloudinary SDK with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Disable Next.js built-in body parsing for this API route
// because we will manually handle multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  // Get user session with auth config
  const session = await getServerSession(authConfig);

  // Reject if no valid JWT token present in session
  if (!session?.customJwt) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let userInfo;
  try {
    // Verify JWT token and extract user info
    userInfo = jwt.verify(session.customJwt, process.env.JWT_SECRET);
  } catch {
    // JWT invalid or expired
    return new NextResponse(JSON.stringify({ error: "Invalid or expired token" }), { status: 401 });
  }

  // Only allow users with ADMIN or MANAGER rank
  if (!["ADMIN", "MANAGER"].includes(userInfo.rank)) {
    return new NextResponse(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    // Parse multipart/form-data from the request
    const formData = await req.formData();

    // Extract productId and image file from form data
    const productId = formData.get('productId');
    const imageFile = formData.get('image');

    // Validate inputs - productId must be a string and image must be present
    if (!imageFile || typeof productId !== 'string') {
      return new NextResponse(JSON.stringify({ error: 'Missing productId or image' }), { status: 400 });
    }

    // Read the image file as an ArrayBuffer
    const arrayBuffer = await imageFile.arrayBuffer();

    // Convert ArrayBuffer to Node.js Buffer
    const buffer = Buffer.from(arrayBuffer);

    // Convert buffer to base64 string for data URI upload
    const base64Image = buffer.toString('base64');

    // Create data URI required by Cloudinary upload method
    const dataUri = `data:${imageFile.type};base64,${base64Image}`;

    // Upload image to Cloudinary under "products" folder with unique public_id
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: 'products',
      public_id: `${productId}_${Date.now()}`,
    });

    // Update the product record with the new image URL from Cloudinary
    await prisma.product.update({
      where: { id: parseInt(productId, 10) },
      data: { imageUrl: uploadResult.secure_url },
    });

    // Return success response with the uploaded image URL
    return new NextResponse(JSON.stringify({ success: true, imageUrl: uploadResult.secure_url }), { status: 200 });
  } catch (error) {
    // Log and return error response on failure
    console.error('Upload error:', error);
    return new NextResponse(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
  }
}

