import { GoogleGenerativeAI } from "@google/generative-ai";

// Pastikan Anda sudah mengatur GEMINI_API_KEY di file .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export default genAI;

// // lib/openai.ts

// import OpenAI from "openai";

// // Mengambil API key dari environment variable
// const apiKey = process.env.OPENAI_API_KEY;

// // Pengecekan penting: pastikan API key tersedia.
// // Jika tidak, tampilkan error yang jelas saat server berjalan.
// if (!apiKey) {
//   throw new Error(
//     "Missing OpenAI API key. Please add it to your .env.local file."
//   );
// }

// // Inisialisasi client OpenAI dengan API key
// export const openai = new OpenAI({
//   apiKey: apiKey,
// });
// // lib/openai.ts

// import OpenAI from "openai";

// // Mengambil API key dari environment variable
// const apiKey = process.env.OPENAI_API_KEY;

// // Pengecekan penting: pastikan API key tersedia.
// // Jika tidak, tampilkan error yang jelas saat server berjalan.
// if (!apiKey) {
//   throw new Error("Missing OpenAI API key. Please add it to your .env.local file.");
// }

// // Inisialisasi client OpenAI dengan API key
// export const openai = new OpenAI({
//   apiKey: apiKey,
// });
