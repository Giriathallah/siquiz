// prisma/seed/index.ts
import prisma from "@/lib/prisma";
import { UserRole } from "@/generated/prisma";
import { hashPassword, generateSalt } from "@/lib/auth/passwordHasher";

async function main() {
  console.log("Memulai proses seeding...");

  // Seed Admin User
  const adminSalt = generateSalt();
  const adminPassword = await hashPassword("asdasdasd", adminSalt);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@siquiz.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@siquiz.com",
      password: adminPassword,
      salt: adminSalt,
      role: UserRole.admin,
      emailVerified: new Date(),
    },
  });
  console.log(`Pengguna Admin dibuat/diperbarui: ${adminUser.email}`);

  // Seed User Rusty Ryan
  const userSalt = generateSalt();
  const userPassword = await hashPassword("password123", userSalt);
  const rustyUser = await prisma.user.upsert({
    where: { email: "rustyryan@gmail.com" },
    update: {},
    create: {
      name: "Rusty Ryan",
      email: "rustyryan@gmail.com",
      password: userPassword,
      salt: userSalt,
      role: UserRole.user,
      emailVerified: new Date(),
    },
  });
  console.log(`Pengguna Biasa dibuat/diperbarui: ${rustyUser.email}`);

  // Seed Categories
  const categoriesData = [
    {
      name: "Pemrograman",
      description:
        "Pertanyaan seputar bahasa pemrograman, algoritma, dan struktur data.",
    },
    {
      name: "Sejarah",
      description: "Pertanyaan seputar peristiwa sejarah dunia dan nasional.",
    },
    {
      name: "Sains",
      description:
        "Pertanyaan seputar ilmu pengetahuan alam (Fisika, Kimia, Biologi).",
    },
    {
      name: "Matematika",
      description: "Pertanyaan seputar konsep dan rumus matematika.",
    },
    {
      name: "Pengetahuan Umum",
      description: "Berbagai macam pertanyaan pengetahuan umum.",
    },
    {
      name: "Film & Acara TV",
      description: "Pertanyaan tentang film, serial TV, aktor, dan sutradara.",
    },
    {
      name: "Musik",
      description: "Pertanyaan tentang musisi, band, genre, dan sejarah musik.",
    },
    {
      name: "Geografi",
      description: "Pertanyaan tentang negara, ibu kota, dan fitur geografis.",
    },
    {
      name: "Olahraga",
      description:
        "Pertanyaan tentang berbagai cabang olahraga, atlet, dan kompetisi.",
    },
    {
      name: "Sastra",
      description:
        "Pertanyaan tentang buku, penulis, dan karya sastra klasik/modern.",
    },
    {
      name: "Seni & Budaya",
      description:
        "Pertanyaan tentang seni rupa, seniman, dan budaya dari seluruh dunia.",
    },
  ];

  for (const data of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: data.name },
      update: { description: data.description },
      create: data,
    });
    console.log(`Kategori dibuat/diperbarui: ${category.name}`);
  }

  // Seed Tags
  const tagsData = [
    // Pemrograman
    { name: "JavaScript" },
    { name: "Python" },
    { name: "Pengembangan Web" },
    { name: "React" },
    { name: "Node.js" },
    { name: "Basis Data" },
    // Sejarah
    { name: "Perang Dunia II" },
    { name: "Romawi Kuno" },
    { name: "Sejarah Indonesia" },
    // Sains
    { name: "Fisika" },
    { name: "Biologi" },
    { name: "Kimia" },
    // Matematika
    { name: "Aljabar" },
    { name: "Kalkulus" },
    { name: "Geometri" },
    // Geografi
    { name: "Ibu Kota" },
    { name: "Asia" },
    // Olahraga
    { name: "Sepak Bola" },
    { name: "Bola Basket" },
    // Hiburan
    { name: "Marvel Cinematic Universe" },
    { name: "Musik Pop" },
    // Umum
    { name: "Indonesia" },
  ];

  for (const data of tagsData) {
    const tag = await prisma.tag.upsert({
      where: { name: data.name },
      update: {},
      create: data,
    });
    console.log(`Tag dibuat/diperbarui: ${tag.name}`);
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
