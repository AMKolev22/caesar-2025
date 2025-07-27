import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

import { prisma } from "@/lib/instantiatePrisma"
export async function POST(req: NextRequest) {
  try {
    // Find organisation by name "TestOrganisation"
    const organisation = await prisma.organisation.findUnique({
      where: { name: "TestOrganisation" },
    });

    // Fetch all products for this organisation including their items and labels
    const inventory = await prisma.product.findMany({
      where: { organisationId: organisation?.id },
      include: {
        items: {
          include: {
            // For each item, include assigned user's name and email
            assignedUser: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        labels: {
          include: {
            // Include label details nested in the product-label join table
            label: true,
          },
        },
      },
    });

    // Transform inventory to replace labels array with just the label objects
    const transformedInventory = inventory.map(product => ({
      ...product,
      labels: product.labels.map(pl => pl.label),
    }));

    // Return transformed inventory as JSON with status 200
    return NextResponse.json({ inventory: transformedInventory }, { status: 200 });
  } catch (error) {
    // Log error and return 500 response with error message
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

