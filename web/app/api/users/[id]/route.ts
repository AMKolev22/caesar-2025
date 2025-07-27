import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/instantiatePrisma'

export async function DELETE(req: NextRequest, { params }) {
  const { id } = await params;
  const userId = Number(id);
  console.log(userId);

  if (isNaN(userId))
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })

  try {
    await prisma.request.deleteMany({
      where: { userId },
    })

    await prisma.item.updateMany({
      where: { assignedTo: userId },
      data: { assignedTo: null, status: "AVAILABLE",  },
    })

    await prisma.userOrganisation.deleteMany({
      where: { userId },
    })

    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ message: 'User and related data deleted successfully', user: deletedUser }, { status: 200 })
  } 
  catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}