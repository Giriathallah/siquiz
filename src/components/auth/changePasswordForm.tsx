// src/components/auth/change-password-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { changePasswordSchema, type ChangePasswordSchema } from "@/lib/schemas";
// Hapus import server action: import { changePassword } from "@/actions/change-password";

export function ChangePasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordSchema) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Password berhasil diubah");
        form.reset();
        router.push("/profile");
      } else {
        toast.error(result.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Tidak dapat terhubung ke server");
    } finally {
      setIsLoading(false);
    }
  };

  const { errors } = form.formState;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Password Saat Ini</Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            placeholder="Masukkan password saat ini"
            {...form.register("currentPassword")}
            className={errors.currentPassword ? "border-destructive" : ""}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.currentPassword && (
          <p className="text-sm text-destructive">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Password Baru</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNewPassword ? "text" : "password"}
            placeholder="Masukkan password baru"
            {...form.register("newPassword")}
            className={errors.newPassword ? "border-destructive" : ""}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.newPassword && (
          <p className="text-sm text-destructive">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Masukkan ulang password baru"
            {...form.register("confirmPassword")}
            className={errors.confirmPassword ? "border-destructive" : ""}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium mb-2">Persyaratan Password:</h4>
          <div className="space-y-1 text-xs">
            <div
              className={`flex items-center gap-2 ${
                form.watch("newPassword")?.length >= 8
                  ? "text-green-600"
                  : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  form.watch("newPassword")?.length >= 8
                    ? "bg-green-600"
                    : "bg-muted-foreground"
                }`}
              />
              Minimal 8 karakter
            </div>
            <div
              className={`flex items-center gap-2 ${
                /[a-z]/.test(form.watch("newPassword") || "")
                  ? "text-green-600"
                  : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  /[a-z]/.test(form.watch("newPassword") || "")
                    ? "bg-green-600"
                    : "bg-muted-foreground"
                }`}
              />
              Huruf kecil
            </div>
            <div
              className={`flex items-center gap-2 ${
                /[A-Z]/.test(form.watch("newPassword") || "")
                  ? "text-green-600"
                  : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  /[A-Z]/.test(form.watch("newPassword") || "")
                    ? "bg-green-600"
                    : "bg-muted-foreground"
                }`}
              />
              Huruf besar
            </div>
            <div
              className={`flex items-center gap-2 ${
                /\d/.test(form.watch("newPassword") || "")
                  ? "text-green-600"
                  : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  /\d/.test(form.watch("newPassword") || "")
                    ? "bg-green-600"
                    : "bg-muted-foreground"
                }`}
              />
              Angka
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Mengubah Password...
            </>
          ) : (
            "Ubah Password"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
