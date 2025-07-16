"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Toaster, toast } from "sonner";

import { User } from "@/generated/prisma";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

const UpdateProfileClientSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  bio: z.string().max(200, "Bio must be 200 characters or less.").optional(),
  avatar: z.any().optional(),
});

type UpdateProfileValues = z.infer<typeof UpdateProfileClientSchema>;

interface EditProfileFormProps {
  user: Pick<User, "id" | "name" | "bio" | "avatarUrl">;
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatarUrl
  );
  const router = useRouter();

  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(UpdateProfileClientSchema),
    defaultValues: {
      name: user.name || "",
      bio: user.bio || "",
      avatar: undefined,
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: UpdateProfileValues) => {
    const formData = new FormData();
    formData.append("name", values.name);
    if (values.bio) formData.append("bio", values.bio);
    if (values.avatar?.[0]) {
      formData.append("avatar", values.avatar[0]);
    }

    startTransition(async () => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        form.reset({ ...values, avatar: undefined });
        // Revalidasi data di client dengan refresh router
        router.refresh();
      } else {
        toast.error(result.message || "An unexpected error occurred.");
      }
    });
  };

  return (
    <>
      <Toaster richColors />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center text-center">
                <FormLabel>
                  <Avatar className="w-24 h-24 cursor-pointer">
                    <AvatarImage
                      src={avatarPreview || undefined}
                      alt={user.name}
                    />
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    className="hidden"
                    accept="image/jpeg, image/png, image/webp"
                    {...form.register("avatar")}
                    onChange={handleAvatarChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your name"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little about yourself"
                    className="resize-none"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </>
  );
}
