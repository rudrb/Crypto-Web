import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const bodySchema = z.object({
  receiverEmail: z.string().email(),
  subject: z.string().max(200).optional(),
  plaintext: z.string().min(1),
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

    const sender = await prisma.user.findUnique({
      where: { email: authUser.email },
      include: {
        certificates: {
          where: { status: "ACTIVE" },
          orderBy: { issuedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!sender) {
      return NextResponse.json(
        { ok: false, message: "Sender DB user not found" },
        { status: 404 }
      );
    }

    const senderCert = sender.certificates[0];
    if (!senderCert) {
      return NextResponse.json(
        { ok: false, message: "Sender active certificate not found" },
        { status: 400 }
      );
    }

    const receiver = await prisma.user.findUnique({
      where: { email: parsed.data.receiverEmail },
      include: {
        certificates: {
          where: { status: "ACTIVE" },
          orderBy: { issuedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!receiver) {
      return NextResponse.json(
        { ok: false, message: "Receiver DB user not found" },
        { status: 404 }
      );
    }

    const receiverCert = receiver.certificates[0];
    if (!receiverCert) {
      return NextResponse.json(
        { ok: false, message: "Receiver active certificate not found" },
        { status: 400 }
      );
    }

    const { verifySignatureWithPublicKey } = await import("@/lib/forge/sign");

    const signatureOk = verifySignatureWithPublicKey(
      senderCert.publicKeyPem,
      parsed.data.plaintext,
      parsed.data.signatureBase64
    );

    if (!signatureOk) {
      return NextResponse.json(
        { ok: false, message: "Invalid sender signature" },
        { status: 400 }
      );
    }

    const { encryptEnvelope } = await import("@/lib/forge/envelope");

    const encrypted = encryptEnvelope(
      receiverCert.publicKeyPem,
      parsed.data.plaintext
    );

    const envelope = await prisma.envelope.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        subject: parsed.data.subject,
        ciphertext: encrypted.ciphertext,
        encryptedKey: encrypted.encryptedKey,
        signature: parsed.data.signatureBase64,
        status: "UNREAD",
      },
    });

    return NextResponse.json({
      ok: true,
      envelope: {
        id: envelope.id,
        subject: envelope.subject,
        status: envelope.status,
        createdAt: envelope.createdAt,
      },
    });
  } catch (error) {
    console.error("[ENVELOPE_SEND_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to send envelope",
        error:
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : "Unknown error",
      },
      { status: 500 }
    );
  }
});