"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress"; // [FIX] Import Progress
import {
  BookOpen,
  Trophy,
  Users,
  Clock,
  Star,
  TrendingUp,
  Play,
  Calendar,
  Target,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { Difficulty, QuizAttemptStatus } from "@/generated/prisma";

// --- [FIX] Tipe Data Disesuaikan dengan API Response Baru ---
interface RecentActivityItem {
  quizId: string;
  title: string;
  duration: number;
  difficulty: Difficulty;
  questions: number;
  // Properti spesifik untuk pengguna yang login
  attemptId?: string;
  status?: QuizAttemptStatus;
  score?: number;
  progress?: number;
}

interface PopularQuizItem {
  id: string;
  title: string;
  duration: number;
  difficulty: Difficulty;
  category: string;
  questions: number;
  participants: number;
  rating: number;
}

interface PopularContentItem {
  id: string;
  name: string;
  count: number;
}

interface HomeData {
  statistics: {
    totalQuizzes: number;
    totalUsers: number;
    totalAttempts: number;
  };
  categories: { id: string; name: string }[];
  popularQuizzes: PopularQuizItem[];
  recentActivity: RecentActivityItem[];
  isUserActivity: boolean;
  popularContent: {
    categories: PopularContentItem[];
    tags: PopularContentItem[];
  };
}

// --- Helper Function untuk Warna Badge ---
const getDifficultyColor = (difficulty: Difficulty) => {
  switch (difficulty) {
    case "EASY":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200";
    case "HARD":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
  }
};

export default function BerandaPage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // [FIX] Menggunakan endpoint API yang benar
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error("Gagal memuat data. Silakan coba lagi.");
        }
        const result: HomeData = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPopularQuizzes = useMemo(() => {
    if (!data) return [];
    if (selectedCategory === "all") {
      return data.popularQuizzes;
    }
    return data.popularQuizzes.filter(
      (quiz) => quiz.category === selectedCategory
    );
  }, [data, selectedCategory]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-text-strong mb-2">
          Terjadi Kesalahan
        </h2>
        <p className="text-text-subtle">{error || "Data tidak ditemukan."}</p>
        <Button onClick={() => window.location.reload()} className="mt-6">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-text-strong mb-4">
            Selamat Datang di{" "}
            <span className="bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text text-transparent">
              Siquiz
            </span>
          </h1>
          <p className="text-xl text-text-subtle max-w-2xl mx-auto">
            Tingkatkan pengetahuan Anda dengan kuis interaktif yang menarik dan
            menantang
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-surface-raised border-border/40">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-8 w-8 text-brand" />
              </div>
              <div className="text-2xl font-bold text-text-strong">
                {data.statistics.totalQuizzes}
              </div>
              <div className="text-sm text-text-subtle">Total Kuis</div>
            </CardContent>
          </Card>
          <Card className="bg-surface-raised border-border/40">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-stat-positive" />
              </div>
              <div className="text-2xl font-bold text-text-strong">
                {data.statistics.totalUsers}
              </div>
              <div className="text-sm text-text-subtle">Total Pengguna</div>
            </CardContent>
          </Card>
          <Card className="bg-surface-raised border-border/40">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-text-strong">
                {data.statistics.totalAttempts}
              </div>
              <div className="text-sm text-text-subtle">Total Pengerjaan</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* [FIX] Card Aktivitas Terbaru / Kuis Terbaru yang Dinamis */}
          <Card className="bg-surface-raised border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {data.isUserActivity
                  ? "Aktivitas Terbaru Anda"
                  : "Kuis Terbaru"}
              </CardTitle>
              <CardDescription>
                {data.isUserActivity
                  ? "Lanjutkan kuis yang belum selesai atau lihat hasilnya."
                  : "Jelajahi kuis yang baru ditambahkan di platform kami."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.recentActivity.map((activity) => (
                  <div
                    key={activity.quizId}
                    className="p-4 rounded-lg bg-surface-sunken hover:bg-surface-sunken/80 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-feature-1-start to-feature-1-end flex items-center justify-center shrink-0">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-strong">
                            {activity.title}
                          </h3>
                          <div className="flex items-center flex-wrap gap-x-2 text-sm text-text-subtle">
                            <Badge
                              variant="secondary"
                              className={getDifficultyColor(
                                activity.difficulty
                              )}
                            >
                              {activity.difficulty}
                            </Badge>
                            <span>•</span>
                            <span>{activity.questions} soal</span>
                            <span>•</span>
                            <span>{activity.duration} menit</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {data.isUserActivity &&
                        activity.status === "COMPLETED" ? (
                          <div className="text-right">
                            <div className="text-lg font-bold text-stat-positive">
                              {activity.score}%
                            </div>
                            <div className="text-sm text-text-subtle">
                              Selesai
                            </div>
                          </div>
                        ) : (
                          <Button
                            asChild
                            size="sm"
                            className="bg-gradient-to-r from-cta-gradient-start to-cta-gradient-end"
                          >
                            <Link href={`/kuis/${activity.quizId}/take`}>
                              <Play className="h-4 w-4 mr-2" />
                              {data.isUserActivity ? "Lanjutkan" : "Mulai"}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                    {data.isUserActivity &&
                      activity.status === "IN_PROGRESS" && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-text-subtle mb-1">
                            <span>Progress</span>
                            <span>{activity.progress}%</span>
                          </div>
                          <Progress
                            value={activity.progress}
                            className="h-1.5"
                          />
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Quizzes */}
          <Card className="bg-surface-raised border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Kuis Populer
              </CardTitle>
              <CardDescription>
                Berdasarkan jumlah peserta yang telah mencoba.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className={
                    selectedCategory === "all"
                      ? "bg-brand text-brand-foreground"
                      : ""
                  }
                >
                  Semua
                </Button>
                {data.categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategory === category.name ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category.name)}
                    className={
                      selectedCategory === category.name
                        ? "bg-brand text-brand-foreground"
                        : ""
                    }
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {filteredPopularQuizzes.map((quiz) => (
                  <Card
                    key={quiz.id}
                    className="bg-surface-sunken border-border/40 hover:border-brand/40 transition-colors group"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {quiz.category}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {quiz.rating}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-text-strong mb-2 group-hover:text-brand transition-colors">
                        {quiz.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-text-subtle mb-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{quiz.duration}m</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{quiz.questions} soal</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{quiz.participants}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(quiz.difficulty)}>
                          {quiz.difficulty}
                        </Badge>
                        <Button size="sm" asChild>
                          <Link href={`/kuis/${quiz.id}`}>Mulai Kuis</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- Sidebar --- */}
        <div className="space-y-6 lg:block hidden">
          {/* [FIX] Card "Progress Anda" diganti dengan Konten Populer */}
          <Card className="bg-surface-raised border-border/40">
            <CardHeader>
              <CardTitle className="text-lg">Konten Populer</CardTitle>
              <CardDescription>
                Kategori dan Tag yang paling diminati.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <h4 className="font-semibold text-sm mb-3 text-text-strong">
                  Kategori Populer
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.popularContent.categories.map((category) => (
                    <Badge
                      key={category.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-border/60"
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      {category.name} ({category.count})
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/40">
                <h4 className="font-semibold text-sm mb-3 text-text-strong">
                  Tag Populer
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.popularContent.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-border/40"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
