// app/admin/page.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Users,
  FileText,
  Tags,
  TrendingUp,
  Clock,
  Target,
  Award,
  Plus,
  ArrowRight,
  BarChart3,
  Calendar,
} from "lucide-react";
import Link from "next/link";

// Mock data - replace with actual data fetching
const stats = {
  totalQuizzes: 47,
  totalUsers: 1284,
  totalAttempts: 3542,
  totalCategories: 12,
  totalTags: 28,
  activeQuizzes: 35,
  avgCompletionRate: 78,
  avgScore: 82,
};

const recentQuizzes = [
  {
    id: "1",
    title: "JavaScript Fundamentals",
    category: "Programming",
    difficulty: "MEDIUM",
    attempts: 45,
    avgScore: 85,
    status: "PUBLISHED",
    updatedAt: "2025-06-14",
  },
  {
    id: "2",
    title: "React Hooks Deep Dive",
    category: "Frontend",
    difficulty: "HARD",
    attempts: 23,
    avgScore: 72,
    status: "PUBLISHED",
    updatedAt: "2025-06-13",
  },
  {
    id: "3",
    title: "Database Design Basics",
    category: "Backend",
    difficulty: "EASY",
    attempts: 67,
    avgScore: 91,
    status: "DRAFT",
    updatedAt: "2025-06-12",
  },
];

const recentAttempts = [
  {
    id: "1",
    user: "John Doe",
    quiz: "JavaScript Fundamentals",
    score: 88,
    status: "COMPLETED",
    completedAt: "2025-06-15T10:30:00Z",
  },
  {
    id: "2",
    user: "Sarah Wilson",
    quiz: "React Hooks Deep Dive",
    score: 76,
    status: "COMPLETED",
    completedAt: "2025-06-15T09:15:00Z",
  },
  {
    id: "3",
    user: "Mike Johnson",
    quiz: "Database Design Basics",
    score: 0,
    status: "IN_PROGRESS",
    completedAt: null,
  },
];

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <Card className="bg-surface-raised border-border/50 hover:shadow-lg transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-text-subtle">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-brand" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-text-strong">{value}</div>
        {description && (
          <p className="text-xs text-text-subtle">{description}</p>
        )}
        {trend && (
          <div
            className={`flex items-center text-xs mt-1 ${
              trend.isPositive ? "text-stat-positive" : "text-destructive"
            }`}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend.isPositive ? "+" : ""}
            {trend.value}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors = {
    EASY: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    MEDIUM:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    HARD: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <Badge
      className={colors[difficulty as keyof typeof colors] || colors.MEDIUM}
    >
      {difficulty}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    PUBLISHED:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    ARCHIVED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    COMPLETED:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    IN_PROGRESS:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    ABANDONED:
      "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
  };

  return (
    <Badge className={colors[status as keyof typeof colors] || colors.DRAFT}>
      {status.replace("_", " ")}
    </Badge>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-strong">Dashboard</h1>
          <p className="text-text-subtle">
            Welcome back! Here's what's happening with your quizzes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-border">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
          <Link href="/admin/quizzes/create">
            <Button className="bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Quizzes"
          value={stats.totalQuizzes}
          icon={BookOpen}
          description={`${stats.activeQuizzes} active`}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          description="Registered users"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Quiz Attempts"
          value={stats.totalAttempts.toLocaleString()}
          icon={Target}
          description="This month"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Average Score"
          value={`${stats.avgScore}%`}
          icon={Award}
          description={`${stats.avgCompletionRate}% completion rate`}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Quizzes */}
        <Card className="bg-surface-raised border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-text-strong">Recent Quizzes</CardTitle>
              <CardDescription>Latest quiz activity</CardDescription>
            </div>
            <Link href="/admin/quizzes">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-sunken/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-text-strong truncate">
                        {quiz.title}
                      </h4>
                      <StatusBadge status={quiz.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-subtle">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {quiz.category}
                      </span>
                      <DifficultyBadge difficulty={quiz.difficulty} />
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {quiz.attempts} attempts
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-text-strong">
                      {quiz.avgScore}%
                    </div>
                    <div className="text-xs text-text-subtle">avg score</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Attempts */}
        <Card className="bg-surface-raised border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-text-strong">
                Recent Attempts
              </CardTitle>
              <CardDescription>Latest user activity</CardDescription>
            </div>
            <Link href="/admin/quiz-attempts">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-sunken/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-text-strong">
                        {attempt.user}
                      </h4>
                      <StatusBadge status={attempt.status} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-subtle">
                      <BookOpen className="h-3 w-3" />
                      <span className="truncate">{attempt.quiz}</span>
                    </div>
                    {attempt.completedAt && (
                      <div className="flex items-center gap-1 text-xs text-text-subtle mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(attempt.completedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-text-strong">
                      {attempt.status === "IN_PROGRESS"
                        ? "-"
                        : `${attempt.score}%`}
                    </div>
                    {attempt.status === "COMPLETED" && (
                      <Progress
                        value={attempt.score}
                        className="w-16 h-1 mt-1"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-surface-raised border-border/50">
        <CardHeader>
          <CardTitle className="text-text-strong">Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/quizzes/create">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 border-border hover:bg-brand-subtle hover:border-brand"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-feature-1-start/10">
                    <Plus className="h-5 w-5 text-feature-1-start" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Create Quiz</div>
                    <div className="text-xs text-text-subtle">Add new quiz</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/admin/categories">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 border-border hover:bg-brand-subtle hover:border-brand"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-feature-2-start/10">
                    <FileText className="h-5 w-5 text-feature-2-start" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Manage Categories</div>
                    <div className="text-xs text-text-subtle">
                      {stats.totalCategories} categories
                    </div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/admin/tags">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 border-border hover:bg-brand-subtle hover:border-brand"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-feature-3-start/10">
                    <Tags className="h-5 w-5 text-feature-3-start" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Manage Tags</div>
                    <div className="text-xs text-text-subtle">
                      {stats.totalTags} tags
                    </div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/admin/users">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 border-border hover:bg-brand-subtle hover:border-brand"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-feature-4-start/10">
                    <Users className="h-5 w-5 text-feature-4-start" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Manage Users</div>
                    <div className="text-xs text-text-subtle">
                      {stats.totalUsers.toLocaleString()} users
                    </div>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
