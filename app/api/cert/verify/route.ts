import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { verifyCertificate } from "@/lib/forge/ca";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const BodySchema = z.object({
  challengeId: z.string().min(1),
  signatureBase64: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { challengeId, signatureBase64 } = parsed.data;

  const challenge = await prisma.loginChallenge.findUnique({ where: { id: challengeId } });
  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }
  if (challenge.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (challenge.usedAt) {
    return NextResponse.json({ error: "Challenge already used" }, { status: 400 });
  }
  if (challenge.expiresAt < new Date()) {
    return NextResponse.json({ error: "Challenge expired" }, { status: 400 });
  }

  const certificate = await prisma.certificate.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
  });
  if (!certificate) {
    return NextResponse.json({ error: "No active certificate" }, { status: 404 });
  }

  let caCertPem: string;
  try {
    caCertPem = await fs.readFile(path.join(process.cwd(), "ca-cert.pem"), "utf8");
  } catch {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const isCertValid = verifyCertificate(certificate.certificatePem, caCertPem);
  if (!isCertValid) {
    return NextResponse.json({ error: "Certificate invalid" }, { status: 400 });
  }

  try {
    const verifier = crypto.createVerify("sha256");
    verifier.update(challenge.challenge);
    verifier.end();
    const signatureBuffer = Buffer.from(signatureBase64, "base64");
    const validSignature = verifier.verify(certificate.publicKeyPem, signatureBuffer);
    if (!validSignature) {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Failed to verify signature" }, { status: 400 });
  }

  await prisma.loginChallenge.update({
    where: { id: challengeId },
    data: { usedAt: new Date() },
  });

  return NextResponse.json({
    success: true,
    certificate: {
      id: certificate.id,
      status: certificate.status,
      expiresAt: certificate.expiresAt,
    },
  });
}
