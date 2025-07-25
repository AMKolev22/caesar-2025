import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/instantiatePrisma';

export async function DELETE(request: NextRequest, { params }) {
    let itemId = await params.id;
    itemId = Number(itemId)
    if (isNaN(itemId)) {
        return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    try {
        await prisma.qRCode.deleteMany({
            where: { itemId },
        });

        await prisma.request.deleteMany({
            where: { itemId },
        });

        await prisma.item.delete({
            where: { id: itemId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting item:', error);
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}
