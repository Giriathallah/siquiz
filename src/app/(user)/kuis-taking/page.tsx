"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

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

const QuizApp = () => {
  const [currentView, setCurrentView] = useState("quiz"); // 'quiz' or 'results'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(mockQuiz.duration * 60); // Convert to seconds
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Timer effect
  useEffect(() => {
    let timer;
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setQuizCompleted(true);
            setCurrentView("results");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < mockQuiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setQuizCompleted(true);
    setCurrentView("results");
  };

  const calculateResults = () => {
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    mockQuiz.questions.forEach((question) => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];

      if (
        question.questionType === "MULTIPLE_CHOICE" ||
        question.questionType === "TRUE_FALSE"
      ) {
        const correctOption = question.options.find((opt) => opt.isCorrect);
        if (userAnswer === correctOption?.id) {
          correctAnswers++;
          earnedPoints += question.points;
        }
      } else if (question.questionType === "SHORT_ANSWER") {
        // For demo purposes, assume short answers are correct if they contain "document object model"
        if (
          userAnswer &&
          userAnswer.toLowerCase().includes("document object model")
        ) {
          correctAnswers++;
          earnedPoints += question.points;
        }
      }
    });

    return {
      correctAnswers,
      totalQuestions: mockQuiz.questions.length,
      earnedPoints,
      totalPoints,
      percentage: Math.round((earnedPoints / totalPoints) * 100),
    };
  };

  const getDifficultyColor = (difficulty) => {
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

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (currentView === "results") {
    const results = calculateResults();

    return (
      <div className="min-h-screen bg-gradient-to-br from-page-gradient-start via-page-gradient-middle to-page-gradient-end">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-text-strong mb-2">
              Quiz Completed!
            </h1>
            <p className="text-text-subtle">Here's how you performed</p>
          </div>

          {/* Results Summary */}
          <Card className="mb-8 bg-surface-raised border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-text-strong">
                {mockQuiz.title}
              </CardTitle>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge className={getDifficultyColor(mockQuiz.difficulty)}>
                  {mockQuiz.difficulty}
                </Badge>
                <Badge variant="outline">{mockQuiz.category.name}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div
                    className={`text-4xl font-bold ${getScoreColor(
                      results.percentage
                    )} mb-2`}
                  >
                    {results.percentage}%
                  </div>
                  <p className="text-text-subtle">Final Score</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-text-strong mb-2">
                    {results.correctAnswers}/{results.totalQuestions}
                  </div>
                  <p className="text-text-subtle">Correct Answers</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-text-strong mb-2">
                    {results.earnedPoints}/{results.totalPoints}
                  </div>
                  <p className="text-text-subtle">Points Earned</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-text-strong mb-2">
                    {formatTime(mockQuiz.duration * 60 - timeLeft)}
                  </div>
                  <p className="text-text-subtle">Time Taken</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-subtle">Progress</span>
                  <span className="text-text-strong font-semibold">
                    {results.percentage}%
                  </span>
                </div>
                <Progress value={results.percentage} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Question Review */}
          <Card className="bg-surface-raised border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-text-strong">
                Question Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockQuiz.questions.map((question, index) => {
                const userAnswer = answers[question.id];
                let isCorrect = false;
                let correctAnswer = null;

                if (
                  question.questionType === "MULTIPLE_CHOICE" ||
                  question.questionType === "TRUE_FALSE"
                ) {
                  correctAnswer = question.options.find((opt) => opt.isCorrect);
                  isCorrect = userAnswer === correctAnswer?.id;
                } else if (question.questionType === "SHORT_ANSWER") {
                  isCorrect =
                    userAnswer &&
                    userAnswer.toLowerCase().includes("document object model");
                  correctAnswer = { optionText: "Document Object Model" };
                }

                return (
                  <div
                    key={question.id}
                    className="border rounded-lg p-4 bg-surface-sunken"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isCorrect
                            ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-text-strong mb-2">
                          Question {index + 1} ({question.points} pts)
                        </h4>
                        <p className="text-text-strong mb-3">
                          {question.questionText}
                        </p>

                        {question.questionType === "SHORT_ANSWER" ? (
                          <div className="space-y-2">
                            <div>
                              <span className="text-text-subtle">
                                Your answer:{" "}
                              </span>
                              <span className="text-text-strong">
                                {userAnswer || "No answer provided"}
                              </span>
                            </div>
                            <div>
                              <span className="text-text-subtle">
                                Correct answer:{" "}
                              </span>
                              <span className="text-green-600 dark:text-green-400">
                                {correctAnswer?.optionText}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {question.options.map((option) => {
                              const isSelected = userAnswer === option.id;
                              const isCorrectOption = option.isCorrect;

                              return (
                                <div
                                  key={option.id}
                                  className={`p-2 rounded border ${
                                    isCorrectOption
                                      ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800"
                                      : isSelected
                                      ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800"
                                      : "bg-surface-raised border-border"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {isCorrectOption && (
                                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    )}
                                    {isSelected && !isCorrectOption && (
                                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    )}
                                    <span
                                      className={`${
                                        isCorrectOption
                                          ? "text-green-700 dark:text-green-300 font-medium"
                                          : isSelected
                                          ? "text-red-700 dark:text-red-300"
                                          : "text-text-strong"
                                      }`}
                                    >
                                      {option.optionText}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {question.explanation && (
                          <div className="mt-3 p-3 bg-brand-subtle rounded-lg">
                            <p className="text-sm text-text-subtle">
                              <strong>Explanation:</strong>{" "}
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

          {/* Actions */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              onClick={() => {
                setCurrentView("quiz");
                setCurrentQuestion(0);
                setAnswers({});
                setTimeLeft(mockQuiz.duration * 60);
                setQuizStarted(false);
                setQuizCompleted(false);
              }}
              className="bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end text-white hover:opacity-90"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Taking Interface
  const currentQ = mockQuiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / mockQuiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-page-gradient-start via-page-gradient-middle to-page-gradient-end">
      <div className="container mx-auto px-4 py-8">
        {!quizStarted ? (
          // Quiz Start Screen
          <div className="max-w-2xl mx-auto">
            <Card className="bg-surface-raised border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-text-strong mb-4">
                  {mockQuiz.title}
                </CardTitle>
                <p className="text-text-subtle mb-4">{mockQuiz.description}</p>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Badge className={getDifficultyColor(mockQuiz.difficulty)}>
                    {mockQuiz.difficulty}
                  </Badge>
                  <Badge variant="outline">{mockQuiz.category.name}</Badge>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                  {mockQuiz.tags.map((tag) => (
                    <Badge
                      key={tag.name}
                      variant="secondary"
                      className="text-xs"
                    >
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
                      {mockQuiz.questions.length}
                    </div>
                    <div className="text-text-subtle text-sm">Questions</div>
                  </div>
                  <div className="p-4 bg-surface-sunken rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="w-5 h-5 text-brand" />
                    </div>
                    <div className="text-2xl font-bold text-text-strong">
                      {mockQuiz.duration}
                    </div>
                    <div className="text-text-subtle text-sm">Minutes</div>
                  </div>
                  <div className="p-4 bg-surface-sunken rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="w-5 h-5 text-brand" />
                    </div>
                    <div className="text-2xl font-bold text-text-strong">
                      {mockQuiz.questions.reduce((sum, q) => sum + q.points, 0)}
                    </div>
                    <div className="text-text-subtle text-sm">Points</div>
                  </div>
                </div>
                <div className="text-center pt-4">
                  <Button
                    onClick={() => setQuizStarted(true)}
                    className="bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end text-white hover:opacity-90 px-8 py-3"
                  >
                    Start Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Quiz Taking Interface
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-text-strong">
                  {mockQuiz.title}
                </h1>
                <p className="text-text-subtle">
                  Question {currentQuestion + 1} of {mockQuiz.questions.length}
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
                <Badge className={getDifficultyColor(mockQuiz.difficulty)}>
                  {mockQuiz.difficulty}
                </Badge>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-subtle">Progress</span>
                <span className="text-text-strong font-semibold">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Question Card */}
            <Card className="mb-6 bg-surface-raised border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-text-strong">
                    Question {currentQuestion + 1}
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
                      placeholder="Type your answer here..."
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
                          className="mr-3 text-brand"
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

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {mockQuiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                      index === currentQuestion
                        ? "bg-brand text-brand-foreground"
                        : answers[mockQuiz.questions[index].id]
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-surface-sunken text-text-subtle hover:bg-surface-raised"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {currentQuestion === mockQuiz.questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end text-white hover:opacity-90"
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end text-white hover:opacity-90"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizApp;
