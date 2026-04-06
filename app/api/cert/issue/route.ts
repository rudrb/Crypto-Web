import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { issueCertificate } from "@/lib/forge/certificate";

export const runtime = "nodejs";

const bodySchema = z.object({
  publicKeyPem: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.email) {
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

    const caCertPem = process.env.CA_CERT_PEM;
    const caPrivateKeyPem = process.env.CA_PRIVATE_KEY_PEM;

    if (!caCertPem || !caPrivateKeyPem) {
      return NextResponse.json(
        {
          ok: false,
          message: "CA_CERT_PEM or CA_PRIVATE_KEY_PEM is missing",
        },
        { status: 500 }
      );
    }

    const issued = issueCertificate({
      userEmail: session.user.email,
      userName: session.user.name,
      publicKeyPem: parsed.data.publicKeyPem,
      caCertPem,
      caPrivateKeyPem,
      days: 365,
    });

    const certificate = await prisma.certificate.create({
      data: {
        userId: session.user.id,
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
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}