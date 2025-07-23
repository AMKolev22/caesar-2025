import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

import { prisma } from "@/lib/instantiatePrisma"

export async function POST(req: NextRequest) {
    try {
        const organisation = await prisma.organisation.findMany({
        where: { name: "TestOrganisation" },
            include : {
                users: {
                    include : {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                requests: true,
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json({ data: organisation }, { status: 201 });
    } 
    catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'test' }, { status: 400 });
    }
}
