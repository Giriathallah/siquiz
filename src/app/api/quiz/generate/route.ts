import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import genAI from "@/lib/gemini";
import { Difficulty, QuestionType } from "@/generated/prisma";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

// Schema validasi untuk request body, kini dengan difficulty
const AIGenerateSchema = z.object({
  jumlahSoal: z.number().min(1).max(10).optional().default(4),
  topik: z.string().min(3).max(100),
  questionType: z.nativeEnum(QuestionType),
  difficulty: z.nativeEnum(Difficulty).optional().default("MEDIUM"),
});

// [HELPER] Fungsi untuk membuat prompt AI yang disesuaikan untuk Gemini
function getGeminiPrompt(
  type: QuestionType,
  topik: string,
  jumlahSoal: number,
  difficulty: Difficulty
): string {
  const system_prompt = `Tugas Anda adalah membuat ${jumlahSoal} soal kuis pendidikan dengan tingkat kesulitan "${difficulty}" tentang topik "${topik}". Jawab HANYA dengan format objek JSON yang valid dengan root key "questions". Patuhi semua batasan kata yang diberikan dalam struktur JSON.`;

  let format_structure: string;

  switch (type) {
    case "TRUE_FALSE":
      format_structure = `{
        "questions": [
          {
            "question": "sebuah pernyataan benar/salah tentang ${topik} ",
            "answer": "jawaban boolean (true atau false)",
            "explanation": "penjelasan singkat mengapa pernyataan itu benar atau salah ",
            "difficulty": "tingkat kesulitan soal (EASY, MEDIUM, atau HARD)"
          }
        ]
      }`;
      break;
    case "SHORT_ANSWER":
      format_structure = `{
        "questions": [
          {
            "question": "sebuah pertanyaan isian singkat tentang ${topik} ",
            "answer": "jawaban singkat dan akurat ",
            "explanation": "penjelasan singkat terkait jawaban ",
            "difficulty": "tingkat kesulitan soal (EASY, MEDIUM, atau HARD)"
          }
        ]
      }`;
      break;
    case "MULTIPLE_CHOICE":
    default:
      format_structure = `{
        "questions": [
          {
            "question": "sebuah pertanyaan pilihan ganda tentang ${topik} ",
            "options": [
              { "text": "teks opsi jawaban ", "isCorrect": false },
              { "text": "teks opsi jawaban ", "isCorrect": true },
              { "text": "teks opsi jawaban ", "isCorrect": false },
              { "text": "teks opsi jawaban ", "isCorrect": false }
            ],
            "explanation": "penjelasan singkat mengapa jawaban tersebut benar ",
            "difficulty": "tingkat kesulitan soal (EASY, MEDIUM, atau HARD)"
          }
        ]
      }`;
      break;
  }
  return `${system_prompt}\n\nStruktur JSON yang WAJIB diikuti:\n${format_structure}`;
}

// [HELPER] Skema Zod untuk memvalidasi respons dari AI
function getAIResponseSchema(type: QuestionType) {
  const baseQuestionSchema = z.object({
    question: z.string(),
    explanation: z.string().optional(),
  });

  let questionSchema;

  switch (type) {
    case "TRUE_FALSE":
      questionSchema = baseQuestionSchema.extend({
        answer: z.boolean(),
      });
      break;
    case "SHORT_ANSWER":
      questionSchema = baseQuestionSchema.extend({
        answer: z.string(),
      });
      break;
    case "MULTIPLE_CHOICE":
    default:
      questionSchema = baseQuestionSchema.extend({
        options: z
          .array(
            z.object({
              text: z.string(),
              isCorrect: z.boolean(),
            })
          )
          .min(2) // Lebih fleksibel, minimal 2 pilihan
          .max(5), // Maksimal 5 pilihan
      });
      break;
  }

  // Skema sekarang mengharapkan objek dengan key "questions" yang berisi array
  return z.object({
    questions: z.array(questionSchema),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = AIGenerateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Invalid request data", details: parseResult.error.errors },
        { status: 400 }
      );
    }
    const { topik, jumlahSoal, questionType, difficulty } = parseResult.data;

    // [GEMINI] Menyiapkan model dan konfigurasi
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" },
      safetySettings: [
        /* ... safety settings ... */
      ],
    });

    const prompt = getGeminiPrompt(questionType, topik, jumlahSoal, difficulty);
    const aiResponseSchema = getAIResponseSchema(questionType);

    // [GEMINI] Melakukan panggilan ke API
    const result = await model.generateContent(prompt);
    const content = result.response.text();

    if (!content) {
      return NextResponse.json(
        { message: "No content returned from Gemini API" },
        { status: 500 }
      );
    }

    // Validasi dan transformasi respons dari AI
    const parsedJson = JSON.parse(content);
    const validationAiResponse = aiResponseSchema.safeParse(parsedJson);

    if (!validationAiResponse.success) {
      console.error("Zod Validation Error:", validationAiResponse.error.errors);
      return NextResponse.json(
        {
          message: "Invalid structure from Gemini API response",
          details: validationAiResponse.error.errors,
        },
        { status: 500 }
      );
    }

    const aiQuestions = validationAiResponse.data.questions;

    // Transformasi data untuk dikirim ke front-end
    const transformedQuestions = aiQuestions.map((q: any) => {
      const baseData = {
        questionText: q.question,
        questionType: questionType,
        points: 10, // Default points
        explanation: q.explanation || "",
        correctAnswer: null, // Default
        sampleAnswer: "", // Default
        options: [], // Default
      };

      if (questionType === "MULTIPLE_CHOICE") {
        baseData.options = q.options.map(
          (opt: { text: string; isCorrect: boolean }) => ({
            optionText: opt.text,
            isCorrect: opt.isCorrect,
          })
        );
      } else if (questionType === "TRUE_FALSE") {
        baseData.correctAnswer = q.answer;
      } else if (questionType === "SHORT_ANSWER") {
        baseData.sampleAnswer = q.answer;
      }
      return baseData;
    });

    // Mengirim data yang sudah siap pakai ke front-end
    return NextResponse.json({
      title: `Kuis tentang ${topik}`,
      description: `Kuis yang dibuat oleh AI mengenai ${topik} dengan tingkat kesulitan ${difficulty}.`,
      difficulty: difficulty,
      questions: transformedQuestions,
    });
  } catch (err: any) {
    console.error("[AI_GENERATE_ERROR]", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request payload", details: err.errors },
        { status: 400 }
      );
    }
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        {
          message:
            "Failed to parse Gemini API response. It might not be valid JSON.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: err.message || "An internal server error occurred" },
      { status: 500 }
    );
  }
}
