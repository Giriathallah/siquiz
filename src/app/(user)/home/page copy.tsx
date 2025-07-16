"use client";

import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
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
  Zap,
} from "lucide-react";

// Mock data
const mockStats = {
  totalQuizzes: 24,
  completedQuizzes: 18,
  averageScore: 87,
  totalPoints: 1520,
  rank: 5,
  streak: 7,
};

const mockRecentQuizzes = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    category: "Programming",
    difficulty: "Beginner",
    questions: 15,
    duration: 20,
    participants: 1234,
    score: 85,
    completed: true,
  },
  {
    id: 2,
    title: "React Hooks Deep Dive",
    category: "Programming",
    difficulty: "Intermediate",
    questions: 20,
    duration: 30,
    participants: 856,
    score: null,
    completed: false,
  },
  {
    id: 3,
    title: "CSS Grid & Flexbox",
    category: "Design",
    difficulty: "Beginner",
    questions: 12,
    duration: 15,
    participants: 2341,
    score: 92,
    completed: true,
  },
];

const mockPopularQuizzes = [
  {
    id: 4,
    title: "Machine Learning Basics",
    category: "AI/ML",
    difficulty: "Advanced",
    questions: 25,
    duration: 45,
    participants: 3456,
    rating: 4.8,
  },
  {
    id: 5,
    title: "Node.js Best Practices",
    category: "Backend",
    difficulty: "Intermediate",
    questions: 18,
    duration: 25,
    participants: 2890,
    rating: 4.6,
  },
  {
    id: 6,
    title: "Database Design Principles",
    category: "Database",
    difficulty: "Intermediate",
    questions: 22,
    duration: 35,
    participants: 1967,
    rating: 4.7,
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "intermediate":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    case "advanced":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

export default function BerandaPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "all",
    "Programming",
    "Design",
    "AI/ML",
    "Backend",
    "Database",
  ];

  const completionPercentage =
    (mockStats.completedQuizzes / mockStats.totalQuizzes) * 100;

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-surface-raised border-border/40">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-8 w-8 text-brand" />
              </div>
              <div className="text-2xl font-bold text-text-strong">
                {mockStats.totalQuizzes}
              </div>
              <div className="text-sm text-text-subtle">Total Kuis</div>
            </CardContent>
          </Card>

          <Card className="bg-surface-raised border-border/40">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-8 w-8 text-stat-positive" />
              </div>
              <div className="text-2xl font-bold text-text-strong">
                {mockStats.averageScore}%
              </div>
              <div className="text-sm text-text-subtle">Rata-rata Skor</div>
            </CardContent>
          </Card>

          <Card className="bg-surface-raised border-border/40">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-brand" />
              </div>
              <div className="text-2xl font-bold text-text-strong">
                {mockStats.totalPoints}
              </div>
              <div className="text-sm text-text-subtle">Total Poin</div>
            </CardContent>
          </Card>

          <Card className="bg-surface-raised border-border/40">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-text-strong">
                {mockStats.streak}
              </div>
              <div className="text-sm text-text-subtle">Hari Streak</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Activity */}
          <Card className="bg-surface-raised border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Aktivitas Terbaru
              </CardTitle>
              <CardDescription>
                Kuis yang baru saja Anda kerjakan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-surface-sunken hover:bg-surface-sunken/80 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-feature-1-start to-feature-1-end flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-strong">
                          {quiz.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-text-subtle">
                          <Badge
                            variant="secondary"
                            className={getDifficultyColor(quiz.difficulty)}
                          >
                            {quiz.difficulty}
                          </Badge>
                          <span>•</span>
                          <span>{quiz.questions} soal</span>
                          <span>•</span>
                          <span>{quiz.duration} menit</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {quiz.completed ? (
                        <div className="text-right">
                          <div className="text-lg font-bold text-stat-positive">
                            {quiz.score}%
                          </div>
                          <div className="text-sm text-text-subtle">
                            Selesai
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-cta-gradient-start to-cta-gradient-end"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Lanjutkan
                        </Button>
                      )}
                    </div>
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
              <CardDescription>Kuis terpopuler minggu ini</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={
                      selectedCategory === category
                        ? "bg-brand text-brand-foreground"
                        : ""
                    }
                  >
                    {category === "all" ? "Semua" : category}
                  </Button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {mockPopularQuizzes.map((quiz) => (
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card className="bg-surface-raised border-border/40">
            <CardHeader>
              <CardTitle className="text-lg">Progress Anda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-subtle">Kuis Diselesaikan</span>
                    <span className="text-text-strong">
                      {mockStats.completedQuizzes}/{mockStats.totalQuizzes}
                    </span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>

                <div className="pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-subtle">Peringkat</span>
                    <span className="text-lg font-bold text-brand">
                      #{mockStats.rank}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-subtle">
                      Streak Hari
                    </span>
                    <span className="text-lg font-bold text-yellow-500">
                      {mockStats.streak} 🔥
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-surface-raised border-border/40">
            <CardHeader>
              <CardTitle className="text-lg">Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-cta-gradient-start to-cta-gradient-end"
              >
                <Link href="/kuis">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Jelajahi Kuis
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/skor">
                  <Trophy className="h-4 w-4 mr-2" />
                  Lihat Skor
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/profil/johndoe">
                  <Users className="h-4 w-4 mr-2" />
                  Edit Profil
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Achievement Badge */}
          <Card className="bg-gradient-to-br from-feature-1-start to-feature-1-end text-white border-0">
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
              <h3 className="font-bold text-lg mb-2">Pencapaian Terbaru!</h3>
              <p className="text-sm opacity-90">
                Anda telah menyelesaikan 10 kuis berturut-turut dengan skor di
                atas 80%
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
