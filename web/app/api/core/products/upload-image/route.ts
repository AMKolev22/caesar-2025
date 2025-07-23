import { promises as fs } from 'fs';
import path from 'path';
import { PrismaClient } from '@/generated/prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from "@/lib/instantiatePrisma"

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const productId = formData.get('productId');
    const imageFile = formData.get('image'); // file obj

    if (!imageFile || typeof productId !== 'string') {
      return new NextResponse(JSON.stringify({ error: 'Missing productId or image' }), { status: 400 });
    }

    // reads the file data as a buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // creates upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    await fs.mkdir(uploadDir, { recursive: true });

    // generates unique filename
    const filename = `${productId}_${Date.now()}_${imageFile.name}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer);

    // updates product with image URL
    const imageUrl = `/uploads/products/${filename}`;
    await prisma.product.update({
      where: { id: parseInt(productId, 10) },
      data: { imageUrl },
    });

    return new NextResponse(JSON.stringify({ success: true, imageUrl }), { status: 200 });
  } 
  catch (error) {
    console.error('Upload error:', error);
    return new NextResponse(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
  }
}