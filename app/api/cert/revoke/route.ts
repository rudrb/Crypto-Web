import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const bodySchema = z.object({
  certificateId: z.string().min(1),
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

    const cert = await prisma.certificate.findFirst({
      where: {
        id: parsed.data.certificateId,
        userId: dbUser.id,
      },
    });

    if (!cert) {
      return NextResponse.json(
        { ok: false, message: "Certificate not found" },
        { status: 404 }
      );
    }

    if (cert.status === "REVOKED") {
      return NextResponse.json({
        ok: true,
        certificate: {
          id: cert.id,
          serialNumber: cert.serialNumber,
          status: cert.status,
          revokedAt: cert.revokedAt,
        },
        message: "이미 폐지된 인증서입니다.",
      });
    }

    const updated = await prisma.certificate.update({
      where: { id: cert.id },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      certificate: {
        id: updated.id,
        serialNumber: updated.serialNumber,
        status: updated.status,
        revokedAt: updated.revokedAt,
      },
      message: "인증서 폐지 완료",
    });
  } catch (error) {
    console.error("[CERT_REVOKE_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to revoke certificate",
        error:
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : "Unknown error",
      },
      { status: 500 }
    );
  }
});