import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth.config"
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/instantiatePrisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.customJwt) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let info;
  try {
    info = jwt.verify(session.customJwt, process.env.JWT_SECRET);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
  }

  const { serialCode, type = "BORROW" } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: info.email },
  });

  const organisation = await prisma.organisation.findUnique({
    where: { name: "TestOrganisation" },
  });

  const item = await prisma.item.findFirst({
    where: {
      serialCode,
      organisationId: organisation?.id,
    },
  });

  const request = await prisma.request.create({
    data: {
      userId: user!.id,
      itemId: item!.id,
      organisationId: organisation!.id,
      type,
      status: "PENDING",
    },
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  await prisma.statusLog.create({
    data: {
      requestId: request.id,
      status: "PENDING",
      changedByName: user!.name,
    },
  });

  return NextResponse.json({ request }, { status: 201 });
}
