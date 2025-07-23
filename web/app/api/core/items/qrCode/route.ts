import { NextRequest, NextResponse } from 'next/server';
import { saveQrCode } from '@/lib/qrCodeEngine';
import { PrismaClient } from '@/generated/prisma';
import { prisma } from "@/lib/instantiatePrisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const itemId = Number(searchParams.get('itemId'));

  try {
    let qr = await prisma.qRCode.findFirst({ where: { itemId } });
    if (!qr)
      qr = await saveQrCode(itemId);

    if (!qr.image || !qr.image.startsWith('data:image/png;base64,'))
      return NextResponse.json({ error: 'Invalid QR image format' }, { status: 500 });

    const base64 = qr.image.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="qr.png"',
      },
    });
  } 
  catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
