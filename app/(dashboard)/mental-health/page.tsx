'use client';

import { useState, useEffect } from 'react';
import { 
  Brain, 
  Smile, 
  Frown, 
  Meh, 
  Laugh, 
  Angry, 
  Activity, 
  Calendar,
  AlertCircle,
  HelpCircle,
  UserCheck
} from 'lucide-react';

const MOODS = [
  { score: 5, emoji: '😁', label: 'Sangat Baik' },
  { score: 4, emoji: '🙂', label: 'Baik' },
  { score: 3, emoji: '😐', label: 'Biasa Saja' },
  { score: 2, emoji: '🙁', label: 'Kurang Baik' },
  { score: 1, emoji: '😫', label: 'Buruk / Stres' },
];

const PHQ9_QUESTIONS = [
  "Kurang berminat atau bergairah dalam melakukan sesuatu",
  "Merasa murung, sedih, atau putus asa",
  "Sulit tidur, sering terbangun, atau terlalu banyak tidur",
  "Merasa lelah atau kurang bertenaga",
  "Kurang nafsu makan atau makan berlebihan",
  "Kurang percaya diri atau merasa gagal",
  "Sulit berkonsentrasi pada hal-hal seperti membaca koran atau menonton TV",
  "Bergerak/berbicara sangat lambat, atau sebaliknya, merasa gelisah",
  "Mempunyai pikiran bahwa lebih baik mati atau ingin menyakiti diri sendiri"
];

interface MoodLog {
  id: number;
  mood_score: number;
  notes: string;
  logged_at: string;
}

interface Assessment {
  id: number;
  total_score: number;
  risk_level: string;
  recommendations: string;
  created_at: string;
}

export default function MentalHealthPage() {
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  // Mood Tracker Form
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNotes, setMoodNotes] = useState('');
  const [savingMood, setSavingMood] = useState(false);

  // PHQ-9 Assessment state
  const [quizActive, setQuizActive] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>(new Array(9).fill(0));
  const [assessmentResult, setAssessmentResult] = useState<any | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch('/api/mental-health');
      if (res.ok) {
        const d = await res.json();
        setMoodLogs(d.logs || []);
        setAssessments(d.assessments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMood === null) return;
    setSavingMood(true);
    try {
      const res = await fetch('/api/mental-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mood',
          mood_score: selectedMood,
          notes: moodNotes
        })
      });
      if (res.ok) {
        setSelectedMood(null);
        setMoodNotes('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingMood(false);
    }
  };

  const handleQuizAnswer = (qIndex: number, val: number) => {
    const newAns = [...quizAnswers];
    newAns[qIndex] = val;
    setQuizAnswers(newAns);
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingQuiz(true);
    try {
      const res = await fetch('/api/mental-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'assessment',
          answers: quizAnswers
        })
      });
      if (res.ok) {
        const d = await res.json();
        setAssessmentResult(d.result);
        setQuizAnswers(new Array(9).fill(0));
        setQuizActive(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const getMoodEmoji = (score: number) => {
    const found = MOODS.find(m => m.score === score);
    return found ? found.emoji : '😐';
  };

  return (
    <div className="page-container animate-in">
      <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 1.8fr', alignItems: 'start' }}>
        {/* Mood Tracker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Smile size={20} style={{ color: 'var(--accent)' }} />
              Mood Tracker Hari Ini
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Bagaimana perasaan atau kondisi psikologis Anda hari ini?
            </p>
            
            <form onSubmit={handleMoodSubmit}>
              <div className="mood-grid" style={{ marginBottom: 20 }}>
                {MOODS.map((m) => (
                  <div 
                    key={m.score} 
                    className={`mood-item ${selectedMood === m.score ? 'selected' : ''}`}
                    onClick={() => setSelectedMood(m.score)}
                  >
                    <span className="mood-emoji">{m.emoji}</span>
                    <span className="mood-label">{m.label}</span>
                  </div>
                ))}
              </div>

              <div className="input-group" style={{ marginBottom: 16 }}>
                <label>Ceritakan sedikit perasaan Anda (opsional)</label>
                <input className="input" placeholder="Tulis catatan harian Anda..." value={moodNotes} onChange={e => setMoodNotes(e.target.value)} />
              </div>

              <button className="btn btn-primary" type="submit" disabled={selectedMood === null || savingMood} style={{ width: '100%' }}>
                {savingMood ? 'Menyimpan...' : 'Simpan Mood Harian'}
              </button>
            </form>
          </div>

          {/* Consultation panel */}
          <div className="card-glass" style={{ borderLeft: '4px solid var(--accent)' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <UserCheck size={18} style={{ color: 'var(--accent-light)' }} />
              Layanan Konsultasi Psikolog
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Butuh teman bicara profesional? Tim psikolog kami siap membantu Anda menjaga kesehatan mental.
            </p>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Hubungi Psikolog Berlisensi
            </button>
          </div>
        </div>

        {/* Assessment & Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* PHQ-9 Mental Assessment */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Brain size={20} style={{ color: 'var(--primary-light)' }} />
              Skrining Kesehatan Mental (PHQ-9)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Kuisioner standar medis untuk mengukur gejala kecemasan atau tingkat depresi.
            </p>

            {assessmentResult && (
              <div style={{ padding: 16, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 20 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 8 }}>Hasil Skrining Anda:</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span>Tingkat Risiko:</span>
                  <span className={`badge ${assessmentResult.riskLevel === 'normal' ? 'badge-success' : assessmentResult.riskLevel === 'ringan' ? 'badge-warning' : 'badge-danger'}`}>
                    {assessmentResult.riskLevel.toUpperCase()} (Skor: {assessmentResult.score})
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{assessmentResult.interpretation}</p>
                <div style={{ fontSize: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <strong style={{ color: 'var(--accent-light)' }}>Rekomendasi AI:</strong>
                  <ul style={{ paddingLeft: 16, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {assessmentResult.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 12, width: '100%' }} onClick={() => setAssessmentResult(null)}>
                  Tutup Hasil / Tes Ulang
                </button>
              </div>
            )}

            {!quizActive ? (
              <button className="btn btn-primary" onClick={() => setQuizActive(true)} style={{ width: '100%' }}>
                <Brain size={18} /> Mulai Kuisioner Skrining (9 Pertanyaan)
              </button>
            ) : (
              <form onSubmit={handleQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '350px', overflowY: 'auto', paddingRight: 8 }}>
                  {PHQ9_QUESTIONS.map((q, idx) => (
                    <div key={idx} style={{ paddingBottom: 16, borderBottom: '1px solid var(--glass-border)' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: 8 }}>{idx + 1}. {q}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                        {['Tidak Pernah', 'Beberapa Hari', 'Sebagian Hari', 'Hampir Tiap Hari'].map((opt, val) => (
                          <button 
                            key={val} 
                            type="button"
                            className={`btn btn-sm ${quizAnswers[idx] === val ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleQuizAnswer(idx, val)}
                            style={{ padding: '6px 4px', fontSize: '0.7rem' }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setQuizActive(false)} style={{ flex: 1 }}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={submittingQuiz} style={{ flex: 1 }}>
                    {submittingQuiz ? 'Mengevaluasi...' : 'Kirim & Dapatkan Hasil'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Mood History list */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Riwayat Mood</h3>
            <div className="table-container" style={{ maxHeight: 200, overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Hari / Tanggal</th>
                    <th>Kondisi Mood</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {moodLogs.length > 0 ? (
                    moodLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{new Date(log.logged_at).toLocaleDateString('id-ID')}</td>
                        <td>
                          <span style={{ fontSize: '1.25rem', marginRight: 6 }}>{getMoodEmoji(log.mood_score)}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({log.mood_score}/5)</span>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>{log.notes || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Belum ada riwayat mood tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
