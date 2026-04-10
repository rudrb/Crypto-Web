import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/lib/db";

const BodySchema = z.object({
  certId: z.string().min(1),
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
  const { certId } = parsed.data;

  const certificate = await prisma.certificate.findUnique({ where: { id: certId } });
  if (!certificate) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }
  if (certificate.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (certificate.status === "REVOKED") {
    return NextResponse.json({ error: "Certificate already revoked" }, { status: 400 });
  }

  const updated = await prisma.certificate.update({
    where: { id: certId },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    message: "Certificate revoked",
    certificate: {
      id: updated.id,
      status: updated.status,
      revokedAt: updated.revokedAt,
    },
  });
}
