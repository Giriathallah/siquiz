"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

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
  createdQuizzes: Array<{
    id: string;
    title: string;
    description: string | null;
    difficulty: string;
    category: string;
    questionsCount: number;
    takesCount: number;
    likesCount: number;
    createdAt: string;
  }>;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
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
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Profile not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Profile Header */}
        <Card className="mb-8 bg-white border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-blue-100">
                  <AvatarImage
                    src={profileData.user.avatarUrl || ""}
                    alt={profileData.user.name}
                  />
                  <AvatarFallback className="bg-blue-500 text-white text-2xl font-bold">
                    {profileData.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                      {profileData.user.name}
                    </h1>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {profileData.user.role}
                    </Badge>
                  </div>
                  {profileData.user.bio && (
                    <p className="text-slate-600 mt-2 max-w-2xl">
                      {profileData.user.bio}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
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
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline">
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Kuis Dibuat</p>
                  <p className="text-2xl font-bold">
                    {profileData.stats.totalQuizzesCreated}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Kuis Selesai</p>
                  <p className="text-2xl font-bold">
                    {profileData.stats.totalQuizzesTaken}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Kuis Dilike</p>
                  <p className="text-2xl font-bold">
                    {profileData.stats.totalQuizLikes}
                  </p>
                </div>
                <Heart className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Kuis Disimpan</p>
                  <p className="text-2xl font-bold">
                    {profileData.stats.totalSavedQuizzes}
                  </p>
                </div>
                <Save className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white">
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="created">Kuis Dibuat</TabsTrigger>
            <TabsTrigger value="history">Riwayat</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Statistik Performa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900">
                        {Math.round(profileData.stats.totalScore)}
                      </div>
                      <div className="text-sm text-slate-600">Total Skor</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900">
                        {Math.round(profileData.stats.averageScore)}%
                      </div>
                      <div className="text-sm text-slate-600">Rata-rata</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    Aktivitas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Kuis Dibuat</span>
                    <span className="font-bold">
                      {profileData.stats.totalQuizzesCreated}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Kuis Diselesaikan</span>
                    <span className="font-bold">
                      {profileData.stats.totalQuizzesTaken}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Like</span>
                    <span className="font-bold">
                      {profileData.stats.totalQuizLikes}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Kuis Disimpan</span>
                    <span className="font-bold">
                      {profileData.stats.totalSavedQuizzes}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="created" className="space-y-6">
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle>Kuis yang Dibuat</CardTitle>
                <CardDescription>
                  Total {profileData.stats.totalQuizzesCreated} kuis telah
                  dibuat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profileData.createdQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">
                            {quiz.title}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {quiz.category}
                          </p>
                          {quiz.description && (
                            <p className="text-sm text-slate-500 mt-1">
                              {quiz.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getDifficultyColor(quiz.difficulty)}
                          >
                            {quiz.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>{quiz.questionsCount} soal</span>
                          <span>{quiz.takesCount} dikerjakan</span>
                          <span>{quiz.likesCount} likes</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {formatDate(quiz.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle>Riwayat Kuis Terbaru</CardTitle>
                <CardDescription>Aktivitas kuis terbaru Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profileData.recentQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">
                            {quiz.title}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {quiz.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium text-slate-900">
                            {Math.round(quiz.score)}/{quiz.maxScore}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
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
                        <p className="text-xs text-slate-500">
                          {formatDate(quiz.completedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
