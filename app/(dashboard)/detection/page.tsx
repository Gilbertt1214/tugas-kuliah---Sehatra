'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  AlertTriangle, 
  HelpCircle, 
  Stethoscope, 
  Check, 
  Loader2, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

const COMMON_SYMPTOMS = [
  { id: 'demam', name: 'Demam / Panas Tinggi' },
  { id: 'batuk', name: 'Batuk Kering/Berdahak' },
  { id: 'sesak-napas', name: 'Sesak Napas' },
  { id: 'nyeri-dada', name: 'Nyeri Dada' },
  { id: 'sakit-kepala', name: 'Sakit Kepala / Migrain' },
  { id: 'mual', name: 'Mual / Ingin Muntah' },
  { id: 'diare', name: 'Diare / Sakit Perut' },
  { id: 'nyeri-sendi', name: 'Nyeri Sendi' },
  { id: 'ruam-kulit', name: 'Ruam / Iritasi Kulit' },
  { id: 'pusing', name: 'Kepala Pusing / Vertigo' },
  { id: 'lemas', name: 'Badan Lemas / Lesu' },
  { id: 'mata-merah', name: 'Mata Merah / Gatal' },
];

interface DetectionLog {
  id: number;
  symptoms: string;
  description: string;
  risk_level: string;
  possible_conditions: string;
  created_at: string;
}

export default function DiseaseDetectionPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<string | null>(null);
  
  // Results states
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [history, setHistory] = useState<DetectionLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/detection');
      if (res.ok) {
        const d = await res.json();
        setHistory(d.detections || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0) return;
    setAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          description
        })
      });
      if (!res.ok) {
        const errText = await res.json().catch(() => ({ error: 'Gagal menganalisis gejala' }));
        throw new Error(errText.error || `HTTP error! status: ${res.status}`);
      }
      const d = await res.json();
      setResult(d.result);
      setSelectedSymptoms([]);
      setDescription('');
      setImageFile(null);
      fetchHistory();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat menganalisis gejala.');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatSymptomIdsToText = (jsonString: string) => {
    try {
      const arr = JSON.parse(jsonString) as string[];
      return arr.map(id => {
        const found = COMMON_SYMPTOMS.find(s => s.id === id);
        return found ? found.name.split(' ').slice(1).join(' ') : id;
      }).join(', ');
    } catch {
      return jsonString;
    }
  };

  return (
    <div className="page-container animate-in">
      <div className="grid-2-custom-alt">
        {/* Symptom Selector Form */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stethoscope size={20} style={{ color: 'var(--primary)' }} />
            Skrining Gejala Penyakit Cerdas
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            Pilih gejala yang Anda rasakan di bawah ini. AI Asisten Sehatra akan menganalisis kemungkinan gangguan kesehatan awal.
          </p>

          <form onSubmit={handleAnalyze}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Pilih Semua Gejala *</label>
              <div className="symptom-chips">
                {COMMON_SYMPTOMS.map((s) => {
                  const isSelected = selectedSymptoms.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`symptom-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleSymptom(s.id)}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 16 }}>
              <label>Detail Deskripsi Keluhan tambahan (Opsional)</label>
              <textarea className="input" placeholder="Tuliskan keluhan spesifik Anda secara lengkap..." value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            {/* Photo upload mock */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                Unggah Foto Gejala / Ruam / Iritasi (Opsional)
              </label>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '10px 16px', fontSize: '0.8rem' }}>
                  <Upload size={16} /> Pilih Berkas Foto
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
                {imageFile && (
                  <div style={{ position: 'relative', width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={imageFile} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={selectedSymptoms.length === 0 || analyzing} style={{ width: '100%' }}>
              {analyzing ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Menganalisis Gejala Anda...
                </>
              ) : (
                <>
                  <Search size={16} /> Analisis Gejala Sekarang
                </>
              )}
            </button>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, color: 'var(--danger)', fontSize: '0.85rem', padding: '8px 12px', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.1)' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>

        {/* Results / History Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Analysis Results Display */}
          {result && (
            <div className="card-glass" style={{ borderLeft: '4px solid var(--primary)', animation: 'slideUp 0.3s ease' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Stethoscope size={18} style={{ color: 'var(--primary-light)' }} /> Hasil Skrining Awal AI
              </h3>

              <div className="risk-indicator" style={{ marginBottom: 16 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tingkat Risiko:</span>
                <div className={`risk-indicator risk-${result.riskLevel === 'tinggi' ? 'high' : result.riskLevel === 'sedang' ? 'medium' : 'low'}`}>
                  <div className="risk-dot" />
                  <span className="risk-label">{result.riskLevel.toUpperCase()}</span>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Kemungkinan Kondisi:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.possibleConditions.map((cond: any, idx: number) => (
                    <div key={`condition-${idx}-${cond.name}`} style={{ padding: 8, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <div className="flex-between">
                        <strong style={{ fontSize: '0.8rem' }}>{cond.name}</strong>
                        <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Akurasi {cond.probability}</span>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 4 }}>{cond.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-brutal)', border: 'var(--border-brutal)', marginBottom: 16, boxShadow: '3px 3px 0px #000000' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary-light)' }}>Rekomendasi Spesialisasi:</div>
                <p style={{ fontSize: '0.85rem', marginTop: 2 }}>
                  Silakan buat janji temu dengan <strong>{result.suggestedSpecialty}</strong> untuk pemeriksaan klinis.
                </p>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <strong>Saran Tindakan:</strong>
                <ul style={{ paddingLeft: 16, marginTop: 4 }}>
                  {result.recommendations.map((rec: string, idx: number) => (
                    <li key={`rec-${idx}-${rec.substring(0, 15)}`} style={{ marginBottom: 4 }}>{rec}</li>
                  ))}
                </ul>
              </div>

              <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 16 }} onClick={() => setResult(null)}>
                Tutup Analisis
              </button>
            </div>
          )}

          {/* Disease Detection History Logs */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Riwayat Pemeriksaan</h3>
            <div className="table-container" style={{ maxHeight: 280, overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Gejala Terdeteksi</th>
                    <th>Tingkat Risiko</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? (
                    history.map((h) => (
                      <tr key={h.id}>
                        <td>{new Date(h.created_at).toLocaleDateString('id-ID')}</td>
                        <td style={{ fontSize: '0.75rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={formatSymptomIdsToText(h.symptoms)}>
                          {formatSymptomIdsToText(h.symptoms)}
                        </td>
                        <td>
                          <span className={`badge ${h.risk_level === 'tinggi' ? 'badge-danger' : h.risk_level === 'sedang' ? 'badge-warning' : 'badge-success'}`}>
                            {h.risk_level.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Belum ada riwayat deteksi.
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
