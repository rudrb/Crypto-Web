import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { randomChallenge } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const challenge = randomChallenge();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const row = await prisma.loginChallenge.create({
    data: {
      userId: session.user.id,
      challenge,
      purpose: "CERT_ACTION",
      expiresAt,
    },
  });

  return NextResponse.json({
    id: row.id,
    challenge: row.challenge,
    purpose: row.purpose,
    expiresAt: row.expiresAt,
  });
}