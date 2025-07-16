"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Home,
  Trophy,
  Target,
  Calendar,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";

// Mock data sesuai dengan Prisma schema
const mockQuiz = {
  id: "quiz-1",
  title: "JavaScript Fundamentals",
  description: "Test your knowledge of JavaScript basics",
  duration: 30,
  difficulty: "MEDIUM",
  category: { name: "Programming" },
  tags: [{ name: "JavaScript" }, { name: "Frontend" }],
  questions: [
    {
      id: "q1",
      questionText:
        "What is the correct way to declare a variable in JavaScript?",
      questionType: "MULTIPLE_CHOICE",
      points: 1,
      explanation:
        "The 'let' keyword is the modern way to declare variables in JavaScript, providing block scope.",
      options: [
        { id: "opt1", optionText: "var myVar = 5;", isCorrect: false },
        { id: "opt2", optionText: "let myVar = 5;", isCorrect: true },
        { id: "opt3", optionText: "variable myVar = 5;", isCorrect: false },
        { id: "opt4", optionText: "declare myVar = 5;", isCorrect: false },
      ],
    },
    {
      id: "q2",
      questionText: "JavaScript is a compiled language.",
      questionType: "TRUE_FALSE",
      points: 1,
      explanation:
        "JavaScript is an interpreted language, not a compiled language. It's executed line by line at runtime.",
      options: [
        { id: "opt5", optionText: "True", isCorrect: false },
        { id: "opt6", optionText: "False", isCorrect: true },
      ],
    },
    {
      id: "q3",
      questionText: "What does DOM stand for?",
      questionType: "SHORT_ANSWER",
      points: 2,
      explanation:
        "DOM stands for Document Object Model, which is a programming interface for web documents.",
    },
    {
      id: "q4",
      questionText:
        "Which method is used to add an element to the end of an array?",
      questionType: "MULTIPLE_CHOICE",
      points: 1,
      explanation:
        "The push() method adds one or more elements to the end of an array and returns the new length.",
      options: [
        { id: "opt7", optionText: "push()", isCorrect: true },
        { id: "opt8", optionText: "pop()", isCorrect: false },
        { id: "opt9", optionText: "shift()", isCorrect: false },
        { id: "opt10", optionText: "unshift()", isCorrect: false },
      ],
    },
    {
      id: "q5",
      questionText: "What is the output of: console.log(typeof null)?",
      questionType: "MULTIPLE_CHOICE",
      points: 2,
      explanation:
        "This is a known quirk in JavaScript. typeof null returns 'object', which is considered a bug in the language but is maintained for backward compatibility.",
      options: [
        { id: "opt11", optionText: "'null'", isCorrect: false },
        { id: "opt12", optionText: "'undefined'", isCorrect: false },
        { id: "opt13", optionText: "'object'", isCorrect: true },
        { id: "opt14", optionText: "'boolean'", isCorrect: false },
      ],
    },
  ],
};

// Data kuis yang aman untuk dikirim ke client (tanpa jawaban)
interface QuizForTaking {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: { name: string };
  tags: { name: string }[];
  questions: {
    id: string;
    questionText: string;
    questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
    points: number;
    options: {
      id: string;
      optionText: string;
    }[];
  }[];
}

// Data hasil setelah submit (termasuk jawaban benar)
interface AttemptResult {
  id: string;
  score: number;
  status: "COMPLETED";
  quiz: {
    title: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    category: { name: string };
    questions: {
      id: string;
      questionText: string;
      questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
      points: number;
      explanation: string | null;
      options: {
        id: string;
        optionText: string;
        isCorrect: boolean; // Jawaban benar sekarang disertakan
      }[];
    }[];
  };
  answers: {
    questionId: string;
    selectedOptionId: string | null;
    shortAnswer: string | null;
    isCorrect: boolean;
  }[];
  startedAt: string;
  completedAt: string;
}

const fetchQuizForTaking = async (quizId: string): Promise<QuizForTaking> => {
  const response = await fetch(`/api/quiz/${quizId}/take`);
  if (!response.ok) {
    throw new Error("Failed to fetch quiz data.");
  }
  return response.json();
};

const startQuizAttempt = async (
  quizId: string
): Promise<{ attemptId: string }> => {
  const response = await fetch(`/api/quiz/${quizId}/start`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to start quiz attempt.");
  }
  return response.json();
};

const submitQuizAttempt = async (
  attemptId: string,
  answers: Record<string, string>
): Promise<AttemptResult> => {
  const response = await fetch(`/api/attempt/${attemptId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (!response.ok) {
    throw new Error("Failed to submit quiz attempt.");
  }
  return response.json();
};

export default function TakeQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id;

  // State untuk alur & data
  const [status, setStatus] = useState<"loading" | "error" | "idle">("loading");
  const [quizData, setQuizData] = useState<QuizForTaking | null>(null);
  const [resultsData, setResultsData] = useState<AttemptResult | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // State untuk UI pengerjaan kuis
  const [currentView, setCurrentView] = useState("start"); // 'start', 'quiz', 'results'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  const loadQuiz = useCallback(async () => {
    try {
      setStatus("loading");
      const data = await fetchQuizForTaking(quizId);
      setQuizData(data);
      setTimeLeft(data.duration * 60);
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }, [quizId]);

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId, loadQuiz]);

  const handleStartQuiz = async () => {
    if (!quizId) return;
    setStatus("loading");
    try {
      const { attemptId } = await startQuizAttempt(quizId);
      setAttemptId(attemptId);
      setCurrentView("quiz");
    } catch (error) {
      console.error(error);
      alert("Gagal memulai kuis. Silakan coba lagi.");
    } finally {
      setStatus("idle");
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!attemptId) return;
    setStatus("loading");
    try {
      const results = await submitQuizAttempt(attemptId, answers);
      setResultsData(results);
      setCurrentView("results");
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim jawaban. Silakan coba lagi.");
    } finally {
      setStatus("idle");
    }
  }, [attemptId, answers]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentView === "quiz" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentView, timeLeft, handleSubmit]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleRetake = () => {
    setResultsData(null);
    setAttemptId(null);
    setCurrentView("start");
    setCurrentQuestion(0);
    setAnswers({});
    if (quizData) {
      setTimeLeft(quizData.duration * 60);
    }
  };

  // Helper functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };
  const getDifficultyColor = (difficulty: string) => {
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
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  // --- RENDER LOGIC ---
  if (status === "loading" && !quizData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-brand" />
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-500">
        <AlertTriangle className="w-12 h-12 mb-4" /> Gagal memuat data kuis.
      </div>
    );
  }
  if (!quizData) return null;

  // --- RESULTS VIEW ---
  if (currentView === "results" && resultsData) {
    const correctAnswersCount = resultsData.answers.filter(
      (a) => a.isCorrect
    ).length;
    const totalQuestions = resultsData.quiz.questions.length;
    const earnedPoints = resultsData.quiz.questions.reduce((sum, q) => {
      const userAnswer = resultsData.answers.find((a) => a.questionId === q.id);
      return userAnswer && userAnswer.isCorrect ? sum + q.points : sum;
    }, 0);
    const totalPoints = resultsData.quiz.questions.reduce(
      (sum, q) => sum + q.points,
      0
    );
    const timeTaken =
      new Date(resultsData.completedAt).getTime() -
      new Date(resultsData.startedAt).getTime();

    return (
      <div className="min-h-screen bg-gradient-to-br from-page-gradient-start via-page-gradient-middle to-page-gradient-end">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-text-strong mb-2">
              Quiz Selesai!
            </h1>
            <p className="text-text-subtle">
              Berikut adalah hasil performa Anda
            </p>
          </div>
          <Card className="mb-8 bg-surface-raised border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-text-strong">
                {resultsData.quiz.title}
              </CardTitle>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge
                  className={getDifficultyColor(resultsData.quiz.difficulty)}
                >
                  {resultsData.quiz.difficulty}
                </Badge>
                {resultsData.quiz.category && (
                  <Badge variant="outline">
                    {resultsData.quiz.category.name}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div
                    className={`text-4xl font-bold ${getScoreColor(
                      resultsData.score
                    )} mb-2`}
                  >
                    {Math.round(resultsData.score)}%
                  </div>
                  <p className="text-text-subtle">Skor Akhir</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-text-strong mb-2">
                    {correctAnswersCount}/{totalQuestions}
                  </div>
                  <p className="text-text-subtle">Jawaban Benar</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-text-strong mb-2">
                    {earnedPoints}/{totalPoints}
                  </div>
                  <p className="text-text-subtle">Poin Didapat</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-text-strong mb-2">
                    {formatTime(Math.round(timeTaken / 1000))}
                  </div>
                  <p className="text-text-subtle">Waktu</p>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-subtle">Progress</span>
                  <span className="text-text-strong font-semibold">
                    {Math.round(resultsData.score)}%
                  </span>
                </div>
                <Progress value={resultsData.score} className="h-3" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-surface-raised border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-text-strong">
                Ulasan Pertanyaan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {resultsData.quiz.questions.map((question, index) => {
                const userAnswer = resultsData.answers.find(
                  (a) => a.questionId === question.id
                );
                const isUserCorrect = userAnswer?.isCorrect ?? false;
                return (
                  <div
                    key={question.id}
                    className="border rounded-lg p-4 bg-surface-sunken"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isUserCorrect
                            ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {isUserCorrect ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-text-strong mb-2">
                          Pertanyaan {index + 1} ({question.points} pts)
                        </h4>
                        <p className="text-text-strong mb-3">
                          {question.questionText}
                        </p>
                        {question.questionType === "SHORT_ANSWER" ? (
                          <div></div>
                        ) : (
                          <div className="space-y-2">
                            {question.options.map((option) => (
                              <div
                                key={option.id}
                                className={`p-2 rounded border ${
                                  option.isCorrect
                                    ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800"
                                    : userAnswer?.selectedOptionId === option.id
                                    ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800"
                                    : "bg-surface-raised border-border"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {option.isCorrect && (
                                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  )}
                                  {userAnswer?.selectedOptionId === option.id &&
                                    !option.isCorrect && (
                                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    )}
                                  <span
                                    className={`${
                                      option.isCorrect
                                        ? "text-green-700 dark:text-green-300 font-medium"
                                        : userAnswer?.selectedOptionId ===
                                          option.id
                                        ? "text-red-700 dark:text-red-300"
                                        : "text-text-strong"
                                    }`}
                                  >
                                    {option.optionText}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {question.explanation && (
                          <div className="mt-3 p-3 bg-brand-subtle rounded-lg">
                            <p className="text-sm text-text-subtle">
                              <strong>Penjelasan:</strong>{" "}
                              {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <div className="flex justify-center gap-4 mt-8">
            <Button
              onClick={handleRetake}
              className="bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end text-white hover:opacity-90"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Ulangi Kuis
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              <Home className="w-4 h-4 mr-2" /> Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- QUIZ TAKING VIEW ---
  if (currentView === "quiz") {
    const currentQ = quizData.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;
    return (
      <div className="min-h-screen bg-gradient-to-br from-page-gradient-start via-page-gradient-middle to-page-gradient-end">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-text-strong">
                  {quizData.title}
                </h1>
                <p className="text-text-subtle">
                  Pertanyaan {currentQuestion + 1} dari{" "}
                  {quizData.questions.length}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-text-strong">
                  <Clock className="w-4 h-4" />
                  <span
                    className={`font-mono ${
                      timeLeft < 300 ? "text-red-600 dark:text-red-400" : ""
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <Badge className={getDifficultyColor(quizData.difficulty)}>
                  {quizData.difficulty}
                </Badge>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-subtle">Progress</span>
                <span className="text-text-strong font-semibold">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <Card className="mb-6 bg-surface-raised border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-text-strong">
                    Pertanyaan {currentQuestion + 1}
                  </CardTitle>
                  <Badge variant="outline">{currentQ.points} pts</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-text-strong mb-6">
                  {currentQ.questionText}
                </p>
                {currentQ.questionType === "SHORT_ANSWER" ? (
                  <div>
                    <textarea
                      value={answers[currentQ.id] || ""}
                      onChange={(e) =>
                        handleAnswer(currentQ.id, e.target.value)
                      }
                      placeholder="Ketik jawabanmu..."
                      className="w-full p-3 border rounded-lg bg-surface-raised text-text-strong placeholder-text-subtle resize-none"
                      rows={4}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentQ.options.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:bg-surface-sunken ${
                          answers[currentQ.id] === option.id
                            ? "border-brand bg-brand-subtle"
                            : "border-border bg-surface-raised"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQ.id}`}
                          value={option.id}
                          checked={answers[currentQ.id] === option.id}
                          onChange={() => handleAnswer(currentQ.id, option.id)}
                          className="mr-3 text-brand focus:ring-brand"
                        />
                        <span className="text-text-strong">
                          {option.optionText}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion((p) => p - 1)}
                disabled={currentQuestion === 0}
              >
                Sebelumnya
              </Button>
              <div className="flex gap-2 flex-wrap justify-center">
                {quizData.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                      index === currentQuestion
                        ? "bg-brand text-brand-foreground"
                        : answers[quizData.questions[index].id]
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-surface-sunken text-text-subtle hover:bg-surface-raised"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              {currentQuestion === quizData.questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                  className="bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end text-white hover:opacity-90"
                >
                  {status === "loading" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}{" "}
                  Kirim Jawaban
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion((p) => p + 1)}
                  className="bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end text-white hover:opacity-90"
                >
                  Selanjutnya
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- START SCREEN VIEW ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-page-gradient-start via-page-gradient-middle to-page-gradient-end">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-surface-raised border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-text-strong mb-4">
                {quizData.title}
              </CardTitle>
              <p className="text-text-subtle mb-4">{quizData.description}</p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <Badge className={getDifficultyColor(quizData.difficulty)}>
                  {quizData.difficulty}
                </Badge>
                {quizData.category && (
                  <Badge variant="outline">{quizData.category.name}</Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                {quizData.tags.map((tag) => (
                  <Badge key={tag.name} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="w-5 h-5 text-brand" />
                  </div>
                  <div className="text-2xl font-bold text-text-strong">
                    {quizData.questions.length}
                  </div>
                  <div className="text-text-subtle text-sm">Pertanyaan</div>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-brand" />
                  </div>
                  <div className="text-2xl font-bold text-text-strong">
                    {quizData.duration}
                  </div>
                  <div className="text-text-subtle text-sm">Menit</div>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Trophy className="w-5 h-5 text-brand" />
                  </div>
                  <div className="text-2xl font-bold text-text-strong">
                    {quizData.questions.reduce((sum, q) => sum + q.points, 0)}
                  </div>
                  <div className="text-text-subtle text-sm">Poin</div>
                </div>
              </div>
              <div className="text-center pt-4">
                <Button
                  onClick={handleStartQuiz}
                  disabled={status === "loading"}
                  className="bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end text-white hover:opacity-90 px-8 py-3"
                >
                  {status === "loading" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Mulai Kuis"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
