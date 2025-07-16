"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Users,
  Heart,
  BookOpen,
  Tag,
  Calendar,
  Loader2,
  Bookmark,
} from "lucide-react";

interface Creator {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  creator: Creator;
  category: Category | null;
  tags: Tag[];
  _count: {
    attempts: number;
    participants: number;
    questions: number;
    likes: number;
  };
  isSaved?: boolean;
  isLiked?: boolean;
  createdAt: string;
}

const toggleSaveQuiz = async (
  quizId: string
): Promise<{ message: string; isSaved: boolean }> => {
  try {
    const response = await fetch(`/api/quiz/${quizId}/save`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    const isSaved = data.message.includes("berhasil di-save");

    return {
      message: data.message,
      isSaved: isSaved,
    };
  } catch (error) {
    console.error("Error toggling save quiz:", error);
    throw error;
  }
};
const toggleLikeQuiz = async (
  quizId: string
): Promise<{ message: string; isLiked: boolean; newLikesCount: number }> => {
  try {
    const response = await fetch(`/api/quiz/${quizId}/like`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error toggling like quiz:", error);
    throw error;
  }
};

const QuizCard: React.FC<{
  quiz: Quiz;
  onSaveToggle?: (quizId: string, isSaved: boolean) => void;
  onLikeToggle?: (
    quizId: string,
    isLiked: boolean,
    newLikesCount: number
  ) => void;
}> = ({ quiz, onSaveToggle, onLikeToggle }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const [savedState, setSavedState] = useState(quiz.isSaved || false);
  const [likedState, setLikedState] = useState(quiz.isLiked || false);
  const [likeCount, setLikeCount] = useState(quiz._count.likes);

  const getDifficultyColor = (difficulty: Quiz["difficulty"]) => {
    switch (difficulty) {
      case "EASY":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "HARD":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaving) return;

    setIsSaving(true);
    try {
      const result = await toggleSaveQuiz(quiz.id);
      setSavedState(result.isSaved);
      onSaveToggle?.(quiz.id, result.isSaved);
    } catch (error) {
      console.error("Failed to toggle save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiking) return;

    setIsLiking(true);
    try {
      const result = await toggleLikeQuiz(quiz.id);
      setLikedState(result.isLiked);
      setLikeCount(result.newLikesCount);
      onLikeToggle?.(quiz.id, result.isLiked, result.newLikesCount);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="group relative bg-surface-raised border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-brand/5 transition-all duration-300 hover:border-brand/20">
      {/* Action Buttons Container */}
      <div className="absolute top-4 right-4 flex flex-col items-center gap-2">
        {/* Save Button */}
        <button
          onClick={handleSaveToggle}
          disabled={isSaving}
          className={`p-2 rounded-full transition-all duration-200 ${
            savedState
              ? "bg-brand text-brand-foreground shadow-md"
              : "bg-surface-sunken text-text-subtle hover:bg-brand-subtle hover:text-brand"
          } ${isSaving ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}`}
          title={savedState ? "Hapus dari tersimpan" : "Simpan quiz"}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Bookmark
              className={`w-4 h-4 ${savedState ? "fill-current" : ""}`}
            />
          )}
        </button>

        {/* Like Button & Count */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleLikeToggle}
            disabled={isLiking}
            className={`p-2 rounded-full transition-all duration-200 ${
              isLiking ? "opacity-50 cursor-not-allowed" : "hover:scale-110"
            } ${
              likedState
                ? "text-red-500 bg-red-500/10"
                : "text-text-subtle bg-surface-sunken hover:bg-red-500/10 hover:text-red-500"
            }`}
            title={likedState ? "Batal menyukai" : "Sukai quiz"}
          >
            {isLiking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart
                className={`w-4 h-4 ${likedState ? "fill-current" : ""}`}
              />
            )}
          </button>
          <span className="text-xs text-text-subtle mt-1">{likeCount}</span>
        </div>
      </div>

      {/* Header - Adjust margin for action buttons */}
      <div className="flex items-start justify-between mb-4 pr-16">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-text-strong mb-2 group-hover:text-brand transition-colors">
            {quiz.title}
          </h3>
          <p className="text-text-subtle text-sm line-clamp-2 mb-3">
            {quiz.description}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
            quiz.difficulty
          )}`}
        >
          {quiz.difficulty}
        </span>
      </div>

      {/* Category */}
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-brand" />
        <span className="text-sm font-medium text-brand">
          {quiz.category?.name || "Uncategorized"}
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quiz.tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-1 bg-brand-subtle text-brand text-xs rounded-md"
          >
            <Tag className="w-3 h-3" />
            {tag.name}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-text-subtle mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{quiz.duration} menit</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{quiz._count.participants} peserta</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(quiz.createdAt)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-sm text-text-subtle">
          Oleh {quiz.creator.name}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/kuis/${quiz.id}/take`}
            className="px-4 py-2 bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end text-white rounded-lg font-medium hover:shadow-lg hover:shadow-brand/25 transition-all duration-300 hover:scale-105"
          >
            Mulai Quiz
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
