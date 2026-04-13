import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export const POST = auth(async function POST(req) {
  try {
    const authUser = req.auth?.user;

    if (!authUser?.email) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.upsert({
      where: { email: authUser.email },
      update: {
        name: authUser.name ?? null,
        image: authUser.image ?? null,
      },
      create: {
        email: authUser.email,
        name: authUser.name ?? null,
        image: authUser.image ?? null,
      },
    });

    const challenge = crypto.randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const saved = await prisma.loginChallenge.create({
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
      challenge: saved.challenge,
      expiresAt: saved.expiresAt,
    });
  } catch (error) {
    console.error("[CERT_CHALLENGE_ERROR]", error);

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