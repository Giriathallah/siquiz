// app/api/quiz/generate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { openai } from "@/lib/openai";
import { QuestionType } from "@/generated/prisma";

const AIGenerateSchema = z.object({
  quizId: z.string().uuid(),
  jumlahSoal: z.number().min(1).max(10).optional().default(5),
  topik: z.string().min(3).max(100),
  questionType: z.nativeEnum(QuestionType),
});

// [HELPER] Fungsi untuk membuat prompt AI yang "ketat" dan dinamis
// [MODIFIED] Fungsi ini sekarang menerapkan teknik "pembatas kata"
function getAIPrompt(
  type: QuestionType,
  topik: string,
  jumlahSoal: number
): string {
  const system_prompt = `Anda adalah AI yang ahli dalam membuat soal kuis pendidikan. Buatlah ${jumlahSoal} soal tentang topik "${topik}". Format output harus berupa objek JSON dengan root key "questions". Patuhi semua batasan kata yang diberikan dalam struktur JSON.`;

  let format_structure: string;

  switch (type) {
    case "TRUE_FALSE":
      format_structure = `{
        "questions": [
          {
            "question": "sebuah pernyataan benar/salah tentang ${topik} (maksimal 30 kata)",
            "answer": "jawaban boolean (true atau false)",
            "explanation": "penjelasan singkat mengapa pernyataan itu benar atau salah (maksimal 20 kata)"
          }
        ]
      }`;
      break;
    case "SHORT_ANSWER":
      format_structure = `{
        "questions": [
          {
            "question": "sebuah pertanyaan isian singkat tentang ${topik} (maksimal 30 kata)",
            "answer": "jawaban singkat dan akurat (maksimal 10 kata)",
            "explanation": "penjelasan singkat terkait jawaban (maksimal 20 kata)"
          }
        ]
      }`;
      break;
    case "MULTIPLE_CHOICE":
    default:
      format_structure = `{
        "questions": [
          {
            "question": "sebuah pertanyaan pilihan ganda tentang ${topik} (maksimal 30 kata)",
            "options": [
              { "text": "teks opsi jawaban (maksimal 15 kata)", "isCorrect": false },
              { "text": "teks opsi jawaban (maksimal 15 kata)", "isCorrect": true },
              { "text": "teks opsi jawaban (maksimal 15 kata)", "isCorrect": false },
              { "text": "teks opsi jawaban (maksimal 15 kata)", "isCorrect": false }
            ],
            "explanation": "penjelasan singkat mengapa jawaban tersebut benar (maksimal 20 kata)"
          }
        ]
      }`;
      break;
  }
  return `${system_prompt}\n\nStruktur JSON yang WAJIB diikuti:\n${format_structure}`;
}

// [HELPER] Fungsi getAIResponseSchema (Tidak perlu diubah, karena hanya validasi struktur)
function getAIResponseSchema(type: QuestionType) {
  // ... (isi fungsi ini sama seperti sebelumnya)
  switch (type) {
    case "TRUE_FALSE":
      return z.array(
        z.object({
          question: z.string(),
          answer: z.boolean(),
          explanation: z.string().optional(),
        })
      );
    case "SHORT_ANSWER":
      return z.array(
        z.object({
          question: z.string(),
          answer: z.string(),
          explanation: z.string().optional(),
        })
      );
    case "MULTIPLE_CHOICE":
    default:
      return z.array(
        z.object({
          question: z.string(),
          options: z
            .array(
              z.object({
                text: z.string(),
                isCorrect: z.boolean(),
              })
            )
            .length(4),
          explanation: z.string().optional(),
        })
      );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = AIGenerateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parseResult.error.errors },
        { status: 400 }
      );
    }
    const { quizId, jumlahSoal, topik, questionType } = parseResult.data;

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const validationPrompt = `Apakah topik "${topik}" merupakan topik yang valid dan spesifik untuk dibuatkan soal kuis pendidikan? Jawab hanya dengan "YA" atau "TIDAK".`;
    const validationResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: validationPrompt }],
      temperature: 0,
      max_tokens: 5,
    });
    const validationResult = validationResponse.choices[0]?.message?.content;
    if (!validationResult || !validationResult.includes("YA")) {
      return NextResponse.json(
        { error: "Topik tidak valid atau terlalu umum." },
        { status: 400 }
      );
    }

    const prompt = getAIPrompt(questionType, topik, jumlahSoal);
    const AIResponseSchema = getAIResponseSchema(questionType);

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No content returned from OpenAI" },
        { status: 500 }
      );
    }

    const parsedJson = JSON.parse(content);
    const validationAiResponse = AIResponseSchema.safeParse(
      parsedJson.questions
    );

    if (!validationAiResponse.success) {
      return NextResponse.json(
        {
          error: "Invalid structure from OpenAI response",
          details: validationAiResponse.error.errors,
        },
        { status: 500 }
      );
    }
    const questionsData = validationAiResponse.data;

    // Logika penyimpanan ke DB (tidak berubah)
    const transactionPromises = questionsData.map((q: any) => {
      const commonData = {
        questionText: q.question,
        questionType: questionType,
        explanation: q.explanation,
        isAiGenerated: true,
        quizId: quizId,
      };

      switch (questionType) {
        case "SHORT_ANSWER":
          return prisma.question.create({
            data: { ...commonData, correctAnswerText: q.answer },
          });
        case "TRUE_FALSE":
          return prisma.question.create({
            data: {
              ...commonData,
              options: {
                create: [
                  { optionText: "Benar", isCorrect: q.answer === true },
                  { optionText: "Salah", isCorrect: q.answer === false },
                ],
              },
            },
          });
        case "MULTIPLE_CHOICE":
        default:
          return prisma.question.create({
            data: {
              ...commonData,
              options: {
                create: q.options.map(
                  (opt: { text: string; isCorrect: boolean }) => opt
                ),
              },
            },
          });
      }
    });

    const createdQuestions = await prisma.$transaction(transactionPromises);

    return NextResponse.json({
      message: `${createdQuestions.length} soal tipe ${questionType} berhasil dibuat!`,
      questions: createdQuestions,
    });
  } catch (err) {
    console.error("[AI_GENERATE_ERROR]", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request payload", details: err.errors },
        { status: 400 }
      );
    }
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse OpenAI response" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
