import SignOutButton from "@/components/auth/GoogleSignOutButton";

type AppHeaderProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
};

export default function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Cert Auth Dashboard</h1>
          <p className="text-sm text-slate-500">
            {user.name ?? "사용자"} / {user.email ?? "이메일 없음"}
          </p>
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}