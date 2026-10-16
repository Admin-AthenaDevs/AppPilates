import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") ?? "/";
  let redirectUrl = new URL("/", requestUrl.origin);
  if (requestedNext.startsWith("/") && !requestedNext.startsWith("//")) {
    const requestedRedirect = new URL(requestedNext, requestUrl.origin);
    if (requestedRedirect.origin === requestUrl.origin) redirectUrl = requestedRedirect;
  }
  const response = NextResponse.redirect(redirectUrl);

  if (!code) return NextResponse.redirect(new URL("/login?error=link", requestUrl.origin));

  const { url, publishableKey } = getSupabaseConfig();
  const cookieStore = await cookies();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=link", requestUrl.origin));
  return response;
}