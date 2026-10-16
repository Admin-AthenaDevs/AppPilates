import { Suspense } from "react";
import LoginFallback from "@/components/login-fallback";
import LoginShell from "@/components/login-shell";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <Suspense fallback={<LoginFallback configured={configured} />}>
      <LoginShell configured={configured} />
    </Suspense>
  );
}