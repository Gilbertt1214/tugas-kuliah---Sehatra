'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Flame, 
  Footprints, 
  Droplet,
  AlertOctagon,
  ChevronRight,
  TrendingUp,
  Brain,
  Calendar,
  Plus,
  PlusCircle,
  Clock,
  Sparkles,
  Users,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface Metric {
  metric_type: string;
  value: number;
  unit: string;
  recorded_at: string;
}

interface Goal {
  id: number;
  title: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string;
}

interface Reminder {
  id: number;
  title: string;
  reminder_time: string;
  reminder_type: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [familyCount, setFamilyCount] = useState(0);
  const [latestMood, setLatestMood] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal State for Quick Add Metric
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [newMetricType, setNewMetricType] = useState('heart_rate');
  const [newMetricVal, setNewMetricVal] = useState('');
  const [newMetricUnit, setNewMetricUnit] = useState('bpm');
  const [submittingMetric, setSubmittingMetric] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [metricsRes, healthyRes, familyRes, mentalRes] = await Promise.all([
          fetch('/api/health/monitoring'),
          fetch('/api/healthy-living'),
          fetch('/api/family'),
          fetch('/api/mental-health')
        ]);

        if (metricsRes.ok) {
          const d = await metricsRes.json();
          setMetrics(d.metrics || []);
        }
        if (healthyRes.ok) {
          const d = await healthyRes.json();
          setGoals(d.goals || []);
          setReminders(d.reminders || []);
        }
        if (familyRes.ok) {
          const d = await familyRes.json();
          setFamilyCount(d.members?.length || 0);
        }
        if (mentalRes.ok) {
          const d = await mentalRes.json();
          if (d.logs && d.logs.length > 0) {
            setLatestMood(d.logs[0].mood_score);
          }
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleMetricTypeChange = (type: string) => {
    setNewMetricType(type);
    if (type === 'heart_rate') setNewMetricUnit('bpm');
    else if (type === 'blood_pressure') setNewMetricUnit('mmHg');
    else if (type === 'blood_sugar') setNewMetricUnit('mg/dL');
    else if (type === 'steps') setNewMetricUnit('langkah');
    else if (type === 'weight') setNewMetricUnit('kg');
  };

  const handleAddMetricSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMetricVal) return;
    setSubmittingMetric(true);
    try {
      const res = await fetch('/api/health/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric_type: newMetricType,
          value: parseFloat(newMetricVal),
          unit: newMetricUnit,
          notes: 'Diinput melalui Dashboard Cepat'
        })
      });
      if (res.ok) {
        setShowAddMetric(false);
        setNewMetricVal('');
        // Refresh metrics
        const mRes = await fetch('/api/health/monitoring');
        if (mRes.ok) {
          const d = await mRes.json();
          setMetrics(d.metrics || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingMetric(false);
    }
  };

  // Helper to extract latest metric value
  const getLatestMetricVal = (type: string, fallback: string) => {
    const found = metrics.find(m => m.metric_type === type);
    return found ? `${found.value} ${found.unit}` : fallback;
  };

  // Get metric icon & color mapping
  const getHeartRate = () => {
    const hr = metrics.find(m => m.metric_type === 'heart_rate');
    if (!hr) return { val: '--', status: 'Tidak ada data', color: 'var(--text-muted)' };
    if (hr.value > 100) return { val: hr.value, status: 'Tinggi', color: 'var(--danger)' };
    if (hr.value < 60) return { val: hr.value, status: 'Rendah', color: 'var(--warning)' };
    return { val: hr.value, status: 'Normal', color: 'var(--success)' };
  };

  const hrInfo = getHeartRate();

  // Create chart data from heart_rate history
  const chartData = metrics
    .filter(m => m.metric_type === 'heart_rate')
    .slice(0, 7)
    .reverse()
    .map(m => ({
      time: new Date(m.recorded_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      bpm: m.value
    }));

  return (
    <div className="page-container animate-in">
      <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Selamat Datang Kembali</h1>
          <p className="page-subtitle">Berikut adalah ringkasan kesehatan Anda hari ini.</p>
        </div>
        <div className="flex-gap">
          <button className="btn btn-secondary" onClick={() => setShowAddMetric(true)}>
            <Plus size={18} />
            Input Vitalitas
          </button>
          <Link href="/emergency" className="btn btn-danger">
            <AlertOctagon size={18} />
            DARURAT
          </Link>
        </div>
      </div>

      {/* Vitals Quick Cards */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>
            <Heart size={22} fill="currentColor" />
          </div>
          <div className="metric-value" style={{ color: hrInfo.color }}>
            {hrInfo.val} <span style={{ fontSize: '1rem', fontWeight: 500 }}>bpm</span>
          </div>
          <div className="metric-label">Detak Jantung ({hrInfo.status})</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)' }}>
            <Droplet size={22} fill="currentColor" />
          </div>
          <div className="metric-value">
            {getLatestMetricVal('blood_pressure', '120/80 mmHg')}
          </div>
          <div className="metric-label">Tekanan Darah</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent)' }}>
            <Footprints size={22} />
          </div>
          <div className="metric-value">
            {getLatestMetricVal('steps', '0 langkah')}
          </div>
          <div className="metric-label">Langkah Kaki Hari Ini</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)' }}>
            <Flame size={22} />
          </div>
          <div className="metric-value">
            {getLatestMetricVal('blood_sugar', '95 mg/dL')}
          </div>
          <div className="metric-label">Gula Darah Acak</div>
        </div>
      </div>

      <div className="grid-3-custom" style={{ marginBottom: 32 }}>
        {/* Weekly heart rate analysis chart */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
                Tren Detak Jantung
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Aktivitas terakhir detak jantung Anda</p>
            </div>
            <Link href="/monitoring" className="btn btn-secondary btn-sm">
              Analisis Lengkap <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorBpm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis domain={['dataMin - 10', 'dataMax + 10']} stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                  />
                  <Area type="monotone" dataKey="bpm" stroke="var(--primary)" fillOpacity={0.15} fill="var(--primary)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-center" style={{ height: '100%', flexDirection: 'column', color: 'var(--text-muted)' }}>
                <Activity size={40} strokeWidth={1} style={{ marginBottom: 12 }} />
                <p style={{ fontSize: '0.85rem' }}>Belum ada data detak jantung terekam.</p>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowAddMetric(true)}>
                  Mulai Input Data
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Sparkles size={18} style={{ color: 'var(--primary)' }} />
              Rekomendasi Cerdas AI
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {metrics.length > 0 ? (
                <>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--warning)', marginTop: 2 }}><Activity size={18} /></div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Tingkatkan Langkah Harian</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        Aktivitas fisik teratur dapat menurunkan risiko hipertensi dan menjaga kesehatan jantung.
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--primary)', marginTop: 2 }}><Droplet size={18} /></div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Cukupi Hidrasi Tubuh</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        Minum segelas air putih hangat setiap pagi hari untuk mendukung metabolisme.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Lengkapi data vitalitas dan sinkronisasi smartwatch Anda untuk mendapatkan rekomendasi kesehatan personal.
                </p>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 16, marginTop: 16 }}>
            <Link href="/detection" className="btn btn-primary" style={{ width: '100%' }}>
              Skrining Gejala Cepat
            </Link>
          </div>
        </div>
      </div>

      <div className="grid-3">
        {/* Medication & Vaccinations Reminders */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Clock size={16} style={{ color: 'var(--warning)' }} />
            Jadwal & Pengingat Terdekat
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reminders.length > 0 ? (
              reminders.slice(0, 3).map((rem) => (
                <div key={rem.id} className="flex-between" style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{rem.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Waktu: {rem.reminder_time}</div>
                  </div>
                  <span className="badge badge-warning">{rem.reminder_type}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '8px 0' }}>
                Tidak ada jadwal atau pengingat obat hari ini.
              </p>
            )}
            <Link href="/healthy-living" className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 8 }}>
              Kelola Pengingat
            </Link>
          </div>
        </div>

        {/* Health Target Progress */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
            Target Kesehatan (Goals)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {goals.length > 0 ? (
              goals.slice(0, 2).map((g) => {
                const pct = Math.min(100, Math.round((g.current_value / g.target_value) * 100)) || 0;
                return (
                  <div key={g.id}>
                    <div className="flex-between" style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{g.title}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{g.current_value}/{g.target_value} {g.unit}</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Belum ada target kesehatan yang diatur.
              </p>
            )}
            <Link href="/healthy-living" className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 8 }}>
              Atur Target Baru
            </Link>
          </div>
        </div>

        {/* Family & Mental Overview */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Users size={16} style={{ color: 'var(--secondary-light)' }} />
            Keluarga & Mental Health
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="flex-between" style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Anggota Keluarga</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{familyCount} Anggota Terdaftar</div>
              </div>
              <Link href="/family" className="btn btn-secondary btn-sm">Pantau</Link>
            </div>
            
            <div className="flex-between" style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Mood Terakhir Anda</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {latestMood !== null ? `Skor Mood: ${latestMood}/5` : 'Belum diisi hari ini'}
                </div>
              </div>
              <Link href="/mental-health" className="btn btn-secondary btn-sm">Catat</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add Metric Modal */}
      {showAddMetric && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Input Tanda Vital</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowAddMetric(false)}>✕</button>
            </div>
            <form onSubmit={handleAddMetricSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Jenis Tanda Vital</label>
                <select className="input" value={newMetricType} onChange={e => handleMetricTypeChange(e.target.value)}>
                  <option value="heart_rate">Detak Jantung (Heart Rate)</option>
                  <option value="blood_pressure">Tekanan Darah (Blood Pressure)</option>
                  <option value="blood_sugar">Gula Darah (Blood Sugar)</option>
                  <option value="steps">Langkah Kaki (Steps)</option>
                  <option value="weight">Berat Badan (Weight)</option>
                </select>
              </div>

              <div className="input-group">
                <label>Nilai / Value</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" type="number" placeholder="Contoh: 72" value={newMetricVal} onChange={e => setNewMetricVal(e.target.value)} required style={{ flex: 1 }} />
                  <span className="btn btn-secondary" style={{ pointerEvents: 'none' }}>{newMetricUnit}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddMetric(false)} style={{ flex: 1 }}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={submittingMetric} style={{ flex: 1 }}>
                  {submittingMetric ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
