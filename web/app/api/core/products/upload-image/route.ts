import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { PrismaClient } from '@/generated/prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const productId = formData.get('productId');
    const imageFile = formData.get('image'); // This is a File object

    if (!imageFile || typeof productId !== 'string') {
      return new NextResponse(JSON.stringify({ error: 'Missing productId or image' }), { status: 400 });
    }

    // Read the file data as a buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const filename = `${productId}_${Date.now()}_${imageFile.name}`;
    const filepath = path.join(uploadDir, filename);

    // Write buffer to file
    await fs.writeFile(filepath, buffer);

    // Update product with image URL
    const imageUrl = `/uploads/products/${filename}`;
    await prisma.product.update({
      where: { id: parseInt(productId, 10) },
      data: { imageUrl },
    });

    return new NextResponse(JSON.stringify({ success: true, imageUrl }), { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return new NextResponse(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
  }
}