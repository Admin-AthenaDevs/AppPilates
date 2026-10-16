import "server-only";
import { redirect } from "next/navigation";
import { StudioRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getStudioAccess() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const studioSlug = process.env.NEXT_PUBLIC_STUDIO_SLUG;
  if (!studioSlug) throw new Error("Configura NEXT_PUBLIC_STUDIO_SLUG para seleccionar el estudio.");

  const databaseUser = await prisma.user.findUnique({ where: { supabaseUserId: user.id } });
  if (!databaseUser) return null;

  const membership = await prisma.studioMember.findFirst({
    where: {
      userId: databaseUser.id,
      isActive: true,
      studio: { slug: studioSlug },
    },
    include: { studio: true },
  });
  if (!membership) return null;

  return { authUser: user, databaseUser, membership, studio: membership.studio };
}

export async function requireStudioAccess(roles?: StudioRole[]) {
  if (!isSupabaseConfigured()) throw new Error("Supabase Auth no está configurado.");
  const access = await getStudioAccess();
  if (!access) throw new Error("No hay una sesión activa con membresía en este estudio.");
  if (roles && !roles.includes(access.membership.role)) throw new Error("No tienes permisos para esta operación.");
  return access;
}

export async function redirectToStudio() {
  const access = await getStudioAccess();
  if (!access) redirect(isSupabaseConfigured() ? "/login?error=access" : "/login?error=config");
  return access;
}