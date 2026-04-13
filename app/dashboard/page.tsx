import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import DashboardOverview from "@/components/dashboard-overview";

export default async function DashboardPage() {
  const session = await auth();
  const userEmail = session?.user?.email ?? null;

  const dbUser = userEmail
    ? await prisma.user.findUnique({
        where: { email: userEmail },
        include: {
          certificates: {
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          receivedEnvelopes: true,
        },
      })
    : null;

  return (
    <DashboardOverview
      isLoggedIn={!!session?.user}
      hasCertificate={!!dbUser?.certificates?.length}
      receivedCount={dbUser?.receivedEnvelopes?.length ?? 0}
    />
  );
}