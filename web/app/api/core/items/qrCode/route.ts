import { NextRequest, NextResponse } from 'next/server';
import { saveQrCode } from '@/lib/qrCodeEngine';
import { prisma } from "@/lib/instantiatePrisma"

export async function GET(req: NextRequest) {
  // Extract the itemId from the query parameters of the request URL
  const { searchParams } = new URL(req.url);
  const itemId = Number(searchParams.get('itemId'));

  try {
    // Attempt to find an existing QR code record for the given itemId
    let qr = await prisma.qRCode.findFirst({ where: { itemId } });

    // If no QR code exists, generate and save a new one
    if (!qr)
      qr = await saveQrCode(itemId);

    // Validate that the QR code image exists and has the correct base64 PNG data URL format
    if (!qr.image || !qr.image.startsWith('data:image/png;base64,'))
      return NextResponse.json({ error: 'Invalid QR image format' }, { status: 500 });

    // Remove the base64 prefix from the image data
    const base64 = qr.image.replace(/^data:image\/png;base64,/, '');
    // Convert the base64 string to a Buffer for binary data transfer
    const buffer = Buffer.from(base64, 'base64');

    // Return the PNG image as a binary response with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="qr.png"',
      },
    });
  } 
  catch (err: any) {
    // Log the error and return a JSON error response
    console.error(err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

