import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const studioSlug = process.env.NEXT_PUBLIC_STUDIO_SLUG;
  const studioName = process.env.NEXT_PUBLIC_STUDIO_NAME;
  const authUserId = process.env.STUDIO_OWNER_AUTH_USER_ID;
  const email = process.env.STUDIO_OWNER_EMAIL;
  const name = process.env.STUDIO_OWNER_NAME;

  if (!studioSlug || !studioName || !authUserId || !email || !name) {
    throw new Error(
      "Define NEXT_PUBLIC_STUDIO_SLUG, NEXT_PUBLIC_STUDIO_NAME, STUDIO_OWNER_AUTH_USER_ID, STUDIO_OWNER_EMAIL y STUDIO_OWNER_NAME antes de sembrar la base de datos.",
    );
  }

  const studio = await prisma.studio.upsert({
    where: { slug: studioSlug },
    update: { name: studioName },
    create: { slug: studioSlug, name: studioName },
  });

  const user = await prisma.user.upsert({
    where: { supabaseUserId: authUserId },
    update: { email, name },
    create: { supabaseUserId: authUserId, email, name },
  });

  await prisma.studioMember.upsert({
    where: { studioId_userId: { studioId: studio.id, userId: user.id } },
    update: { role: "OWNER", isActive: true },
    create: { studioId: studio.id, userId: user.id, role: "OWNER" },
  });

  console.info(`Administrador inicial enlazado al estudio "${studio.slug}".`);
}

main()
  .catch((error) => {
    console.error("No se pudo inicializar el administrador del estudio:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
