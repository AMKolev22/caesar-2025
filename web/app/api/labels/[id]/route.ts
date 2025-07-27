import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/instantiatePrisma';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {

  // Extracts id from requests Params
  const { id } = await params;
  const labelId = Number(id);

  // Deletes labels associated with it
  try {
    await prisma.$transaction([
      prisma.productLabel.deleteMany({
        where: { labelId },
      }),

      prisma.workflow.deleteMany({
        where: { labelId },
      }),

      prisma.label.delete({
        where: { id: labelId },
      }),
    ]);

    return NextResponse.json({ message: 'Label deleted successfully' }, { status: 200 });
  } 
  catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete label' }, { status: 500 });
  }
}