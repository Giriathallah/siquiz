// src/app/(authenticated)/settings/change-password/page.tsx
import { Metadata } from "next";
import { ChangePasswordForm } from "@/components/auth/changePasswordForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Ubah Password - SiQuiz",
  description: "Ubah password akun Anda untuk menjaga keamanan",
};

export default function ChangePasswordPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/profile">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Profile
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Ubah Password</h1>
        </div>
        <p className="text-muted-foreground">
          Pastikan password baru Anda kuat dan unik untuk menjaga keamanan akun.
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Password Baru</CardTitle>
          <CardDescription>
            Password harus minimal 8 karakter dan mengandung kombinasi huruf
            besar, huruf kecil, dan angka.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tips Keamanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol
            </li>
            <li>• Jangan gunakan informasi pribadi yang mudah ditebak</li>
            <li>• Gunakan password yang berbeda untuk setiap akun</li>
            <li>• Pertimbangkan menggunakan password manager</li>
            <li>• Ubah password secara berkala</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
