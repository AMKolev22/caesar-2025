import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth.config"
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/instantiatePrisma";
import { NextResponse, NextRequest } from "next/server";

export async function POST() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.customJwt) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const info = jwt.verify(session.customJwt, process.env.JWT_SECRET);

    if (!info.email) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: info.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const requests = await prisma.request.findMany({
      where: {
        userId: user.id,
      },
      include: {
        item: {
          include: {
            product: {
              include: {
                labels: {
                  include: {
                    label: true,
                  },
                },
              },
            },
          },
        },
        statusLogs: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const transformedRequests = requests.map((request) => ({
      id: request.id,
      type: request.type,
      status: request.status,
      createdAt: request.createdAt,
      item: {
        id: request.item.id,
        serialCode: request.item.serialCode,
        status: request.item.status,
        product: {
          id: request.item.product.id,
          name: request.item.product.name,
          description: request.item.product.description,
          imageUrl: request.item.product.imageUrl,
          location: request.item.product.location,
          labels: request.item.product.labels.map((pl) => pl.label),
        },
      },
      statusLogs: request.statusLogs,
    }));

    return NextResponse.json({
      success: true,
      requests: transformedRequests,
    });
  } catch (error) {
    console.error("Error fetching user requests:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}