"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { TableSkeleton } from "./quizAttemptsTableSkeleton";

// Tipe ini bisa diimpor dari file lib/data/admin.ts atau didefinisikan ulang
type QuizAttemptWithDetails = {
  id: string;
  score: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
  user: { name: string; email: string };
  quiz: { title: string };
};

type SortableColumn =
  | "user"
  | "quiz"
  | "score"
  | "status"
  | "startedAt"
  | "completedAt";

export function AttemptsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State untuk data, loading, dan error
  const [attempts, setAttempts] = useState<QuizAttemptWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentSort = searchParams.get("sort") ?? "startedAt";
  const currentOrder = searchParams.get("order") ?? "desc";

  // Efek untuk mengambil data saat sorting berubah
  useEffect(() => {
    const fetchAttempts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          sort: currentSort,
          order: currentOrder,
        });
        const response = await fetch(
          `/api/admin/quiz-attempts?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data. Please try again later.");
        }

        const data = await response.json();
        setAttempts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttempts();
  }, [currentSort, currentOrder]);

  const handleSort = useCallback(
    (column: SortableColumn) => {
      const newOrder =
        currentSort === column && currentOrder === "asc" ? "desc" : "asc";
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", column);
      params.set("order", newOrder);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, currentSort, currentOrder]
  );

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const SortableHeader = ({
    column,
    label,
  }: {
    column: SortableColumn;
    label: string;
  }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-2">
        {label}
        {currentSort === column && (
          <ArrowUpDown
            className={`h-4 w-4 transition-transform ${
              currentOrder === "desc" ? "rotate-180" : ""
            }`}
          />
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader column="user" label="User" />
            <SortableHeader column="quiz" label="Quiz Title" />
            <SortableHeader column="score" label="Score" />
            <SortableHeader column="status" label="Status" />
            <SortableHeader column="startedAt" label="Started At" />
            <SortableHeader column="completedAt" label="Completed At" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : error ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-red-500">
                Error: {error}
              </TableCell>
            </TableRow>
          ) : attempts.length > 0 ? (
            attempts.map((attempt) => (
              <TableRow key={attempt.id}>
                <TableCell>
                  <div className="font-medium">{attempt.user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {attempt.user.email}
                  </div>
                </TableCell>
                <TableCell>{attempt.quiz.title}</TableCell>
                <TableCell>{attempt.score.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      attempt.status === "COMPLETED" ? "default" : "secondary"
                    }
                  >
                    {attempt.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(attempt.startedAt)}</TableCell>
                <TableCell>{formatDate(attempt.completedAt)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No attempts found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
