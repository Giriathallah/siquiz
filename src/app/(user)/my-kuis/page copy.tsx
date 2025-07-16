"use client";
import { useState } from "react";
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
} from "lucide-react";

// Mock data berdasarkan schema Prisma
const mockQuizzes = [
  {
    id: "quiz-1",
    title: "JavaScript Fundamentals",
    description:
      "Test your knowledge of JavaScript basics including variables, functions, and DOM manipulation.",
    duration: 30,
    status: "PUBLISHED",
    difficulty: "EASY",
    takesCount: 245,
    likesCount: 32,
    createdAt: "2024-12-15T10:30:00Z",
    updatedAt: "2024-12-20T14:22:00Z",
    category: { name: "Programming" },
    questions: Array(15).fill(null),
    isAiGenerated: false,
  },
  {
    id: "quiz-2",
    title: "React Hooks Deep Dive",
    description:
      "Advanced concepts of React Hooks including useState, useEffect, useContext, and custom hooks.",
    duration: 45,
    status: "PUBLISHED",
    difficulty: "HARD",
    takesCount: 89,
    likesCount: 67,
    createdAt: "2024-12-10T09:15:00Z",
    updatedAt: "2024-12-18T16:45:00Z",
    category: { name: "React" },
    questions: Array(20).fill(null),
    isAiGenerated: true,
  },
  {
    id: "quiz-3",
    title: "CSS Grid & Flexbox",
    description:
      "Master modern CSS layout techniques with practical examples and exercises.",
    duration: 25,
    status: "DRAFT",
    difficulty: "MEDIUM",
    takesCount: 0,
    likesCount: 0,
    createdAt: "2024-12-22T11:20:00Z",
    updatedAt: "2024-12-22T11:20:00Z",
    category: { name: "CSS" },
    questions: Array(12).fill(null),
    isAiGenerated: false,
  },
  {
    id: "quiz-4",
    title: "Database Design Principles",
    description:
      "Learn about normalization, relationships, indexing, and query optimization in relational databases.",
    duration: 60,
    status: "PUBLISHED",
    difficulty: "HARD",
    takesCount: 156,
    likesCount: 43,
    createdAt: "2024-12-08T14:00:00Z",
    updatedAt: "2024-12-19T10:30:00Z",
    category: { name: "Database" },
    questions: Array(25).fill(null),
    isAiGenerated: false,
  },
  {
    id: "quiz-5",
    title: "Node.js Basics",
    description:
      "Introduction to server-side JavaScript with Node.js, Express, and NPM.",
    duration: 40,
    status: "ARCHIVED",
    difficulty: "MEDIUM",
    takesCount: 312,
    likesCount: 88,
    createdAt: "2024-11-25T08:45:00Z",
    updatedAt: "2024-12-01T13:20:00Z",
    category: { name: "Backend" },
    questions: Array(18).fill(null),
    isAiGenerated: true,
  },
];

const MyQuizPage = () => {
  const [quizzes, setQuizzes] = useState(mockQuizzes);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [filter, setFilter] = useState("ALL");

  const handleDeleteClick = (quiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (quizToDelete) {
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizToDelete.id));
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setQuizToDelete(null);
  };

  const getDifficultyColor = (difficulty) => {
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

  const getStatusColor = (status) => {
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

  const getStatusIcon = (status) => {
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

  const filteredQuizzes =
    filter === "ALL"
      ? quizzes
      : quizzes.filter((quiz) => quiz.status === filter);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg">
              <Plus className="w-5 h-5" />
              Buat Kuis Baru
            </button>
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
                  {quizzes.length}
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
                  {quizzes.reduce((acc, quiz) => acc + quiz.takesCount, 0)}
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
                  {quizzes.reduce((acc, quiz) => acc + quiz.likesCount, 0)}
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
                  {quizzes.filter((quiz) => quiz.status === "PUBLISHED").length}
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
                    ? quizzes.length
                    : quizzes.filter((quiz) => quiz.status === status).length}
                  )
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quiz Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredQuizzes.map((quiz) => (
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
                  <button className="p-2 text-text-subtle hover:text-brand hover:bg-brand-subtle rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
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
                  {quiz.category.name}
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
                    {quiz.questions.length}
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
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredQuizzes.length === 0 && (
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
                className="flex-1 px-4 py-2 border border-border text-text-subtle hover:bg-surface-sunken rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQuizPage;
