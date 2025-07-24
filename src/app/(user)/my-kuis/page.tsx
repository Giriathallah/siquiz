"use client";
import { useState, useEffect } from "react";
import {
  Trash2,
  Edit,
  Plus,
  Clock,
  Users,
  Heart,
  BookOpen,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import MyQuizPageSkeleton from "./myQuizSkeleton";
import Link from "next/link";
import { QuizStatus, Difficulty } from "@/generated/prisma";
import { toast } from "sonner";

type MyQuiz = {
  id: string;
  title: string;
  description: string | null;
  status: QuizStatus;
  difficulty: Difficulty;
  isAiGenerated: boolean;
  duration: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  categoryName: string;
  questionsCount: number;
  takesCount: number;
};

const MyQuizPage = () => {
  const [allQuizzes, setAllQuizzes] = useState<MyQuiz[]>([]); // Untuk data master & statistik
  const [displayedQuizzes, setDisplayedQuizzes] = useState<MyQuiz[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<MyQuiz | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false); // <-- State untuk loading delete

  useEffect(() => {
    const fetchAllQuizzes = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/quiz/my"); // Selalu ambil semua data
        if (!response.ok) {
          throw new Error("Gagal mengambil data kuis");
        }
        const data = await response.json();
        setAllQuizzes(data.data);
        setDisplayedQuizzes(data.data); // Awalnya, tampilkan semua
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllQuizzes();
  }, []); // Dependency kosong agar hanya berjalan sekali saat mount

  // 2. useEffect untuk memfilter data yang ditampilkan saat filter berubah
  useEffect(() => {
    if (filter === "ALL") {
      setDisplayedQuizzes(allQuizzes);
    } else {
      const filtered = allQuizzes.filter((quiz) => quiz.status === filter);
      setDisplayedQuizzes(filtered);
    }
  }, [filter, allQuizzes]);

  const handleDeleteClick = (quiz: MyQuiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return;

    setIsDeleting(true); // Mulai loading

    try {
      const response = await fetch(`/api/quiz/${quizToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menghapus kuis.");
      }

      // Hapus kuis dari state jika berhasil
      setAllQuizzes((prevQuizzes) =>
        prevQuizzes.filter((quiz) => quiz.id !== quizToDelete.id)
      );

      setDeleteDialogOpen(false);
      toast.success("kuis Berhasil dihapus");
    } catch (error: any) {
      toast.error("kuis Gagal dihapus");
      // Tampilkan pesan error ke pengguna
      // alert(`Error: ${error.message}`);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsDeleting(false); // Selesai loading
      setQuizToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setQuizToDelete(null);
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case "EASY":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "HARD":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: QuizStatus) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: QuizStatus) => {
    switch (status) {
      case "PUBLISHED":
        return <Eye className="w-3 h-3" />;
      case "DRAFT":
        return <Edit className="w-3 h-3" />;
      case "ARCHIVED":
        return <EyeOff className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <MyQuizPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-page-gradient-start via-page-gradient-middle to-page-gradient-end">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text-strong mb-2">
                Kuis Saya
              </h1>
              <p className="text-text-subtle">
                Kelola dan pantau semua kuis yang telah Anda buat
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface-raised p-6 rounded-xl shadow-sm border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-subtle rounded-lg">
                <BookOpen className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="text-sm text-text-subtle">Total Kuis</p>
                <p className="text-2xl font-bold text-text-strong">
                  {allQuizzes.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-surface-raised p-6 rounded-xl shadow-sm border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Users className="w-5 h-5 text-stat-positive" />
              </div>
              <div>
                <p className="text-sm text-text-subtle">Total Peserta</p>
                <p className="text-2xl font-bold text-text-strong">
                  {allQuizzes.reduce((acc, quiz) => acc + quiz.takesCount, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-surface-raised p-6 rounded-xl shadow-sm border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-text-subtle">Total Likes</p>
                <p className="text-2xl font-bold text-text-strong">
                  {allQuizzes.reduce((acc, quiz) => acc + quiz.likesCount, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-surface-raised p-6 rounded-xl shadow-sm border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-text-subtle">Terpublikasi</p>
                <p className="text-2xl font-bold text-text-strong">
                  {
                    allQuizzes.filter((quiz) => quiz.status === "PUBLISHED")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === status
                    ? "bg-brand text-brand-foreground shadow-md"
                    : "bg-surface-raised text-text-subtle hover:bg-surface-sunken border border-border"
                }`}
              >
                {status === "ALL"
                  ? "Semua"
                  : status.charAt(0) + status.slice(1).toLowerCase()}
                <span className="ml-2 text-xs">
                  (
                  {status === "ALL"
                    ? allQuizzes.length
                    : allQuizzes.filter((quiz) => quiz.status === status)
                        .length}
                  )
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quiz Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayedQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-surface-raised rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-text-strong line-clamp-1">
                      {quiz.title}
                    </h3>
                    {quiz.isAiGenerated && (
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-xs rounded-full">
                        AI
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-subtle line-clamp-2 mb-3">
                    {quiz.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`/my-kuis/${quiz.id}/edit`}
                    className="p-2 text-text-subtle hover:text-brand hover:bg-brand-subtle rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(quiz)}
                    className="p-2 text-text-subtle hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status & Category */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    quiz.status
                  )}`}
                >
                  {getStatusIcon(quiz.status)}
                  {quiz.status.charAt(0) + quiz.status.slice(1).toLowerCase()}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                    quiz.difficulty
                  )}`}
                >
                  {quiz.difficulty}
                </span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 rounded-full text-xs">
                  {quiz.categoryName}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-text-subtle mb-1">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">Durasi</span>
                  </div>
                  <p className="text-sm font-semibold text-text-strong">
                    {quiz.duration}m
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-text-subtle mb-1">
                    <BookOpen className="w-3 h-3" />
                    <span className="text-xs">Soal</span>
                  </div>
                  <p className="text-sm font-semibold text-text-strong">
                    {quiz.questionsCount}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-text-subtle mb-1">
                    <Users className="w-3 h-3" />
                    <span className="text-xs">Peserta</span>
                  </div>
                  <p className="text-sm font-semibold text-text-strong">
                    {quiz.takesCount}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-text-subtle mb-1">
                    <Heart className="w-3 h-3" />
                    <span className="text-xs">Likes</span>
                  </div>
                  <p className="text-sm font-semibold text-text-strong">
                    {quiz.likesCount}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-xs text-text-subtle">
                  <span>Dibuat: {formatDate(quiz.createdAt)}</span>
                  <span>Diupdate: {formatDate(quiz.updatedAt)}</span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Link
                    href={`/kuis/${quiz.id}/take`}
                    className={`px-4 py-2 text-white rounded-lg font-medium transition-all flex items-center gap-2 ${
                      quiz.status === "PUBLISHED"
                        ? "bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end hover:shadow-lg hover:shadow-brand/25 hover:scale-105"
                        : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed hidden"
                    }`}
                    aria-disabled={quiz.status !== "PUBLISHED"}
                    tabIndex={quiz.status !== "PUBLISHED" ? -1 : undefined}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Mulai Quiz</span>
                  </Link>

                  {quiz.status === "DRAFT" && (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 ml-2">
                      (Hanya quiz yang dipublikasikan bisa dimulai)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {displayedQuizzes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-brand-subtle rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-12 h-12 text-brand" />
            </div>
            <h3 className="text-lg font-semibold text-text-strong mb-2">
              {filter === "ALL"
                ? "Belum ada kuis"
                : `Tidak ada kuis dengan status ${filter.toLowerCase()}`}
            </h3>
            <p className="text-text-subtle mb-6">
              {filter === "ALL"
                ? "Mulai membuat kuis pertama Anda untuk berbagi pengetahuan"
                : "Coba ubah filter untuk melihat kuis lainnya"}
            </p>
            {filter === "ALL" && (
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
                <Plus className="w-5 h-5" />
                Buat Kuis Pertama
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-raised rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-strong">
                  Hapus Kuis
                </h3>
                <p className="text-sm text-text-subtle">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <p className="text-text-subtle mb-6">
              Apakah Anda yakin ingin menghapus kuis{" "}
              <strong>"{quizToDelete?.title}"</strong>? Semua data terkait kuis
              ini akan hilang permanen.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting} // Nonaktifkan saat menghapus
                className="flex-1 px-4 py-2 border border-border text-text-subtle hover:bg-surface-sunken rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting} // Nonaktifkan saat menghapus
                className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isDeleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQuizPage;
