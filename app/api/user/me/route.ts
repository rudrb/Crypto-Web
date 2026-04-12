import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export const GET = auth(async function GET(req) {
  try {
    const authUser = req.auth?.user;

    if (!authUser?.email) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email },
      include: {
        certificates: {
          orderBy: { issuedAt: "desc" },
          select: {
            id: true,
            serialNumber: true,
            status: true,
            issuedAt: true,
            expiresAt: true,
            revokedAt: true,
            certificatePem: true,
          },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({
        ok: true,
        id: null,
        name: authUser.name ?? null,
        email: authUser.email,
        image: authUser.image ?? null,
        certificates: [],
      });
    }

    return NextResponse.json({
      ok: true,
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      image: dbUser.image,
      certificates: dbUser.certificates,
    });
  } catch (error) {
    console.error("[USER_ME_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch user info",
        error:
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : "Unknown error",
      },
      { status: 500 }
    );
  }
});