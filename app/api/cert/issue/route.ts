import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const bodySchema = z.object({
  publicKeyPem: z.string().min(1),
});

function normalizePem(value?: string) {
  if (!value) return null;
  return value.includes("\\n") ? value.replace(/\\n/g, "\n") : value;
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

    const caCertPem = normalizePem(process.env.CA_CERT_PEM);
    const caPrivateKeyPem = normalizePem(process.env.CA_KEY_PEM);

    if (!caCertPem || !caPrivateKeyPem) {
      return NextResponse.json(
        {
          ok: false,
          message: "Missing CA_CERT_PEM or CA_KEY_PEM",
        },
        { status: 500 }
      );
    }

    const { issueCertificate } = await import("@/lib/forge/certificate");

    const issued = issueCertificate({
      userEmail: authUser.email,
      userName: authUser.name,
      publicKeyPem: parsed.data.publicKeyPem,
      caCertPem,
      caPrivateKeyPem,
      days: 365,
    });

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
});