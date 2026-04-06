import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const bodySchema = z.object({
  challengeId: z.string().min(1),
  signatureBase64: z.string().min(1),
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
      include: {
        certificates: {
          where: { status: "ACTIVE" },
          orderBy: { issuedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { ok: false, message: "DB user not found" },
        { status: 404 }
      );
    }

    const activeCert = dbUser.certificates[0];

    if (!activeCert) {
      return NextResponse.json(
        { ok: false, message: "Active certificate not found" },
        { status: 400 }
      );
    }

    const challengeRow = await prisma.loginChallenge.findFirst({
      where: {
        id: parsed.data.challengeId,
        userId: dbUser.id,
        purpose: "SIGN_LOGIN",
        used: false,
      },
    });

    if (!challengeRow) {
      return NextResponse.json(
        { ok: false, message: "Challenge not found or already used" },
        { status: 404 }
      );
    }

    if (challengeRow.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { ok: false, message: "Challenge expired" },
        { status: 400 }
      );
    }

    const { verifySignatureWithPublicKey } = await import("@/lib/forge/sign");

    const verified = verifySignatureWithPublicKey(
      activeCert.publicKeyPem,
      challengeRow.challenge,
      parsed.data.signatureBase64
    );

    if (!verified) {
      return NextResponse.json(
        { ok: false, message: "Signature verification failed" },
        { status: 400 }
      );
    }

    await prisma.loginChallenge.update({
      where: { id: challengeRow.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      verified: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
      },
      certificate: {
        id: activeCert.id,
        serialNumber: activeCert.serialNumber,
      },
    });
  } catch (error) {
    console.error("[SIGN_LOGIN_VERIFY_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to verify signature",
        error:
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : "Unknown error",
      },
      { status: 500 }
    );
  }
});