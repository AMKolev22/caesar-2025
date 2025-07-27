import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma'
import { prisma } from "@/lib/instantiatePrisma"

export async function GET(req: NextRequest) {
  try {
    // Find organisation by fixed name "TestOrganisation"
    const organisation = await prisma.organisation.findUnique({
      where: { name: "TestOrganisation" },
    });

    // Fetch all labels belonging to the organisation, ordered by name ascending
    const labels = await prisma.label.findMany({
      where: { organisationId: organisation?.id },
      orderBy: { name: 'asc' },
    });

    // Return labels in JSON with HTTP 200 OK
    return NextResponse.json({ labels }, { status: 200 });
  } 
  catch (error) {
    // Log and return error if something fails
    console.error('Error fetching labels:', error);
    return NextResponse.json({ error: 'Failed to fetch labels' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse name and color from request body JSON
    const { name, color } = await req.json();
    
    // Find organisation by fixed name "TestOrganisation"
    const organisation = await prisma.organisation.findUnique({
      where: { name: "TestOrganisation" },
    });

    // If organisation not found, return 404
    if (!organisation) {
      return NextResponse.json({ error: 'Organisation not found' }, { status: 404 });
    }

    // Create new label with given name, color, and organisationId
    const label = await prisma.label.create({
      data: {
        name,
        color,
        organisationId: organisation.id,
      },
    });

    // Return newly created label with HTTP 201 Created
    return NextResponse.json({ label }, { status: 201 });
  } 
  catch (error) {
    // Log and return error if creation fails
    console.error('Error creating label:', error);
    return NextResponse.json({ error: 'Failed to create label' }, { status: 500 });
  }
}
