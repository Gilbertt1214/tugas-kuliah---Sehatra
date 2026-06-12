export interface HealthRecommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  icon: string;
}

export interface DiseaseDetectionResult {
  possibleConditions: Array<{
    name: string;
    probability: string;
    description: string;
  }>;
  riskLevel: 'rendah' | 'sedang' | 'tinggi';
  recommendations: string[];
  suggestedSpecialty: string;
}

export interface MentalHealthResult {
  score: number;
  riskLevel: 'normal' | 'ringan' | 'sedang' | 'berat';
  interpretation: string;
  recommendations: string[];
}

/**
 * Universal Raw Fetch Helper for Qwen/MuleRouter
 * Bypasses all SDK compatibility issues by using direct HTTP requests.
 */
async function fetchQwen(systemPrompt: string, userPrompt: string): Promise<any> {
  const apiKey = process.env.QWEN_API_KEY || process.env.OPENAI_API_KEY || '';
  const baseUrl = process.env.QWEN_BASE_URL || 'https://api.mulerouter.ai/vendors/openai/v1';

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen3.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        chat_type: 'text',
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    // Qwen menyimpan jawaban di 'content', proses berpikir di 'reasoning_content'
    const textContent = message?.content || '';
    
    // Parse JSON dari content
    const cleaned = textContent.trim()
      .replace(/^```json\s*/, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '');
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Qwen API Error:', error);
    throw error;
  }
}

// 1. Health metric analysis (Now Powered by Qwen AI)
export async function analyzeHealthMetrics(metrics: {
  heartRate?: number;
  systolic?: number;
  diastolic?: number;
  bloodSugar?: number;
  temperature?: number;
  steps?: number;
  weight?: number;
  height?: number;
}): Promise<HealthRecommendation[]> {
  const systemPrompt = "Kamu adalah Asisten Medis AI profesional dari Sehatra. Kamu menganalisis data metrik kesehatan pengguna. Berikan saran pencegahan, prioritas, dan ikon yang relevan. Format HANYA array JSON objek dengan key: title (string), description (string, bahasa empati), priority ('low'|'medium'|'high'), category (string), icon (emoji string).";
  const userPrompt = `Tolong analisis metrik kesehatan berikut dan berikan rekomendasi JSON array murni:\n${JSON.stringify(metrics, null, 2)}`;
  
  try {
    const result = await fetchQwen(systemPrompt, userPrompt);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    return [{
      title: 'Tidak dapat menganalisis metrik',
      description: 'Terjadi kesalahan saat meminta saran kesehatan dari AI. Harap konsultasikan ke dokter.',
      priority: 'medium',
      category: 'error',
      icon: '⚠️'
    }];
  }
}

// 2. Disease detection based on symptoms (Powered by Qwen AI)
export async function detectDisease(symptoms: string[], description?: string): Promise<DiseaseDetectionResult> {
  const systemPrompt = "Kamu adalah Asisten Medis AI profesional. Analisis gejala dengan hati-hati. Ingat bahwa kamu tidak menggantikan dokter sungguhan. HANYA balas dengan objek JSON murni tanpa markdown/backticks.";
  const userPrompt = `
    Pengguna mengeluhkan gejala berikut: ${symptoms.join(', ')}.
    Penjelasan tambahan: ${description || 'Tidak ada penjelasan tambahan.'}
    
    Tolong analisis gejala ini. Balas HANYA dengan objek JSON murni yang berisi key: 
    possibleConditions (array of {name: string, probability: string, description: string}), 
    riskLevel (string: 'rendah'|'sedang'|'tinggi'), 
    recommendations (array of string), 
    dan suggestedSpecialty (string).
  `;

  try {
    const result = await fetchQwen(systemPrompt, userPrompt);
    
    // Normalisasi properti dari snake_case ke camelCase
    const normalized: DiseaseDetectionResult = {
      possibleConditions: result.possibleConditions || result.possible_conditions || [],
      riskLevel: result.riskLevel || result.risk_level || 'rendah',
      recommendations: result.recommendations || result.recommendation || [],
      suggestedSpecialty: result.suggestedSpecialty || result.suggested_specialty || 'Dokter Umum'
    };
    
    return normalized;
  } catch (error) {
    return {
      possibleConditions: [{
        name: 'Tidak dapat dianalisis',
        probability: 'Rendah',
        description: `Terjadi kesalahan API Mentah: ${error instanceof Error ? error.message : String(error)}`
      }],
      riskLevel: 'rendah',
      recommendations: ['Silakan coba lagi nanti atau konsultasikan langsung ke dokter.'],
      suggestedSpecialty: 'Dokter Umum'
    };
  }
}

// 3. Mental health assessment (PHQ-9 + Qwen AI interpretation)
export async function assessMentalHealth(answers: number[]): Promise<MentalHealthResult> {
  const totalScore = answers.reduce((sum, val) => sum + val, 0);
  
  const systemPrompt = "Kamu adalah Psikolog AI profesional dari Sehatra. Kamu menganalisis skor kuisioner depresi PHQ-9. HANYA balas dengan objek JSON murni tanpa backticks/markdown.";
  const userPrompt = `
    Pengguna baru saja mengisi kuisioner mental dengan skor total PHQ-9: ${totalScore} (skor maksimal 27).
    Rentang skor: 0-4 (Normal), 5-9 (Ringan), 10-14 (Sedang), 15-27 (Berat).
    
    Berikan interpretasi klinis dan saran tindakan dengan gaya bahasa yang penuh empati dan suportif.
    Balas HANYA dengan objek JSON berisi:
    riskLevel (string: 'normal'|'ringan'|'sedang'|'berat'),
    interpretation (string),
    recommendations (array of string, minimal 3 saran suportif)
  `;

  try {
    const result = await fetchQwen(systemPrompt, userPrompt);
    return {
      score: totalScore,
      riskLevel: result.riskLevel || 'normal',
      interpretation: result.interpretation || 'Kondisi Anda telah dicatat.',
      recommendations: result.recommendations || ['Tetap semangat dan jaga kesehatan.']
    };
  } catch (error) {
    // Fallback if AI fails so the log is not broken
    return {
      score: totalScore,
      riskLevel: totalScore > 14 ? 'berat' : totalScore > 9 ? 'sedang' : totalScore > 4 ? 'ringan' : 'normal',
      interpretation: 'Skor Anda telah dicatat, namun interpretasi AI sedang mengalami gangguan koneksi.',
      recommendations: ['Harap jaga kesehatan mental Anda dan coba muat ulang AI nanti.']
    };
  }
}

// 4. Daily health tips (Powered by Qwen AI)
export async function getDailyHealthTip(): Promise<{ title: string; tip: string; icon: string }> {
  const systemPrompt = "Kamu adalah Asisten Medis AI profesional dari Sehatra. HANYA balas dengan objek JSON murni.";
  const userPrompt = `
    Berikan 1 tips kesehatan harian yang menarik, praktis, dan informatif. 
    Balas HANYA dengan JSON objek berisi key: title (string pendek), tip (string deskripsi 2 kalimat), icon (satu emoji string).
  `;

  try {
    const result = await fetchQwen(systemPrompt, userPrompt);
    return {
      title: result.title || 'Kesehatan Harian',
      tip: result.tip || 'Tetap jaga kesehatan Anda dengan pola hidup sehat.',
      icon: result.icon || '💚'
    };
  } catch (error) {
    return { title: 'Tips Hari Ini', tip: 'Minum air putih yang cukup dan tetap aktif secara fisik!', icon: '💧' };
  }
}
