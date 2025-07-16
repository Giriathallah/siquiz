"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Clock,
  Users,
  Star,
  BookOpen,
  Tag,
  Calendar,
  Loader2,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  LoadMoreSkeleton,
  QuizPageSkeleton,
  FilteringSkeleton,
} from "@/components/user/skeletons/quizPageSkeleton";
import QuizCard from "@/components/user/quizCard";

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

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

interface ApiResponse<T> {
  data: T;
  meta: PaginationMeta;
}

interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: string;
  tags?: string[];
  sortBy?: string;
}

const buildQueryString = (params: FetchParams): string => {
  const query = new URLSearchParams();

  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.search) query.append("search", params.search);
  if (params.category) query.append("category", params.category);
  if (params.difficulty) query.append("difficulty", params.difficulty);
  if (params.tags && params.tags.length > 0)
    query.append("tags", params.tags.join(","));
  if (params.sortBy) query.append("sortBy", params.sortBy);

  return query.toString();
};

const fetchQuizzes = async (
  params: FetchParams
): Promise<ApiResponse<Quiz[]>> => {
  const queryString = buildQueryString(params);
  const response = await fetch(`/api/quiz?${queryString}`);
  if (!response.ok) {
    throw new Error("Failed to fetch quizzes");
  }
  return response.json();
};

const fetchCategories = async (): Promise<{ data: Category[] }> => {
  const response = await fetch("/api/category?limit=100"); // Ambil semua kategori
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
};

const fetchTags = async (): Promise<{ data: Tag[] }> => {
  const response = await fetch("/api/tag?limit=100"); // Ambil semua tag
  if (!response.ok) {
    throw new Error("Failed to fetch tags");
  }
  return response.json();
};

const FilterPanel = ({
  categories,
  tags,
  selectedCategory,
  setSelectedCategory,
  selectedTags,
  setSelectedTags,
  selectedDifficulty,
  setSelectedDifficulty,
  isOpen,
}: {
  // ... props lainnya
  categories: Category[];
  tags: Tag[];
}) => {
  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="bg-surface-raised border border-border rounded-xl p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Filter */}
        <div>
          <h3 className="font-semibold text-text-strong mb-3">Kategori</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === ""}
                onChange={() => setSelectedCategory("")}
                className="w-4 h-4 text-brand border-border focus:ring-brand"
              />
              <span className="text-sm text-text-subtle">Semua Kategori</span>
            </label>
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === category.id}
                  onChange={() => setSelectedCategory(category.id)}
                  className="w-4 h-4 text-brand border-border focus:ring-brand"
                />
                <span className="text-sm text-text-subtle">
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div>
          <h3 className="font-semibold text-text-strong mb-3">
            Tingkat Kesulitan
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="difficulty"
                checked={selectedDifficulty === ""}
                onChange={() => setSelectedDifficulty("")}
                className="w-4 h-4 text-brand border-border focus:ring-brand"
              />
              <span className="text-sm text-text-subtle">Semua Level</span>
            </label>
            {["EASY", "MEDIUM", "HARD"].map((difficulty) => (
              <label
                key={difficulty}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="difficulty"
                  checked={selectedDifficulty === difficulty}
                  onChange={() => setSelectedDifficulty(difficulty)}
                  className="w-4 h-4 text-brand border-border focus:ring-brand"
                />
                <span className="text-sm text-text-subtle">
                  {difficulty === "EASY"
                    ? "Mudah"
                    : difficulty === "MEDIUM"
                    ? "Menengah"
                    : "Sulit"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Tags Filter */}
        <div>
          <h3 className="font-semibold text-text-strong mb-3">Tag</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  selectedTags.includes(tag.id)
                    ? "bg-brand text-brand-foreground shadow-md"
                    : "bg-surface-sunken text-text-subtle hover:bg-brand-subtle hover:text-brand"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function QuizListingPage() {
  // State untuk data dan UI
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // State untuk filter dan search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "filtering" | "loading-more"
  >("loading");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fungsi untuk fetching data kuis
  const loadQuizzes = useCallback(
    async (currentPage: number, isLoadMore = false) => {
      // Set loading state berdasarkan kondisi
      if (isLoadMore) {
        setStatus("loading-more");
      } else if (currentPage === 1 && !isInitialLoad) {
        setStatus("filtering");
      } else {
        setStatus("loading");
      }

      try {
        const params = {
          page: currentPage,
          limit: 9,
          search: debouncedSearchQuery,
          category: selectedCategory,
          difficulty: selectedDifficulty,
          tags: selectedTags,
          sortBy: sortBy,
        };

        // Simulasi delay untuk demo (hapus di production)
        await new Promise((resolve) => setTimeout(resolve, 800));

        const response = await fetchQuizzes(params);

        setQuizzes(
          isLoadMore ? (prev) => [...prev, ...response.data] : response.data
        );
        setMeta(response.meta);
        setStatus("idle");
        setIsInitialLoad(false);
      } catch (error) {
        console.error(error);
        setStatus("error");
        setIsInitialLoad(false);
      }
    },
    [
      debouncedSearchQuery,
      selectedCategory,
      selectedDifficulty,
      selectedTags,
      sortBy,
      isInitialLoad,
    ]
  );

  useEffect(() => {
    setPage(1); // Reset ke halaman pertama saat filter berubah
    loadQuizzes(1, false);
  }, [
    debouncedSearchQuery,
    selectedCategory,
    selectedDifficulty,
    selectedTags,
    sortBy,
    loadQuizzes,
  ]);

  useEffect(() => {
    if (page > 1) {
      loadQuizzes(page, true);
    }
  }, [page, loadQuizzes]);

  useEffect(() => {
    const loadInitialFilters = async () => {
      try {
        const [catResponse, tagResponse] = await Promise.all([
          fetchCategories(),
          fetchTags(),
        ]);
        setCategories(catResponse.data);
        setTags(tagResponse.data);
      } catch (error) {
        console.error("Failed to load filters data", error);
      }
    };
    loadInitialFilters();
  }, []);

  const handleSaveToggle = useCallback((quizId: string, isSaved: boolean) => {
    setQuizzes((prev) =>
      prev.map((quiz) => (quiz.id === quizId ? { ...quiz, isSaved } : quiz))
    );
  }, []);
  const handleLikeToggle = useCallback(
    (quizId: string, isLiked: boolean, newLikesCount: number) => {
      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.id === quizId
            ? {
                ...quiz,
                isLiked,
                _count: { ...quiz._count, likes: newLikesCount },
              }
            : quiz
        )
      );
    },
    []
  );

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedTags([]);
    setSelectedDifficulty("");
    setSortBy("newest");
    setIsFilterOpen(false);
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedDifficulty,
    ...selectedTags,
  ].filter(Boolean).length;

  // const getCategoryName = (id: string) =>
  //   categories.find((c) => c.id === id)?.name || id;
  // const getTagName = (id: string) => tags.find((t) => t.id === id)?.name || id;

  if (status === "loading" && isInitialLoad) {
    return <QuizPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-page-gradient-start via-page-gradient-middle to-page-gradient-end">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text text-transparent mb-4">
            Jelajahi Quiz
          </h1>
          <p className="text-lg text-text-subtle max-w-2xl mx-auto">
            Temukan quiz yang sesuai dengan minat dan tingkat keahlian Anda.
            Asah kemampuan dengan berbagai topik menarik.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-surface-raised border border-border rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-subtle w-5 h-5" />
              <input
                type="text"
                placeholder="Cari quiz berdasarkan judul, deskripsi, atau pembuat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface-sunken border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-text-strong placeholder-text-subtle"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isFilterOpen || activeFiltersCount > 0
                  ? "bg-brand text-brand-foreground shadow-md"
                  : "bg-surface-sunken text-text-subtle hover:bg-brand-subtle hover:text-brand"
              }`}
            >
              <Filter className="w-5 h-5" />
              Filter
              {activeFiltersCount > 0 && (
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-surface-sunken border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-text-strong"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="popular">Terpopuler</option>
              <option value="duration">Durasi Tercepat</option>
            </select>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 text-text-subtle hover:text-text-strong transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          categories={categories}
          tags={tags}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          isOpen={isFilterOpen}
          setIsOpen={setIsFilterOpen}
        />

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-text-subtle">
            {status !== "loading" &&
              meta &&
              `Menampilkan ${quizzes.length} dari ${meta.total} total quiz`}
          </p>

          {/* Loading & Error State */}

          {status === "error" && (
            <div className="text-center py-16 text-red-500">
              <h3 className="text-xl font-semibold">Gagal memuat data</h3>
              <p>
                Terjadi kesalahan saat mengambil data kuis. Silakan coba lagi
                nanti.
              </p>
            </div>
          )}

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-text-subtle">Filter aktif:</span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand text-brand-foreground text-xs rounded-md">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedDifficulty && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand text-brand-foreground text-xs rounded-md">
                  {selectedDifficulty === "EASY"
                    ? "Mudah"
                    : selectedDifficulty === "MEDIUM"
                    ? "Menengah"
                    : "Sulit"}
                  <button
                    onClick={() => setSelectedDifficulty("")}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedTags.map((tagId) => {
                const tag = tags.find((t) => t.id === tagId);
                return (
                  <span
                    key={tagId}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-brand text-brand-foreground text-xs rounded-md"
                  >
                    {tag?.name}
                    <button
                      onClick={() =>
                        setSelectedTags((prev) =>
                          prev.filter((id) => id !== tagId)
                        )
                      }
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Quiz Grid */}
        {status === "error" ? (
          <div className="text-center py-16 text-red-500">
            <h3 className="text-xl font-semibold">Gagal memuat data</h3>
            <p>
              Terjadi kesalahan saat mengambil data kuis. Silakan coba lagi
              nanti.
            </p>
          </div>
        ) : status === "filtering" ? (
          <FilteringSkeleton />
        ) : quizzes.length > 0 ? (
          <>
            {/* Quiz Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onSaveToggle={handleSaveToggle}
                  onLikeToggle={handleLikeToggle}
                />
              ))}
            </div>

            {/* Load More Section */}
            {status === "loading-more" && <LoadMoreSkeleton />}

            {meta?.hasNextPage && status !== "loading-more" && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setPage((prevPage) => prevPage + 1)}
                  className="px-6 py-3 bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end text-white rounded-lg font-medium hover:shadow-lg hover:shadow-brand/25 transition-all duration-300"
                  disabled={status === "loading-more"}
                >
                  Muat Lebih Banyak
                </button>
              </div>
            )}
          </>
        ) : (
          status === "idle" && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-surface-sunken rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-text-subtle" />
              </div>
              <h3 className="text-xl font-semibold text-text-strong mb-2">
                Tidak ada quiz ditemukan
              </h3>
              <p className="text-text-subtle mb-4">
                Coba ubah kata kunci pencarian atau filter Anda
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end text-white rounded-lg font-medium hover:shadow-lg hover:shadow-brand/25 transition-all duration-300"
              >
                Reset Semua Filter
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
