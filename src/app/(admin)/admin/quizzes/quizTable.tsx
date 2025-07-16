"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { QuizStatus, Difficulty } from "@/generated/prisma";
import { useDebounce } from "@/hooks/useDebounce";
import { QuizDataTable } from "./quizDataTabel"; // Adjust path if needed

interface Quiz {
  id: string;
  title: string;
  status: QuizStatus;
  difficulty: Difficulty;
  category?: { name: string };
  creator?: { name: string };
  updatedAt: string;
  _count: {
    attempts: number;
    questions: number;
  };
}

interface QuizData {
  quizzes: Quiz[];
  totalCount: number;
}

export function QuizTable() {
  const [myQuizzesData, setMyQuizzesData] = useState<QuizData>({
    quizzes: [],
    totalCount: 0,
  });
  const [otherQuizzesData, setOtherQuizzesData] = useState<QuizData>({
    quizzes: [],
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState<QuizStatus | "all">("all");

  const [myQuizzesPage, setMyQuizzesPage] = useState(1);
  const [otherQuizzesPage, setOtherQuizzesPage] = useState(1);
  const limit = 10;

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        myPage: myQuizzesPage.toString(),
        otherPage: otherQuizzesPage.toString(),
        limit: limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(status !== "all" && { status }),
      }).toString();

      const res = await fetch(`/api/admin/quiz?${query}`);

      // FIX: Check if the response was successful
      if (!res.ok) {
        throw new Error(`API responded with status: ${res.status}`);
      }

      const data = await res.json();

      // This part now only runs on a successful response
      setMyQuizzesData({
        quizzes: data.myQuizzes,
        totalCount: data.totalMyQuizzes,
      });
      setOtherQuizzesData({
        quizzes: data.otherQuizzes,
        totalCount: data.totalOtherQuizzes,
      });
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      // As a safeguard, reset data to a valid empty state on error
      setMyQuizzesData({ quizzes: [], totalCount: 0 });
      setOtherQuizzesData({ quizzes: [], totalCount: 0 });
    } finally {
      setLoading(false);
    }
  }, [myQuizzesPage, otherQuizzesPage, debouncedSearch, status]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleDelete = async (quizId: string) => {
    // Using window.confirm is simple but blocks UI. Consider a modal dialog for better UX.
    if (confirm("Are you sure you want to delete this quiz?")) {
      try {
        const res = await fetch(`/api/admin/quizzes/${quizId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          fetchQuizzes(); // Refresh data after delete
        } else {
          // Handle error (e.g., show a toast)
          console.error("Failed to delete the quiz.");
        }
      } catch (error) {
        console.error("Error deleting quiz:", error);
      }
    }
  };

  const handleFilterChange = () => {
    setMyQuizzesPage(1);
    setOtherQuizzesPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    handleFilterChange();
  };

  const handleStatusChange = (value: QuizStatus | "all") => {
    setStatus(value);
    handleFilterChange();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Quizzes Management</h2>
        <Link href="/admin/quizzes/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search quizzes..."
          value={search}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-8">
        <QuizDataTable
          title="My Quizzes"
          quizzes={myQuizzesData.quizzes}
          isLoading={loading}
          page={myQuizzesPage}
          setPage={setMyQuizzesPage}
          limit={limit}
          totalCount={myQuizzesData.totalCount}
          isMyQuizzes
          onDelete={handleDelete}
        />
        <QuizDataTable
          title="Other Quizzes"
          quizzes={otherQuizzesData.quizzes}
          isLoading={loading}
          page={otherQuizzesPage}
          setPage={setOtherQuizzesPage}
          limit={limit}
          totalCount={otherQuizzesData.totalCount}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
