import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma'
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const organisation = await prisma.organisation.findUnique({
      where: { name: "TestOrganisation" },
    });

    const labels = await prisma.label.findMany({
      where: { organisationId: organisation?.id },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ labels }, { status: 200 });
  } 
  catch (error) {
    console.error('Error fetching labels:', error);
    return NextResponse.json({ error: 'Failed to fetch labels' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, color } = await req.json();
    
    const organisation = await prisma.organisation.findUnique({
      where: { name: "TestOrganisation" },
    });

    if (!organisation) {
      return NextResponse.json({ error: 'Organisation not found' }, { status: 404 });
    }

    const label = await prisma.label.create({
      data: {
        name,
        color,
        organisationId: organisation.id,
      },
    });

    return NextResponse.json({ label }, { status: 201 });
  } 
  catch (error) {
    console.error('Error creating label:', error);
    return NextResponse.json({ error: 'Failed to create label' }, { status: 500 });
  }
}