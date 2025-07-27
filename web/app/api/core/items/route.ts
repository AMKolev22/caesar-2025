import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/instantiatePrisma";

export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body to get productName and items array
    const { productName, items } = await req.json();

    // Validate input: productName must exist and items must be a non-empty array
    if (!productName || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'productName and non-empty items array are required' },
        { status: 400 }
      );
    }

    // Find the organisation with the fixed name "TestOrganisation"
    const organisation = await prisma.organisation.findUnique({
      where: { name: "TestOrganisation" },
    });

    // If organisation is not found, return 404 error
    if (!organisation) {
      return NextResponse.json(
        { error: 'Organisation not found' },
        { status: 404 }
      );
    }

    // Find the product by name within this organisation
    const product = await prisma.product.findFirst({
      where: {
        name: productName,
        organisationId: organisation.id,
      },
    });

    // If the product does not exist, return 404 error
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Use a transaction to create all new items atomically
    // Each item contains a serialCode and references the product and organisation
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

    // Update the product's total quantity by incrementing it by the number of new items created
    await prisma.product.update({
      where: { id: product.id },
      data: { totalQuantity: { increment: newItems.length } },
    });

    // Return success response with created items and HTTP status 201 Created
    return NextResponse.json({ message: "create", items: newItems }, { status: 201 });
  } catch (error) {
    // Log any unexpected error and return generic 500 error response
    console.error('Error creating items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

