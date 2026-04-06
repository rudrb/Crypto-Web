"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
    >
      로그아웃
    </button>
  );
}