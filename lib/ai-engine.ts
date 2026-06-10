// Rule-based AI simulation engine for health analysis

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

// Health metric analysis
export function analyzeHealthMetrics(metrics: {
  heartRate?: number;
  systolic?: number;
  diastolic?: number;
  bloodSugar?: number;
  temperature?: number;
  steps?: number;
  weight?: number;
  height?: number;
}): HealthRecommendation[] {
  const recommendations: HealthRecommendation[] = [];

  if (metrics.heartRate) {
    if (metrics.heartRate > 100) {
      recommendations.push({
        title: 'Detak Jantung Tinggi',
        description: 'Detak jantung Anda di atas normal (>100 bpm). Istirahat yang cukup dan kurangi kafein.',
        priority: 'high',
        category: 'jantung',
        icon: '❤️'
      });
    } else if (metrics.heartRate < 60) {
      recommendations.push({
        title: 'Detak Jantung Rendah',
        description: 'Detak jantung Anda di bawah normal (<60 bpm). Konsultasikan dengan dokter jika disertai pusing.',
        priority: 'medium',
        category: 'jantung',
        icon: '❤️'
      });
    } else {
      recommendations.push({
        title: 'Detak Jantung Normal',
        description: 'Detak jantung Anda dalam rentang normal (60-100 bpm). Pertahankan gaya hidup sehat!',
        priority: 'low',
        category: 'jantung',
        icon: '💚'
      });
    }
  }

  if (metrics.systolic && metrics.diastolic) {
    if (metrics.systolic > 140 || metrics.diastolic > 90) {
      recommendations.push({
        title: 'Tekanan Darah Tinggi',
        description: 'Tekanan darah Anda tinggi. Kurangi garam, olahraga teratur, dan konsultasi dokter.',
        priority: 'high',
        category: 'tekanan-darah',
        icon: '🩸'
      });
    } else if (metrics.systolic < 90 || metrics.diastolic < 60) {
      recommendations.push({
        title: 'Tekanan Darah Rendah',
        description: 'Tekanan darah Anda rendah. Perbanyak minum air dan makan teratur.',
        priority: 'medium',
        category: 'tekanan-darah',
        icon: '🩸'
      });
    }
  }

  if (metrics.bloodSugar) {
    if (metrics.bloodSugar > 200) {
      recommendations.push({
        title: 'Gula Darah Sangat Tinggi',
        description: 'Kadar gula darah sangat tinggi. Segera konsultasikan ke dokter.',
        priority: 'high',
        category: 'gula-darah',
        icon: '🍬'
      });
    } else if (metrics.bloodSugar > 140) {
      recommendations.push({
        title: 'Gula Darah Tinggi',
        description: 'Kadar gula darah Anda di atas normal. Kurangi konsumsi gula dan karbohidrat.',
        priority: 'medium',
        category: 'gula-darah',
        icon: '🍬'
      });
    }
  }

  if (metrics.steps) {
    if (metrics.steps < 5000) {
      recommendations.push({
        title: 'Kurang Aktivitas Fisik',
        description: `Anda baru berjalan ${metrics.steps} langkah hari ini. Target minimal 8.000 langkah/hari.`,
        priority: 'medium',
        category: 'aktivitas',
        icon: '🚶'
      });
    } else if (metrics.steps >= 10000) {
      recommendations.push({
        title: 'Aktivitas Fisik Sangat Baik!',
        description: `Luar biasa! ${metrics.steps} langkah hari ini. Pertahankan semangat Anda!`,
        priority: 'low',
        category: 'aktivitas',
        icon: '🏃'
      });
    }
  }

  if (metrics.weight && metrics.height) {
    const heightM = metrics.height / 100;
    const bmi = metrics.weight / (heightM * heightM);
    if (bmi > 30) {
      recommendations.push({
        title: 'BMI: Obesitas',
        description: `BMI Anda ${bmi.toFixed(1)} (Obesitas). Konsultasikan program diet dan olahraga dengan dokter.`,
        priority: 'high',
        category: 'bmi',
        icon: '⚖️'
      });
    } else if (bmi > 25) {
      recommendations.push({
        title: 'BMI: Kelebihan Berat Badan',
        description: `BMI Anda ${bmi.toFixed(1)} (Overweight). Mulai program diet sehat dan olahraga teratur.`,
        priority: 'medium',
        category: 'bmi',
        icon: '⚖️'
      });
    } else if (bmi < 18.5) {
      recommendations.push({
        title: 'BMI: Berat Badan Kurang',
        description: `BMI Anda ${bmi.toFixed(1)} (Underweight). Perbanyak asupan nutrisi.`,
        priority: 'medium',
        category: 'bmi',
        icon: '⚖️'
      });
    }
  }

  return recommendations;
}

// Disease detection based on symptoms
const SYMPTOM_DATABASE: Record<string, { conditions: string[]; specialty: string }> = {
  'demam': { conditions: ['Infeksi Virus', 'Demam Berdarah', 'Tifus'], specialty: 'Dokter Umum' },
  'batuk': { conditions: ['ISPA', 'Bronkitis', 'Pneumonia'], specialty: 'Dokter Paru' },
  'sakit-kepala': { conditions: ['Migrain', 'Tension Headache', 'Sinusitis'], specialty: 'Dokter Saraf' },
  'nyeri-dada': { conditions: ['GERD', 'Angina', 'Serangan Jantung'], specialty: 'Dokter Jantung' },
  'sesak-napas': { conditions: ['Asma', 'Pneumonia', 'Gagal Jantung'], specialty: 'Dokter Paru' },
  'mual': { conditions: ['Gastritis', 'GERD', 'Keracunan Makanan'], specialty: 'Dokter Pencernaan' },
  'diare': { conditions: ['Gastroenteritis', 'Disentri', 'IBS'], specialty: 'Dokter Pencernaan' },
  'nyeri-sendi': { conditions: ['Arthritis', 'Asam Urat', 'Lupus'], specialty: 'Dokter Reumatologi' },
  'ruam-kulit': { conditions: ['Dermatitis', 'Alergi', 'Infeksi Jamur'], specialty: 'Dokter Kulit' },
  'pusing': { conditions: ['Vertigo', 'Anemia', 'Hipotensi'], specialty: 'Dokter Saraf' },
  'nyeri-perut': { conditions: ['Gastritis', 'Usus Buntu', 'Batu Ginjal'], specialty: 'Dokter Pencernaan' },
  'lemas': { conditions: ['Anemia', 'Hipoglikemia', 'Dehidrasi'], specialty: 'Dokter Umum' },
  'insomnia': { conditions: ['Gangguan Kecemasan', 'Depresi', 'Sleep Apnea'], specialty: 'Psikiater' },
  'nyeri-punggung': { conditions: ['HNP', 'Scoliosis', 'Muscle Strain'], specialty: 'Dokter Ortopedi' },
  'mata-merah': { conditions: ['Konjungtivitis', 'Iritasi Mata', 'Glaukoma'], specialty: 'Dokter Mata' },
};

export function detectDisease(symptoms: string[], description?: string): DiseaseDetectionResult {
  const allConditions: Map<string, number> = new Map();
  const specialties: string[] = [];

  symptoms.forEach(symptom => {
    const data = SYMPTOM_DATABASE[symptom];
    if (data) {
      data.conditions.forEach(condition => {
        allConditions.set(condition, (allConditions.get(condition) || 0) + 1);
      });
      if (!specialties.includes(data.specialty)) {
        specialties.push(data.specialty);
      }
    }
  });

  const sorted = Array.from(allConditions.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxScore = symptoms.length;
  const possibleConditions = sorted.map(([name, score]) => ({
    name,
    probability: score >= maxScore ? 'Tinggi' : score >= maxScore / 2 ? 'Sedang' : 'Rendah',
    description: `Terdeteksi berdasarkan ${score} dari ${symptoms.length} gejala yang dilaporkan.`
  }));

  let riskLevel: 'rendah' | 'sedang' | 'tinggi' = 'rendah';
  const dangerousSymptoms = ['nyeri-dada', 'sesak-napas'];
  if (symptoms.some(s => dangerousSymptoms.includes(s))) {
    riskLevel = 'tinggi';
  } else if (symptoms.length >= 3) {
    riskLevel = 'sedang';
  }

  const recommendations: string[] = [
    'Segera konsultasikan dengan dokter untuk diagnosis yang akurat',
    'Jangan melakukan self-medication tanpa resep dokter',
  ];

  if (riskLevel === 'tinggi') {
    recommendations.unshift('⚠️ SEGERA ke IGD atau hubungi layanan darurat!');
  }

  return {
    possibleConditions,
    riskLevel,
    recommendations,
    suggestedSpecialty: specialties[0] || 'Dokter Umum'
  };
}

// Mental health assessment (simplified PHQ-9)
export function assessMentalHealth(answers: number[]): MentalHealthResult {
  const totalScore = answers.reduce((sum, val) => sum + val, 0);

  let riskLevel: 'normal' | 'ringan' | 'sedang' | 'berat';
  let interpretation: string;
  const recommendations: string[] = [];

  if (totalScore <= 4) {
    riskLevel = 'normal';
    interpretation = 'Kondisi kesehatan mental Anda dalam keadaan baik.';
    recommendations.push(
      'Pertahankan pola hidup sehat dan aktivitas positif',
      'Tetap jaga komunikasi dengan orang terdekat',
      'Lakukan aktivitas relaksasi secara rutin'
    );
  } else if (totalScore <= 9) {
    riskLevel = 'ringan';
    interpretation = 'Terdapat gejala ringan yang perlu diperhatikan.';
    recommendations.push(
      'Cobalah teknik relaksasi seperti meditasi atau yoga',
      'Bicarakan perasaan Anda dengan orang yang dipercaya',
      'Jaga pola tidur dan makan yang teratur',
      'Pertimbangkan untuk berkonsultasi dengan psikolog'
    );
  } else if (totalScore <= 14) {
    riskLevel = 'sedang';
    interpretation = 'Terdapat gejala sedang yang memerlukan perhatian profesional.';
    recommendations.push(
      'Segera konsultasikan dengan psikolog atau psikiater',
      'Jangan ragu untuk meminta bantuan profesional',
      'Hindari isolasi sosial',
      'Lakukan aktivitas fisik ringan secara teratur'
    );
  } else {
    riskLevel = 'berat';
    interpretation = 'Kondisi ini memerlukan penanganan profesional segera.';
    recommendations.push(
      '⚠️ Segera hubungi psikiater atau layanan kesehatan mental',
      'Jangan menghadapi ini sendirian',
      'Hubungi hotline kesehatan mental: 119 ext 8',
      'Minta pendampingan dari keluarga atau orang terdekat'
    );
  }

  return { score: totalScore, riskLevel, interpretation, recommendations };
}

// Daily health tips
export function getDailyHealthTip(): { title: string; tip: string; icon: string } {
  const tips = [
    { title: 'Hidrasi', tip: 'Minum minimal 8 gelas air putih per hari untuk menjaga tubuh tetap terhidrasi.', icon: '💧' },
    { title: 'Olahraga', tip: 'Lakukan olahraga ringan 30 menit setiap hari. Jalan kaki pun sudah cukup!', icon: '🏃' },
    { title: 'Tidur', tip: 'Tidur 7-8 jam setiap malam. Hindari gadget 1 jam sebelum tidur.', icon: '😴' },
    { title: 'Nutrisi', tip: 'Konsumsi 5 porsi buah dan sayur setiap hari untuk kebutuhan vitamin.', icon: '🥗' },
    { title: 'Mental', tip: 'Luangkan 10 menit untuk meditasi atau relaksasi setiap hari.', icon: '🧘' },
    { title: 'Postur', tip: 'Periksa postur tubuh Anda. Duduk tegak dan stretch setiap 1 jam.', icon: '🧍' },
    { title: 'Mata', tip: 'Terapkan aturan 20-20-20: setiap 20 menit, lihat objek 20 kaki jauhnya selama 20 detik.', icon: '👁️' },
    { title: 'Sosial', tip: 'Jaga hubungan sosial yang positif. Interaksi sosial baik untuk kesehatan mental.', icon: '🤝' },
    { title: 'Cuci Tangan', tip: 'Cuci tangan dengan sabun minimal 20 detik sebelum makan dan setelah aktivitas.', icon: '🧼' },
    { title: 'Sinar Matahari', tip: 'Dapatkan paparan sinar matahari pagi 15-20 menit untuk vitamin D.', icon: '☀️' },
  ];
  const index = new Date().getDate() % tips.length;
  return tips[index];
}
