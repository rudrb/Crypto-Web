import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import crypto from "node:crypto";

export const runtime = "nodejs";

function createChallenge() {
  return crypto.randomBytes(32).toString("base64url");
}

export const POST = auth(async function POST(req) {
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

    const challenge = createChallenge();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const row = await prisma.loginChallenge.create({
      data: {
        userId: dbUser.id,
        challenge,
        purpose: "SIGN_LOGIN",
        used: false,
        expiresAt,
      },
    });

    return NextResponse.json({
      ok: true,
      challengeId: row.id,
      challenge: row.challenge,
      expiresAt: row.expiresAt,
      certificate: {
        id: activeCert.id,
        serialNumber: activeCert.serialNumber,
      },
    });
  } catch (error) {
    console.error("[SIGN_LOGIN_CHALLENGE_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to create challenge",
        error:
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : "Unknown error",
      },
      { status: 500 }
    );
  }
});