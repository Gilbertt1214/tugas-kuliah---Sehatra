'use client';

import { useState, useEffect } from 'react';
import { 
  Brain, 
  Smile, 
  AlertCircle,
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
  const [, setAssessments] = useState<Assessment[]>([]);
  const [, setLoading] = useState(true);

  // Mood Tracker Form
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNotes, setMoodNotes] = useState('');
  const [savingMood, setSavingMood] = useState(false);

  // Psychology consultation modal
  const [showConsultModal, setShowConsultModal] = useState(false);

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
      
      const data = await res.json();
      
      if (res.ok) {
        setSelectedMood(null);
        setMoodNotes('');
        await loadData(); // Reload data to show new entry
        alert('Mood berhasil disimpan!');
      } else {
        console.error('Error saving mood:', data);
        alert('Gagal menyimpan mood: ' + (data.error || 'Server error'));
      }
    } catch (err) {
      console.error('Error submitting mood:', err);
      alert('Terjadi kesalahan saat menyimpan mood');
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
            <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => setShowConsultModal(true)}>
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
                      <li key={`mental-rec-${idx}-${rec.substring(0, 15)}`}>{rec}</li>
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
                            key={`q${idx}-opt${val}`}
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

      {/* Psychology Consultation Modal */}
      {showConsultModal && (
        <div className="modal-overlay" onClick={() => setShowConsultModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Layanan Konsultasi Psikolog</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowConsultModal(false)}>
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>×</span>
              </button>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div className="card-glass" style={{ padding: 16, marginBottom: 16, borderLeft: '4px solid var(--primary)' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserCheck size={18} />
                  Konsultasi dengan Psikolog Berlisensi
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Tim psikolog profesional kami siap membantu Anda dengan:
                </p>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: 20, marginTop: 8, lineHeight: 1.8 }}>
                  <li key="service-1">Konseling kesehatan mental</li>
                  <li key="service-2">Manajemen stres dan kecemasan</li>
                  <li key="service-3">Terapi kognitif perilaku (CBT)</li>
                  <li key="service-4">Konsultasi depresi dan trauma</li>
                  <li key="service-5">Terapi keluarga dan hubungan</li>
                </ul>
              </div>

              <div className="card-glass" style={{ padding: 16, marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: 8 }}>📞 Kontak Layanan</h4>
                <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <strong>Hotline 24/7:</strong><br />
                    <a href="tel:1500567" style={{ color: 'var(--primary)', fontWeight: 700 }}>119 ext. 8</a> (Layanan Darurat Kesehatan Mental)
                  </div>
                  <div>
                    <strong>WhatsApp:</strong><br />
                    <a href="https://wa.me/628111909192" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                      +62 811-1909-192
                    </a>
                  </div>
                  <div>
                    <strong>Email:</strong><br />
                    <a href="mailto:konseling@sehatra.com" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                      konseling@sehatra.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="card-glass" style={{ padding: 16, background: 'var(--warning)', borderColor: '#000', color: '#000' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={16} />
                  Keadaan Darurat?
                </h4>
                <p style={{ fontSize: '0.8rem', marginBottom: 8 }}>
                  Jika Anda dalam krisis atau memiliki pikiran untuk menyakiti diri sendiri, segera hubungi:
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href="tel:119" className="btn btn-danger btn-sm">
                    🚨 Darurat 119
                  </a>
                  <a href="tel:021500454" className="btn btn-danger btn-sm">
                    📞 Into The Light (021-500-454)
                  </a>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <a href="https://wa.me/628111909192?text=Halo,%20saya%20ingin%20konsultasi%20dengan%20psikolog" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ flex: 1 }}>
                💬WhatsApp
              </a>
              <button className="btn btn-secondary" onClick={() => setShowConsultModal(false)} style={{ flex: 1 }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
