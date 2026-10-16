"use client";

import { useSearchParams } from "next/navigation";
import LoginForm from "@/components/login-form";

export default function LoginShell({ configured }: { configured: boolean }) {
  const searchParams = useSearchParams();
  const accessError = searchParams.get("error") ?? "";

  return <LoginForm accessError={accessError} configured={configured} />;
}
