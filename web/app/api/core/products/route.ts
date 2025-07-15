import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const { productName, description, location } = await req.json();
    const organisation = await prisma.organisation.findUnique({
      where: { name: "TestOrganisation" },
    });
    const exists = await prisma.product.findFirst({
      where: {
        name: productName,
        organisationId: organisation.id,
      },
    });
    if (!exists){
        const product = await prisma.product.create({
        data: {
            name: productName,
            description,
            location,
            organisationId: organisation.id,
        },
        });
         return NextResponse.json({ product }, {status: 201 });
    }
}
