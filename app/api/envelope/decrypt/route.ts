import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const bodySchema = z.object({
  envelopeId: z.string().min(1),
});

export const POST = auth(async function POST(req) {
  try {
    const authUser = req.auth?.user;

    if (!authUser?.email) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const rawBody = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid request body",
          issues: parsed.error.flatten(),
        },
        { status: 400 }
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

    const envelope = await prisma.envelope.findFirst({
      where: {
        id: parsed.data.envelopeId,
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
    });

    if (!envelope) {
      return NextResponse.json(
        { ok: false, message: "Envelope not found" },
        { status: 404 }
      );
    }

    if (envelope.status === "UNREAD") {
      await prisma.envelope.update({
        where: { id: envelope.id },
        data: {
          status: "READ",
          readAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      ok: true,
      envelope: {
        id: envelope.id,
        subject: envelope.subject,
        ciphertext: envelope.ciphertext,
        encryptedKey: envelope.encryptedKey,
        signature: envelope.signature,
        createdAt: envelope.createdAt,
        sender: envelope.sender,
      },
    });
  } catch (error) {
    console.error("[ENVELOPE_DECRYPT_PACKAGE_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to load decrypt package",
        error:
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : "Unknown error",
      },
      { status: 500 }
    );
  }
});