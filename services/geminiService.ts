import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { AnalysisResult, ChatMessage } from '../types';
import { Sender } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

const createAnalysisPrompt = (userComment: string): string => {
  let prompt = `
    Anda adalah seorang ahli agronomi kelapa sawit. Analisis gambar Tandan Buah Segar (TBS) kelapa sawit ini secara mendetail.
    Fokus secara eksklusif pada TBS kelapa sawit. Jika gambar yang diunggah bukan TBS kelapa sawit, tolak analisis.
    
    PENTING: Jika gambar yang diunggah BUKAN Tandan Buah Segar kelapa sawit, seluruh nilai dalam JSON harus berisi pesan penolakan yang sopan ini: 'Gambar yang diunggah tampaknya bukan Tandan Buah Segar kelapa sawit. Mohon unggah gambar yang sesuai.'
  `;

  if (userComment && userComment.trim() !== '') {
    prompt += `\n\nPENTING: Pengguna memberikan komentar atau pertanyaan tambahan. Pertimbangkan ini dalam analisis Anda: "${userComment}". Pastikan jawaban atas pertanyaan pengguna terintegrasi secara alami ke dalam bidang JSON yang relevan.`;
  }
  
  return prompt;
};

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
      quality: {
        type: Type.STRING,
        description: 'Deskripsi detail tentang kualitas TBS, termasuk fraksi kematangan (jumlah buah yang lepas/memberondol), warna buah (dari hitam ke oranye kemerahan), dan adanya tanda-tanda kerusakan atau buah abnormal.',
      },
      rot_potential: {
        type: Type.STRING,
        description: "Penilaian potensi busuk (misalnya, 'Rendah', 'Sedang', 'Tinggi') dan jelaskan alasannya berdasarkan memar, jamur, serangan hama, atau tandan yang terlalu matang.",
      },
      harvest_estimation: {
        type: Type.STRING,
        description: 'Tingkat kematangan TBS dan apakah siap panen. Gunakan standar industri kelapa sawit (misalnya, Fraksi 00, Fraksi 0, Fraksi 1, hingga Fraksi 5). Berikan rekomendasi waktu panen jika belum matang atau jika sudah terlalu matang.',
      },
      conclusion: {
        type: Type.STRING,
        description: 'Kesimpulan ringkas dan rekomendasi utama dalam satu atau dua kalimat.',
      },
    },
};

export const analyzeFruitImage = async (base64Image: string, userComment: string): Promise<AnalysisResult> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };
    
    const textPart = {
      text: createAnalysisPrompt(userComment)
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
      },
    });

    const jsonStr = response.text.trim();
    const parsedData = JSON.parse(jsonStr) as AnalysisResult;
    
    if (!parsedData.quality || !parsedData.rot_potential || !parsedData.harvest_estimation || !parsedData.conclusion) {
        throw new Error("Respons API tidak memiliki format yang diharapkan.");
    }
    
    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gagal menganalisis gambar: ${error.message}`);
    }
    throw new Error("Terjadi kesalahan yang tidak diketahui saat menghubungi layanan analisis.");
  }
};

export const generateChatResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  const systemInstruction = `Anda adalah "Asisten Sawit", sebuah AI yang ramah dan sangat berpengetahuan yang berspesialisasi dalam budidaya dan agronomi kelapa sawit. Misi Anda adalah memberikan saran yang akurat, praktis, dan mudah dipahami kepada petani kelapa sawit. Jawab pertanyaan HANYA tentang:
- Pemilihan bibit unggul kelapa sawit.
- Kesehatan tanah dan pemupukan khusus kelapa sawit.
- Jadwal tanam dan manajemen panen TBS.
- Pengendalian hama dan penyakit (misalnya Ganoderma, ulat api).
- Praktik agronomi yang baik (Good Agricultural Practices - GAP) untuk sawit.
- Masalah umum terkait budidaya kelapa sawit.

Selalu berikan jawaban dalam format yang jelas dan terstruktur. Gunakan markdown (seperti daftar berpoin atau tebal) untuk meningkatkan keterbacaan bila perlu. Jika pengguna bertanya tentang topik di luar kelapa sawit, tolak dengan sopan dan nyatakan bahwa Anda hanya dapat membantu dengan pertanyaan terkait kelapa sawit. Jika Anda tidak tahu jawabannya, katakan terus terang daripada memberikan informasi yang salah.`;

  const contents = history
    .filter(msg => msg.text && !msg.analysis && !msg.isLoading && !msg.error)
    .map(msg => ({
      role: msg.sender === Sender.USER ? 'user' : 'model',
      parts: [{ text: msg.text as string }],
    }));
  
  contents.push({
    role: 'user',
    parts: [{ text: newMessage }]
  });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for chat:", error);
    if (error instanceof Error) {
        throw new Error(`Gagal mendapatkan respons chatbot: ${error.message}`);
    }
    throw new Error("Terjadi kesalahan yang tidak diketahui saat menghubungi layanan chatbot.");
  }
};