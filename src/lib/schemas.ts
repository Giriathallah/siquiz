import { z } from "zod";
import { Difficulty, QuestionType, QuizStatus } from "@/generated/prisma";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const signUpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const TagSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
});

const optionSchema = z.object({
  optionText: z.string().min(1, "Option text cannot be empty"),
  isCorrect: z.boolean(),
});

const questionSchema = z
  .object({
    questionText: z
      .string()
      .min(3, "Question text must be at least 3 characters"),
    questionType: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
    points: z.number().min(1, "Points must be at least 1"),
    explanation: z.string().optional(),
    options: z.array(optionSchema).optional(), // Hapus .min(2) dari sini
  })
  .superRefine((data, ctx) => {
    // Validasi kondisional untuk 'options'
    if (data.questionType === "MULTIPLE_CHOICE") {
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 2,
          type: "array",
          inclusive: true,
          message: "Multiple choice questions must have at least 2 options.",
          path: ["options"], // Menunjuk ke field 'options'
        });
      }
      // Pastikan ada satu jawaban yang benar untuk multiple choice
      if (data.options && !data.options.some((opt) => opt.isCorrect)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "One option must be marked as correct.",
          path: ["options"],
        });
      }
    }

    if (data.questionType === "TRUE_FALSE") {
      if (!data.options || data.options.length !== 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "True/False questions must have exactly 2 options (True and False).",
          path: ["options"],
        });
      }
    }

    if (data.questionType === "SHORT_ANSWER") {
      if (!data.options || data.options.length !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Short answer questions must have exactly 1 option as the sample answer.",
          path: ["options"],
        });
      }
    }
  });

export const quizCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  shuffleQuestions: z.boolean(),
  categoryId: z.string().nullable(),
  tags: z
    .array(z.object({ name: z.string().min(1, "Tag name cannot be empty") }))
    .optional(),
  questions: z.array(questionSchema).min(1, "At least 1 question is required"),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export type QuizCreateInput = z.infer<typeof quizCreateSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter")
      .max(255, "Password baru maksimal 255 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
