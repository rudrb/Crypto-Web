import { auth } from "@/auth";
import SectionCard from "@/components/layout/SectionCard";

export default async function ProfilePage() {
  const session = await auth();

  return (
    <SectionCard title="프로필" description="현재 로그인한 사용자 정보입니다.">
      <div className="space-y-2 text-sm">
        <p>이름: {session?.user?.name ?? "-"}</p>
        <p>이메일: {session?.user?.email ?? "-"}</p>
        <p>사용자 ID: {session?.user?.id ?? "-"}</p>
      </div>
    </SectionCard>
  );
}