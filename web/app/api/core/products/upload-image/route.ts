import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/instantiatePrisma';
import { authConfig } from "@/lib/auth.config";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!session?.customJwt) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let userInfo;
  try {
    userInfo = jwt.verify(session.customJwt, process.env.JWT_SECRET);
  } catch {
    return new NextResponse(JSON.stringify({ error: "Invalid or expired token" }), { status: 401 });
  }

  if (!["ADMIN", "MANAGER"].includes(userInfo.rank)) {
    return new NextResponse(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const formData = await req.formData();
    const productId = formData.get('productId');
    const imageFile = formData.get('image');

    if (!imageFile || typeof productId !== 'string') {
      return new NextResponse(JSON.stringify({ error: 'Missing productId or image' }), { status: 400 });
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const base64Image = buffer.toString('base64');
    const dataUri = `data:${imageFile.type};base64,${base64Image}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: 'products',
      public_id: `${productId}_${Date.now()}`,
    });

    await prisma.product.update({
      where: { id: parseInt(productId, 10) },
      data: { imageUrl: uploadResult.secure_url },
    });

    return new NextResponse(JSON.stringify({ success: true, imageUrl: uploadResult.secure_url }), { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return new NextResponse(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
  }
}
