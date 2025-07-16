import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import Navbar from "./navbar";

export async function Header() {
  // Langsung ambil data user, karena kita berasumsi user pasti ada di layout ini.
  // Opsi `redirectIfNotFound: true` bisa menjadi pengaman tambahan.
  const user = await getCurrentUser({ redirectIfNotFound: true });

  // Langsung render Navbar lengkap dengan data user
  return <Navbar user={user} />;
}
