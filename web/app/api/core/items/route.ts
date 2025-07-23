import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

import { prisma } from "@/lib/instantiatePrisma"

export async function POST(req: NextRequest) {

    const { productName, items } = await req.json();
    const organisation = await prisma.organisation.findUnique({
      where: { name: "TestOrganisation" },
    });

    const product = await prisma.product.findFirst({
      where: {
        name: productName,
        organisationId: organisation.id,
      },
    });

    const newItems = await prisma.$transaction(
      items.map((item: { serialCode: string }) =>
        prisma.item.create({
          data: {
            serialCode: item.serialCode,
            productId: product.id,
            organisationId: organisation.id,
          },
        })
      )
    );

    await prisma.product.update({
      where: { id: product.id },
      data: { totalQuantity: { increment: newItems.length } },
    });
    // ne znam zashto kat mahna message i nsitho ne se izpisva
    return NextResponse.json({message: "create", items: newItems}, {status: 201});

}
