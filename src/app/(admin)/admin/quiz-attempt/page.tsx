import { type Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { AttemptsTable } from "./quizAttemptsTable";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Quiz Attempts | Admin Dashboard",
  description: "View all user quiz attempts.",
};

export default async function AdminAttemptsPage() {
  // Otorisasi tetap dilakukan di server untuk melindungi halaman

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Quiz Attempts</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All User Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Komponen tabel sekarang bertanggung jawab untuk fetch datanya sendiri */}
            <AttemptsTable />
          </CardContent>
        </Card>
      </div>
    </Suspense>
  );
}
