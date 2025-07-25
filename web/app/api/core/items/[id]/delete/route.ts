import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/instantiatePrisma';

export async function DELETE(request: NextRequest, { params }) {
    let { id } = await params;
    id = Number(id)
    if (isNaN(id))
        return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });

    try {
        await prisma.qRCode.deleteMany({
            where: { itemId: id },
        });

        await prisma.request.deleteMany({
            where: { itemId: id },
        });

        await prisma.item.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } 
    catch (error) {
        console.error('Error deleting item:', error);
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}
