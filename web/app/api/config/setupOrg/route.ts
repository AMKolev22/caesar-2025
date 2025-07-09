import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const organisation = await prisma.organisation.create({
        data: { name: "TestOrganisation" },
        });

        return NextResponse.json({ data: organisation }, { status: 201 });
    } 
    catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'test' }, { status: 400 });
    }
}
