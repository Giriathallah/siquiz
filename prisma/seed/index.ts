// prisma/seed/index.ts
import prisma from "@/lib/prisma";
import { UserRole } from "@/generated/prisma";
import { hashPassword, generateSalt } from "@/lib/auth/passwordHasher";

async function main() {
  console.log("Memulai proses seeding...");

  const salt = generateSalt();

  // Seed Admin User
  const adminPassword = await hashPassword("asdasdasd", salt);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@gnews.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@gnews.com",
      password: adminPassword,
      salt: salt,
      role: UserRole.admin,
      emailVerified: new Date(),
      avatarUrl: null,
    },
  });
  console.log(`Pengguna Admin dibuat: ${adminUser.email}`);

  const categoriesData = [
    {
      name: "Programming",
      description: "Pertanyaan seputar bahasa pemrograman dan logika.",
    },
    {
      name: "History",
      description: "Pertanyaan seputar sejarah dunia dan nasional.",
    },
    {
      name: "Science",
      description: "Pertanyaan seputar ilmu pengetahuan alam dan sosial.",
    },
    {
      name: "Mathematics",
      description: "Pertanyaan seputar konsep dan rumus matematika.",
    },
    { name: "General Knowledge", description: "Pertanyaan pengetahuan umum." },
  ];

  for (const data of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: data.name },
      update: {},
      create: data,
    });
    console.log(`Kategori dibuat: ${category.name}`);
  }

  // Seed Tags
  const tagsData = [
    { name: "JavaScript" },
    { name: "Phyton" },
    { name: "Web Development" },
    { name: "World War II" },
    { name: "Physics" },
    { name: "Algebra" },
    { name: "Indonesia" },
  ];

  for (const data of tagsData) {
    const tag = await prisma.tag.upsert({
      where: { name: data.name },
      update: {},
      create: data,
    });
    console.log(`Tag dibuat: ${tag.name}`);
  }

  console.log("Proses seeding selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
