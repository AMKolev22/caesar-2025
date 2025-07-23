import QRCode from 'qrcode';
import { PrismaClient } from '@/generated/prisma/client';
import { prisma } from "@/lib/instantiatePrisma"


export async function saveQrCode(itemId: number) {
  
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  const url = `https://localhost:3000/dynamic/${encodeURIComponent(item.serialCode)}`;
  const base64Image = await QRCode.toDataURL(url);

  const qrCode = await prisma.qRCode.create({
    data: {
      image: base64Image,
      itemId: item.id,
    },
  });

  return qrCode;
}

