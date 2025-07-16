import React, { Suspense } from "react";
import AdminTagsContent from "./adminTagsContent"; // Sesuaikan path jika perlu
import { Loader2 } from "lucide-react";

// Fallback UI yang akan ditampilkan selagi komponen client dimuat
const PageSkeleton = () => (
  <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
    <Loader2 className="h-10 w-10 animate-spin text-brand" />
  </div>
);

// Halaman ini sekarang menjadi Server Component
export default function AdminTagsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminTagsContent />
    </Suspense>
  );
}
