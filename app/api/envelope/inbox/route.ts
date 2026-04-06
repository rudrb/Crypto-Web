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
    });

    if (!dbUser) {
      return NextResponse.json(
        { ok: false, message: "DB user not found" },
        { status: 404 }
      );
    }

    const items = await prisma.envelope.findMany({
      where: {
        receiverId: dbUser.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      ok: true,
      items: items.map((item) => ({
        id: item.id,
        subject: item.subject,
        status: item.status,
        createdAt: item.createdAt,
        readAt: item.readAt,
        sender: item.sender,
      })),
    });
  } catch (error) {
    console.error("[ENVELOPE_INBOX_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to load inbox",
        error:
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : "Unknown error",
      },
      { status: 500 }
    );
  }
});