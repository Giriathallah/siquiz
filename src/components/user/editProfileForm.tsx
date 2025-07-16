"use client";

import { useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { type User } from "@/generated/prisma"; // Sesuaikan dengan path Anda
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export function EditProfileForm({ user }: { user: User }) {
  const router = useRouter();

  // 1. State untuk mengelola nilai input form
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");

  // 2. State khusus untuk file dan pratinjaunya
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 3. State untuk loading & ref untuk reset input file
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simpan file object ke state untuk diupload nanti
      setSelectedFile(file);

      // Buat pratinjau gambar secara lokal tanpa upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    // Reset nilai input file agar bisa memilih file yang sama lagi
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);

    // Hanya tambahkan file ke FormData jika ada file baru yang dipilih
    if (selectedFile) {
      formData.append("avatar", selectedFile);
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        body: formData, // Kirim sebagai multipart/form-data
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update profile.");
      }

      // Sukses, refresh halaman untuk melihat perubahan
      router.refresh();
      // Atau tampilkan notifikasi sukses
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="space-y-2">
        <Label>Profile Picture</Label>
        <div className="flex items-end gap-4">
          <Avatar className="h-24 w-24 relative">
            {/* Tampilkan pratinjau jika ada, jika tidak, tampilkan avatar user */}
            <AvatarImage
              src={imagePreview || user.avatarUrl || ""}
              alt={user.name}
            />
            <AvatarFallback>
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>

            {/* Tombol X untuk membatalkan gambar yang baru dipilih */}
            {imagePreview && (
              <button
                type="button"
                onClick={handleResetImage}
                className="absolute -top-2 -right-2 grid place-items-center h-7 w-7 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                aria-label="Cancel image change"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </Avatar>
          <Input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us a little bit about yourself"
          className="resize-none"
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
