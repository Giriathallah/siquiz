import { Metadata } from "next";
import Navbar from "@/components/user/navbar";

export const metadata: Metadata = {
  title: "Siquiz - Platform Kuis Interaktif",
  description: "Platform kuis interaktif untuk pembelajaran yang menyenangkan",
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-page-gradient-start via-page-gradient-middle to-page-gradient-end">
      <Navbar />
      <main className="relative">{children}</main>
    </div>
  );
}
