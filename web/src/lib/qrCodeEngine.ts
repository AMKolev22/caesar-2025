import QRCode from 'qrcode';
import { PrismaClient } from '@/generated/prisma/client';
import { prisma } from "@/lib/instantiatePrisma"


export async function saveQrCode(itemId: number) {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) throw new Error('Item not found');

  const url = `https://localhost:3000/dynamic/${encodeURIComponent(item.serialCode)}`;

  // generate qr code
  const base64Image = await QRCode.toDataURL(url);
  if (!base64Image || !base64Image.startsWith('data:image/png;base64,')) {
    throw new Error('Failed to generate QR code');
  }

  const qrRecord = await prisma.qRCode.create({
    data: {
      image: base64Image,
      itemId: item.id,
    },
  });

  return qrRecord;
}

