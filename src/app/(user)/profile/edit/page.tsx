"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, X, Loader2 } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nama harus terdiri dari minimal 2 karakter",
  }),
  bio: z
    .string()
    .max(160, {
      message: "Bio tidak boleh lebih dari 160 karakter",
    })
    .optional(),
  avatar: z.any().optional(),
});

export default function EditProfilePage() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tempImage, setTempImage] = useState<File | null>(null);
  const [userId, setUserId] = useState<string>("");

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      bio: "",
      avatar: undefined,
    },
  });

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          setUserId(data.user.id);
          form.reset({
            name: data.user.name,
            bio: data.user.bio || "",
          });
          setPreview(data.user.avatarUrl);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, [form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTempImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetImage = () => {
    setPreview(null);
    setTempImage(null);
    form.setValue("avatar", undefined);
  };

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.bio) formData.append("bio", values.bio);
      if (tempImage) formData.append("avatar", tempImage);

      const response = await fetch(`/api/profile/${userId}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) throw new Error("Update failed");

      router.push("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Edit Profil</CardTitle>
            <CardDescription>Perbarui informasi profil Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {/* [DIUBAH] Gunakan warna dari variabel tema */}
                    <Avatar className="h-32 w-32 border-4 border-primary/20">
                      <AvatarImage
                        src={preview || ""}
                        alt={form.watch("name")}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
                        {form.watch("name")?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {preview && (
                      <button
                        type="button"
                        onClick={resetImage}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="avatar"
                    render={({ field }) => (
                      <FormItem className="text-center">
                        <Button asChild variant="default" size="sm">
                          <FormLabel className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            {preview ? "Ganti Foto" : "Unggah Foto"}
                          </FormLabel>
                        </Button>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              field.onChange(e.target.files);
                              handleFileChange(e);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama Anda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bio Field */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ceritakan sedikit tentang diri Anda"
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/profile")}
                    disabled={isLoading}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
