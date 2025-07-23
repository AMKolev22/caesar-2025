import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

import { prisma } from "@/lib/instantiatePrisma"
export async function POST(req: NextRequest) {
  try {
    const organisation = await prisma.organisation.findUnique({
      where: { name: "TestOrganisation" },
    });

    const inventory = await prisma.product.findMany({
      where: { organisationId: organisation?.id },
      include: {
        items: {
          include: {
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
            label: true,
          },
        },
      },
    });

    const transformedInventory = inventory.map(product => ({
      ...product,
      labels: product.labels.map(pl => pl.label),
    }));

    return NextResponse.json({ inventory: transformedInventory }, { status: 200 });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}
