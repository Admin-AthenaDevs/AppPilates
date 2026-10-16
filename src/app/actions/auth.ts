"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`No se pudo cerrar la sesión: ${error.message}`);
  redirect("/login");
}

export async function updatePassword(_previousState: { error: string }, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password.length < 12) return { error: "La contraseña debe tener al menos 12 caracteres." };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "El enlace ha caducado. Solicita una invitación nueva." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/");
}