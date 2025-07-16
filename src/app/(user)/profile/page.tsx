"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import QuizCard from "@/components/user/quizCard"; // Pastikan path ini benar
import {
  Edit,
  Key,
  BookOpen,
  Star,
  Heart,
  Save,
  Trophy,
  Clock,
  Calendar,
  Mail,
  Users,
  TrendingUp,
  Bookmark,
} from "lucide-react";

// Tipe data untuk Quiz, sesuaikan dengan props QuizCard
interface Quiz {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  creator: { id: string; name: string; avatarUrl: string | null };
  category: { id: string; name: string } | null;
  tags: Array<{ id: string; name: string }>;
  _count: {
    participants: number;
    questions: number;
    likes: number;
  };
  isSaved?: boolean;
  isLiked?: boolean;
  createdAt: string;
}

// Tipe data untuk keseluruhan response dari API
interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    bio: string | null;
    avatarUrl: string | null;
    role: string;
    joinDate: string;
  };
  stats: {
    totalQuizzesCreated: number;
    totalQuizzesTaken: number;
    totalQuizLikes: number;
    totalSavedQuizzes: number;
    totalScore: number;
    averageScore: number;
  };
  recentQuizzes: Array<{
    id: string;
    title: string;
    category: string;
    difficulty: string;
    score: number;
    maxScore: number;
    duration: number;
    completedAt: string;
  }>;
  createdQuizzes: Quiz[];
  savedQuizzes: Quiz[];
  likedQuizzes: Quiz[];
}

// Komponen Skeleton untuk loading state
const ProfilePageSkeleton = () => (
  <div className="container mx-auto px-4 py-8 max-w-7xl">
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-5 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-1/3" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Skeleton className="h-28 rounded-lg" />
      <Skeleton className="h-28 rounded-lg" />
      <Skeleton className="h-28 rounded-lg" />
      <Skeleton className="h-28 rounded-lg" />
    </div>
    <Skeleton className="h-10 w-full rounded-lg" />
    <Skeleton className="h-64 w-full rounded-lg mt-6" />
  </div>
);

// Komponen utama halaman profil
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        } else {
          console.error("Failed to fetch profile data");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleSaveToggle = (quizId: string, isSaved: boolean) => {
    if (!profileData) return;
    if (!isSaved) {
      setProfileData({
        ...profileData,
        savedQuizzes: profileData.savedQuizzes.filter((q) => q.id !== quizId),
      });
    }
  };

  const handleLikeToggle = (quizId: string, isLiked: boolean) => {
    if (!profileData) return;
    if (!isLiked) {
      setProfileData({
        ...profileData,
        likedQuizzes: profileData.likedQuizzes.filter((q) => q.id !== quizId),
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toUpperCase()) {
      case "EASY":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "HARD":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center min-h-screen text-text-subtle">
        Gagal memuat profil. Silakan coba lagi.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-gradient-start">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Profile Header */}
        <Card className="mb-8 bg-surface-raised border-border shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-brand-subtle">
                <AvatarImage
                  src={profileData.user.avatarUrl || ""}
                  alt={profileData.user.name}
                />
                <AvatarFallback className="bg-brand text-brand-foreground text-2xl font-bold">
                  {profileData.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-text-strong">
                      {profileData.user.name}
                    </h1>
                    <Badge
                      variant="outline"
                      className="bg-brand-subtle text-brand border-brand/20"
                    >
                      {profileData.user.role}
                    </Badge>
                  </div>
                  {profileData.user.bio && (
                    <p className="text-text-subtle mt-2 max-w-2xl">
                      {profileData.user.bio}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-text-subtle">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{profileData.user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Bergabung {formatDate(profileData.user.joinDate)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    asChild
                    className="bg-brand hover:bg-brand/90 text-brand-foreground"
                  >
                    <Link href="/profile/edit">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/profile/change-password">
                      <Key className="mr-2 h-4 w-4" />
                      Ubah Password
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-feature-2-start to-feature-2-end text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="opacity-80 text-sm">Kuis Dibuat</p>
                  <p className="text-2xl font-bold">
                    {profileData.stats.totalQuizzesCreated}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-feature-3-start to-feature-3-end text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="opacity-80 text-sm">Kuis Selesai</p>
                  <p className="text-2xl font-bold">
                    {profileData.stats.totalQuizzesTaken}
                  </p>
                </div>
                <Trophy className="h-8 w-8 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-feature-1-end to-feature-4-end text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="opacity-80 text-sm">Total Likes</p>
                  <p className="text-2xl font-bold">
                    {profileData.stats.totalQuizLikes}
                  </p>
                </div>
                <Heart className="h-8 w-8 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-feature-1-start to-cta-gradient-middle text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="opacity-80 text-sm">Kuis Disimpan</p>
                  <p className="text-2xl font-bold">
                    {profileData.stats.totalSavedQuizzes}
                  </p>
                </div>
                <Bookmark className="h-8 w-8 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-surface-raised border border-border">
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="history">Riwayat</TabsTrigger>
            <TabsTrigger value="saved">Disimpan</TabsTrigger>
            <TabsTrigger value="liked">Disukai</TabsTrigger>
          </TabsList>

          {/* TAB RINGKASAN */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Card Statistik Performa */}
              <Card className="bg-surface-raised border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-text-strong">
                    <TrendingUp className="h-5 w-5 text-brand" />
                    Statistik Performa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end text-white  font-medium hover:shadow-lg hover:shadow-brand/25 transition-all duration-300 hover:scale-105 rounded-lg">
                      <div className="text-2xl font-bold text-white ">
                        {Math.round(profileData.stats.totalScore)}
                      </div>
                      <div className="text-sm text-white ">Total Skor</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end text-white  font-medium hover:shadow-lg hover:shadow-brand/25 transition-all duration-300 hover:scale-105 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {Math.round(profileData.stats.averageScore)}%
                      </div>
                      <div className="text-sm text-white ">Rata-rata</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card Aktivitas */}
              <Card className="bg-surface-raised border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-text-strong">
                    <Users className="h-5 w-5 text-stat-positive" />
                    Aktivitas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-text-subtle">Kuis Dibuat</span>
                    <span className="font-bold text-text-strong">
                      {profileData.stats.totalQuizzesCreated}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-subtle">Kuis Diselesaikan</span>
                    <span className="font-bold text-text-strong">
                      {profileData.stats.totalQuizzesTaken}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-subtle">Total Like</span>
                    <span className="font-bold text-text-strong">
                      {profileData.stats.totalQuizLikes}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-subtle">Kuis Disimpan</span>
                    <span className="font-bold text-text-strong">
                      {profileData.stats.totalSavedQuizzes}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB RIWAYAT */}
          <TabsContent value="history" className="mt-6 space-y-6">
            <Card className="bg-surface-raised border-border">
              <CardHeader>
                <CardTitle className="text-text-strong">
                  Riwayat Kuis Terbaru
                </CardTitle>
                <CardDescription className="text-text-subtle">
                  Aktivitas kuis terbaru Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profileData.recentQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center justify-between p-4 bg-surface-sunken rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-stat-positive/10 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-stat-positive" />
                        </div>
                        <div>
                          <h3 className="font-medium text-text-strong">
                            {quiz.title}
                          </h3>
                          <p className="text-sm text-text-subtle">
                            {quiz.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium text-text-strong">
                            {Math.round(quiz.score)}/{quiz.maxScore}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-subtle">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(quiz.duration)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getDifficultyColor(quiz.difficulty)}
                          >
                            {quiz.difficulty}
                          </Badge>
                        </div>
                        <p className="text-xs text-text-subtle">
                          {formatDate(quiz.completedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB DISIMPAN */}
          <TabsContent value="saved" className="mt-6">
            <Card className="bg-surface-raised border-border">
              <CardHeader>
                <CardTitle className="text-text-strong">
                  Kuis yang Disimpan
                </CardTitle>
                <CardDescription className="text-text-subtle">
                  Daftar kuis yang telah Anda simpan untuk nanti.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profileData.savedQuizzes.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {profileData.savedQuizzes.map((quiz) => (
                      <QuizCard
                        key={quiz.id}
                        quiz={quiz}
                        onSaveToggle={handleSaveToggle}
                        onLikeToggle={handleLikeToggle}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-text-subtle">
                    Anda belum menyimpan kuis apapun.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB DISUKAI */}
          <TabsContent value="liked" className="mt-6">
            <Card className="bg-surface-raised border-border">
              <CardHeader>
                <CardTitle className="text-text-strong">
                  Kuis yang Disukai
                </CardTitle>
                <CardDescription className="text-text-subtle">
                  Daftar kuis yang pernah Anda sukai.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profileData.likedQuizzes.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {profileData.likedQuizzes.map((quiz) => (
                      <QuizCard
                        key={quiz.id}
                        quiz={quiz}
                        onSaveToggle={handleSaveToggle}
                        onLikeToggle={handleLikeToggle}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-text-subtle">
                    Anda belum menyukai kuis apapun.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
