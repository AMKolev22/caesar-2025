import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

import { prisma } from "@/lib/instantiatePrisma"

export async function POST(req: NextRequest) {
  const { email, name, isAdmin} = await req.json()

  try {
    const organisation = await prisma.organisation.findUnique({
      where: { name: "TestOrganisation" },
    });

    if (!organisation)
       return NextResponse.json({ error: 'test' }, { status: 400 });

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { email, name, isAdmin: !!isAdmin },
      });
    }

    let data = await prisma.userOrganisation.create({
      data: {
        userId: user.id,
        organisationId: organisation.id,
      },
    });

    return NextResponse.json({ data }, { status: 201 });
  } 
  catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'test' }, { status: 400 });
  }
}
