import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const { productName, description } = await req.json();
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
            organisationId: organisation.id,
        },
        });
         return NextResponse.json({ message: 'Product created', product }, {status: 201 });
    }
}
