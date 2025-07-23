import { prisma } from "@/lib/instantiatePrisma"
import { NextResponse, NextRequest } from "next/server";

export async function PATCH(request: NextRequest, { params }) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    
    const body = await request.json();
    const { rank } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) 
      return NextResponse.json({ error: 'User not found' },{ status: 404 });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { rank },
      select: {
        id: true,
        email: true,
        name: true,
        rank: true,
      }
    });

    return NextResponse.json({ message: 'User rank updated successfully', user: updatedUser });

  } 
  catch (error) {
    console.error('Error updating user rank:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 } );
  }
}