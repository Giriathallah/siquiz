"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Save,
  Settings,
  Loader2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import type { Difficulty, QuestionType, QuizStatus } from "@/generated/prisma";
import type { ZodIssue } from "zod";

// Helper & Komponen UI
import { useDebounce } from "@/hooks/useDebounce";
import {
  MultiSelectCombobox,
  SelectableItem,
} from "@/components/user/multiSelect";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// --- Definisi Tipe Data ---

// Tipe data berdasarkan response API
type Category = {
  id: string;
  name: string;
};
type Tag = {
  id: string;
  name: string;
};

// Tipe data untuk state form di client-side
type FormOption = {
  id: string;
  optionText: string;
  isCorrect: boolean;
};

type FormQuestion = {
  id: string;
  questionText: string;
  questionType: QuestionType;
  points: number;
  explanation: string;
  correctAnswer: boolean | null;
  sampleAnswer: string;
  options: FormOption[];
};

type FormQuiz = {
  title: string;
  description: string;
  duration: number;
  difficulty: Difficulty;
  shuffleQuestions: boolean;
  categoryId: string | null;
  tags: Tag[];
};

// --- Komponen Utama ---

const CreateQuizPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [activeTab, setActiveTab] = useState<"basic" | "questions">("basic");

  // State untuk data dari API
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  const debouncedCategorySearch = useDebounce(categorySearch, 300);
  const debouncedTagSearch = useDebounce(tagSearch, 300);

  // State utama untuk data form
  const [quiz, setQuiz] = useState<FormQuiz>({
    title: "",
    description: "",
    duration: 30,
    difficulty: "MEDIUM",
    shuffleQuestions: false,
    categoryId: null,
    tags: [],
  });

  const [questions, setQuestions] = useState<FormQuestion[]>([
    {
      id: Date.now().toString(),
      questionText: "",
      questionType: "MULTIPLE_CHOICE",
      points: 1,
      explanation: "",
      correctAnswer: null,
      sampleAnswer: "",
      options: [
        { id: Date.now() + "_1", optionText: "", isCorrect: false },
        { id: Date.now() + "_2", optionText: "", isCorrect: false },
      ],
    },
  ]);

  // --- Efek untuk Fetching Data ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `/api/category?${debouncedCategorySearch}`
        );
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data.data || []);
      } catch (error) {
        console.error(error);
        // Anda bisa menambahkan notifikasi toast di sini
      }
    };
    fetchCategories();
  }, [debouncedCategorySearch]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`/api/tag?${debouncedTagSearch}`);
        if (!response.ok) throw new Error("Failed to fetch tags");
        const data = await response.json();
        setTags(data.data || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTags();
  }, [debouncedTagSearch]);

  const addOption = (qId: string) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: [
                ...q.options,
                {
                  id: Date.now() + "_" + q.options.length,
                  optionText: "",
                  isCorrect: false,
                },
              ],
            }
          : q
      )
    );

  const removeOption = (qId: string, oId: string) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId && q.options.length > 2
          ? {
              ...q,
              options: q.options.filter((o) => o.id !== oId),
            }
          : q
      )
    );

  // --- Logika Handler Form ---

  const handleSaveQuiz = async (status: QuizStatus = "DRAFT") => {
    setLoading(true);
    setErrors({});

    const transformedQuestions = questions.map((q) => {
      let optionsPayload: { optionText: string; isCorrect: boolean }[] = [];
      if (q.questionType === "MULTIPLE_CHOICE") {
        optionsPayload = q.options.map((opt) => ({
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
        }));
      } else if (q.questionType === "TRUE_FALSE") {
        optionsPayload = [
          { optionText: "True", isCorrect: q.correctAnswer === true },
          { optionText: "False", isCorrect: q.correctAnswer === false },
        ];
      } else if (q.questionType === "SHORT_ANSWER") {
        optionsPayload = [{ optionText: q.sampleAnswer, isCorrect: true }];
      }
      return {
        questionText: q.questionText,
        questionType: q.questionType,
        points: q.points,
        explanation: q.explanation || undefined,
        options: optionsPayload,
      };
    });

    const payload = {
      title: quiz.title,
      description: quiz.description,
      duration: quiz.duration,
      difficulty: quiz.difficulty,
      shuffleQuestions: quiz.shuffleQuestions,
      categoryId: quiz.categoryId,
      status,
      tags: quiz.tags.map((tag) => ({ name: tag.name })),
      questions: transformedQuestions,
    };

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.errors) {
          const zodErrors: Record<string, string> = {};
          (responseData.errors as ZodIssue[]).forEach((err) => {
            zodErrors[err.path.join(".")] = err.message;
          });
          setErrors(zodErrors);

          window.scrollTo(0, 0);
        } else {
          setErrors({
            submit: responseData.message || "An unexpected error occurred.",
          });
        }
        return;
      }

      alert("Quiz created successfully!");
      router.push(`/dashboard/quizzes`);
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      setErrors({
        submit: "A network or unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () =>
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        questionText: "",
        questionType: "MULTIPLE_CHOICE",
        points: 1,
        explanation: "",
        correctAnswer: null,
        sampleAnswer: "",
        options: [
          { id: Date.now() + "_1", optionText: "", isCorrect: false },
          { id: Date.now() + "_2", optionText: "", isCorrect: false },
        ],
      },
    ]);
  const deleteQuestion = (id: string) =>
    questions.length > 1 && setQuestions(questions.filter((q) => q.id !== id));
  const updateQuestion = <K extends keyof FormQuestion>(
    id: string,
    field: K,
    value: FormQuestion[K]
  ) =>
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  const updateOption = (qId: string, oId: string, text: string) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === oId ? { ...o, optionText: text } : o
              ),
            }
          : q
      )
    );
  const handleCorrectOptionChange = (qId: string, correctOId: string) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((o) => ({
                ...o,
                isCorrect: o.id === correctOId,
              })),
            }
          : q
      )
    );

  // --- Memoized Values untuk Komponen Select ---
  const tagOptions = useMemo(
    () => tags.map((tag) => ({ value: tag.id, label: tag.name })),
    [tags]
  );
  const selectedTags = useMemo(
    () => quiz.tags.map((tag) => ({ value: tag.id, label: tag.name })),
    [quiz.tags]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Create New Quiz
              </h1>
              <p className="text-gray-500 mt-1">
                Build an engaging quiz for your audience.
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => handleSaveQuiz("DRAFT")}
                disabled={loading}
                className="w-1/2 sm:w-auto"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Draft
              </Button>
              <Button
                onClick={() => handleSaveQuiz("PUBLISHED")}
                disabled={loading}
                className="w-1/2 sm:w-auto"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Publish Quiz
              </Button>
            </div>
          </div>
        </div>

        {/* --- Pesan Error Global --- */}
        {errors.submit && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <p className="font-semibold">Submission Error</p>
            <p className="text-sm">{errors.submit}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigasi */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-6">
              <nav className="space-y-2">
                <Button
                  variant={activeTab === "basic" ? "secondary" : "ghost"}
                  onClick={() => setActiveTab("basic")}
                  className="w-full justify-start gap-3"
                >
                  <Settings className="w-4 h-4" /> Basic Info
                </Button>
                <Button
                  variant={activeTab === "questions" ? "secondary" : "ghost"}
                  onClick={() => setActiveTab("questions")}
                  className="w-full justify-start gap-3"
                >
                  <Plus className="w-4 h-4" /> Questions
                </Button>
              </nav>
            </div>
          </div>

          {/* Konten Utama */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* --- Tab Basic Info --- */}
              {activeTab === "basic" && (
                <div className="p-6 space-y-6">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Quiz Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={quiz.title}
                      onChange={(e) =>
                        setQuiz({ ...quiz, title: e.target.value })
                      }
                      placeholder="e.g., JavaScript Fundamentals"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={quiz.description}
                      onChange={(e) =>
                        setQuiz({ ...quiz, description: e.target.value })
                      }
                      placeholder="A brief description of your quiz"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="duration"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Duration (minutes)
                      </label>
                      <input
                        id="duration"
                        type="number"
                        value={quiz.duration}
                        onChange={(e) =>
                          setQuiz({
                            ...quiz,
                            duration: parseInt(e.target.value) || 0,
                          })
                        }
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      {errors.duration && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.duration}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="difficulty"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Difficulty
                      </label>
                      <select
                        id="difficulty"
                        value={quiz.difficulty}
                        onChange={(e) =>
                          setQuiz({
                            ...quiz,
                            difficulty: e.target.value as Difficulty,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between font-normal"
                        >
                          {quiz.categoryId
                            ? categories.find((c) => c.id === quiz.categoryId)
                                ?.name
                            : "Select a category..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search category..."
                            value={categorySearch}
                            onValueChange={setCategorySearch}
                          />
                          <CommandList>
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup>
                              {categories.map((c) => (
                                <CommandItem
                                  key={c.id}
                                  value={c.name}
                                  onSelect={() =>
                                    setQuiz({ ...quiz, categoryId: c.id })
                                  }
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      quiz.categoryId === c.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {c.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {errors.categoryId && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.categoryId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <MultiSelectCombobox
                      options={tagOptions}
                      selected={selectedTags}
                      onChange={(sel) =>
                        setQuiz({
                          ...quiz,
                          tags: sel.map((s) => ({
                            id: s.value,
                            name: s.label,
                          })),
                        })
                      }
                      placeholder="Select tags..."
                      className="w-full"
                    />
                    {errors.tags && (
                      <p className="text-sm text-red-600 mt-1">{errors.tags}</p>
                    )}
                  </div>
                </div>
              )}
              {/* --- Tab Questions --- */}
              {/* --- Tab Questions --- */}
              {activeTab === "questions" && (
                <div className="p-6 space-y-6">
                  {questions.map((q, index) => (
                    <div
                      key={q.id}
                      className="border border-gray-200 rounded-lg p-6 bg-gray-50/50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-800">
                          Question {index + 1}
                        </h3>
                        {questions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteQuestion(q.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Question Text */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Text
                          </label>
                          <textarea
                            value={q.questionText}
                            onChange={(e) =>
                              updateQuestion(
                                q.id,
                                "questionText",
                                e.target.value
                              )
                            }
                            placeholder="Enter your question..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
                          />
                          {errors[`questions.${index}.questionText`] && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors[`questions.${index}.questionText`]}
                            </p>
                          )}
                        </div>

                        {/* Question Type & Points */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Question Type
                            </label>
                            <select
                              value={q.questionType}
                              onChange={(e) => {
                                const newType = e.target.value as QuestionType;
                                updateQuestion(q.id, "questionType", newType);

                                // Reset options based on type
                                if (newType === "MULTIPLE_CHOICE") {
                                  updateQuestion(q.id, "options", [
                                    {
                                      id: Date.now() + "_1",
                                      optionText: "",
                                      isCorrect: false,
                                    },
                                    {
                                      id: Date.now() + "_2",
                                      optionText: "",
                                      isCorrect: false,
                                    },
                                  ]);
                                  updateQuestion(q.id, "correctAnswer", null);
                                  updateQuestion(q.id, "sampleAnswer", "");
                                } else if (newType === "TRUE_FALSE") {
                                  updateQuestion(q.id, "options", []);
                                  updateQuestion(q.id, "correctAnswer", null);
                                  updateQuestion(q.id, "sampleAnswer", "");
                                } else if (newType === "SHORT_ANSWER") {
                                  updateQuestion(q.id, "options", []);
                                  updateQuestion(q.id, "correctAnswer", null);
                                  updateQuestion(q.id, "sampleAnswer", "");
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="MULTIPLE_CHOICE">
                                Multiple Choice
                              </option>
                              <option value="TRUE_FALSE">True/False</option>
                              <option value="SHORT_ANSWER">Short Answer</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Points
                            </label>
                            <input
                              type="number"
                              value={q.points}
                              onChange={(e) =>
                                updateQuestion(
                                  q.id,
                                  "points",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Question Options based on type */}
                        {q.questionType === "MULTIPLE_CHOICE" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Answer Options
                            </label>
                            <div className="space-y-2">
                              {q.options.map((opt, optIndex) => (
                                <div
                                  key={opt.id}
                                  className="flex items-center gap-3"
                                >
                                  <input
                                    type="radio"
                                    name={`correct-${q.id}`}
                                    checked={opt.isCorrect}
                                    onChange={() =>
                                      handleCorrectOptionChange(q.id, opt.id)
                                    }
                                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                  />
                                  <input
                                    type="text"
                                    value={opt.optionText}
                                    onChange={(e) =>
                                      updateOption(q.id, opt.id, e.target.value)
                                    }
                                    placeholder={`Option ${optIndex + 1}`}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
                                  />
                                  {q.options.length > 2 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-500 hover:text-red-600"
                                      onClick={() => removeOption(q.id, opt.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addOption(q.id)}
                                className="mt-2"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Option
                              </Button>
                            </div>
                            {errors[`questions.${index}.options`] && (
                              <p className="text-sm text-red-600 mt-1">
                                {errors[`questions.${index}.options`]}
                              </p>
                            )}
                          </div>
                        )}

                        {q.questionType === "TRUE_FALSE" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Correct Answer
                            </label>
                            <div className="flex gap-4">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name={`truefalse-${q.id}`}
                                  checked={q.correctAnswer === true}
                                  onChange={() =>
                                    updateQuestion(q.id, "correctAnswer", true)
                                  }
                                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 mr-2"
                                />
                                True
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name={`truefalse-${q.id}`}
                                  checked={q.correctAnswer === false}
                                  onChange={() =>
                                    updateQuestion(q.id, "correctAnswer", false)
                                  }
                                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 mr-2"
                                />
                                False
                              </label>
                            </div>
                            {errors[`questions.${index}.correctAnswer`] && (
                              <p className="text-sm text-red-600 mt-1">
                                {errors[`questions.${index}.correctAnswer`]}
                              </p>
                            )}
                          </div>
                        )}

                        {q.questionType === "SHORT_ANSWER" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Sample/Expected Answer
                            </label>
                            <input
                              type="text"
                              value={q.sampleAnswer}
                              onChange={(e) =>
                                updateQuestion(
                                  q.id,
                                  "sampleAnswer",
                                  e.target.value
                                )
                              }
                              placeholder="Enter a sample correct answer..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors[`questions.${index}.sampleAnswer`] && (
                              <p className="text-sm text-red-600 mt-1">
                                {errors[`questions.${index}.sampleAnswer`]}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Explanation */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Explanation (Optional)
                          </label>
                          <textarea
                            value={q.explanation}
                            onChange={(e) =>
                              updateQuestion(
                                q.id,
                                "explanation",
                                e.target.value
                              )
                            }
                            placeholder="Explain why this is the correct answer..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="mt-6 flex justify-center">
                    <Button variant="secondary" onClick={addQuestion}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Question
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizPage;
