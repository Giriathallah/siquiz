import prisma from "@/lib/prisma";
import { EditProfileForm } from "./editForm";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login"); // Arahkan ke login jika tidak ada sesi
  }

  if (!user) {
    // Mungkin handle kasus user tidak ditemukan di DB
    return <p>User not found.</p>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <div className="max-w-md mx-auto">
        <EditProfileForm user={user} />
      </div>
    </div>
  );
}
