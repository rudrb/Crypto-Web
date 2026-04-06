import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const GET = auth(async function GET(req) {
  const user = req.auth?.user;

  if (!user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      certificates: {
        where: { status: "ACTIVE" },
        orderBy: { issuedAt: "desc" },
        select: {
          id: true,
          serialNumber: true,
          status: true,
          issuedAt: true,
          expiresAt: true,
        },
      },
    },
  });

  if (!dbUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    image: dbUser.image,
    activeCertificates: dbUser.certificates,
  });
});