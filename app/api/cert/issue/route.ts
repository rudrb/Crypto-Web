import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const bodySchema = z.object({
  publicKeyPem: z.string().min(1),
});

function loadPemFile(filename: string) {
  const filePath = path.join(process.cwd(), filename);
  return fs.readFileSync(filePath, "utf8");
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

    console.log("[CERT_ISSUE] auth ok", {
      email: authUser.email,
      name: authUser.name,
    });

    const rawBody = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(rawBody);

    if (!parsed.success) {
      console.log("[CERT_ISSUE] invalid body", parsed.error.flatten());

      return NextResponse.json(
        {
          ok: false,
          message: "Invalid request body",
          issues: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    console.log("[CERT_ISSUE] body parsed");

    const caCertPem = loadPemFile("ca-cert.pem");
    const caPrivateKeyPem = loadPemFile("ca-private-key.pem");

    console.log("[CERT_ISSUE] pem files loaded");

    const { issueCertificate } = await import("@/lib/forge/certificate");

    console.log("[CERT_ISSUE] before issueCertificate");

    const issued = issueCertificate({
      userEmail: authUser.email,
      userName: authUser.name,
      publicKeyPem: parsed.data.publicKeyPem,
      caCertPem,
      caPrivateKeyPem,
      days: 365,
    });

    console.log("[CERT_ISSUE] issueCertificate ok", {
      serialNumber: issued.serialNumber,
    });

    const dbUser = await prisma.user.upsert({
      where: { email: authUser.email },
      update: {
        name: authUser.name ?? undefined,
        image: authUser.image ?? undefined,
      },
      create: {
        email: authUser.email,
        name: authUser.name ?? null,
        image: authUser.image ?? null,
      },
    });

    console.log("[CERT_ISSUE] user upsert ok", {
      id: dbUser.id,
      email: dbUser.email,
    });

    const certificate = await prisma.certificate.create({
      data: {
        userId: dbUser.id,
        serialNumber: issued.serialNumber,
        publicKeyPem: parsed.data.publicKeyPem,
        certificatePem: issued.certificatePem,
        status: "ACTIVE",
        issuedAt: issued.issuedAt,
        expiresAt: issued.expiresAt,
      },
    });

    console.log("[CERT_ISSUE] certificate create ok", {
      id: certificate.id,
      serialNumber: certificate.serialNumber,
    });

    return NextResponse.json({
      ok: true,
      certificate: {
        id: certificate.id,
        serialNumber: certificate.serialNumber,
        status: certificate.status,
        issuedAt: certificate.issuedAt,
        expiresAt: certificate.expiresAt,
        certificatePem: certificate.certificatePem,
      },
    });
  } catch (error) {
    console.error("[CERT_ISSUE_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Certificate issuance failed",
        error:
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : "Unknown error",
      },
      { status: 500 }
    );
    
  }
}
);