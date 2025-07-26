import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/instantiatePrisma';

export async function DELETE(request: NextRequest, { params }) {
    let { id } = await params;
    id = Number(id)
    if (isNaN(id))
        return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });

    try {

        const item = await prisma.item.findUnique({
            where: { id },
            select: { productId: true },
        });

        await prisma.qRCode.deleteMany({
            where: { itemId: id },
        });

        await prisma.request.deleteMany({
            where: { itemId: id },
        });

        await prisma.item.delete({
            where: { id },
        });

        await prisma.product.update({
            where: { id:  item.productId },
            data: { totalQuantity: { decrement: 1 } },
        });

        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting item:', error);
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}
