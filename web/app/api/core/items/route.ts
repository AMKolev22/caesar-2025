import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/instantiatePrisma";

export async function POST(req: NextRequest) {
  try {
    const { productName, items } = await req.json();

    if (!productName || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'productName and non-empty items array are required' },
        { status: 400 }
      );
    }

    const organisation = await prisma.organisation.findUnique({
      where: { name: "TestOrganisation" },
    });

    if (!organisation) {
      return NextResponse.json(
        { error: 'Organisation not found' },
        { status: 404 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        name: productName,
        organisationId: organisation.id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

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

    return NextResponse.json({ message: "create", items: newItems }, { status: 201 });
  } catch (error) {
    console.error('Error creating items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
