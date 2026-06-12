'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  CheckSquare, 
  Coffee, 
  Footprints, 
  Moon,
  Pill,
  Award
} from 'lucide-react';

interface Goal {
  id: number;
  goal_type: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string;
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  time_of_day: string;
}

interface Reminder {
  id: number;
  reminder_type: string;
  title: string;
  description: string;
  reminder_time: string;
}

export default function HealthyLivingPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms modals visibility
  const [activeForm, setActiveForm] = useState<'none' | 'goal' | 'medication' | 'reminder'>('none');

  // Goal Form
  const [goalType, setGoalType] = useState('steps');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalUnit, setGoalUnit] = useState('langkah');
  const [goalDeadline, setGoalDeadline] = useState('');

  // Medication Form
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFreq, setMedFreq] = useState('3x sehari');
  const [medTime, setMedTime] = useState('Pagi, Siang, Malam');
  const [medNotes, setMedNotes] = useState('');

  // Reminder Form
  const [remType, setRemType] = useState('Minum Air');
  const [remTitle, setRemTitle] = useState('');
  const [remDesc, setRemDesc] = useState('');
  const [remTimeStr, setRemTimeStr] = useState('');

  // Updating goal values
  const [updateVal, setUpdateVal] = useState<Record<number, string>>({});

  const loadData = async () => {
    try {
      const res = await fetch('/api/healthy-living');
      if (res.ok) {
        const d = await res.json();
        setGoals(d.goals || []);
        setMedications(d.medications || []);
        setReminders(d.reminders || []);
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

  const handleGoalTypeChange = (type: string) => {
    setGoalType(type);
    if (type === 'steps') { setGoalTitle('Target Langkah Harian'); setGoalUnit('langkah'); }
    else if (type === 'water') { setGoalTitle('Minum Air Mineral'); setGoalUnit('ml'); }
    else if (type === 'sleep') { setGoalTitle('Kualitas Tidur Harian'); setGoalUnit('jam'); }
    else { setGoalTitle(''); setGoalUnit(''); }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || !goalTarget) return;
    try {
      const res = await fetch('/api/healthy-living', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'goal',
          goal_type: goalType,
          title: goalTitle,
          target_value: parseFloat(goalTarget),
          unit: goalUnit,
          deadline: goalDeadline || null
        })
      });
      if (res.ok) {
        setGoalTitle('');
        setGoalTarget('');
        setGoalDeadline('');
        setActiveForm('none');
        loadData();
      }
    } catch (err) { console.error(err); }
  };

  const handleCreateMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName) return;
    try {
      const res = await fetch('/api/healthy-living', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'medication',
          name: medName,
          dosage: medDosage,
          frequency: medFreq,
          time_of_day: medTime,
          notes: medNotes
        })
      });
      if (res.ok) {
        setMedName('');
        setMedDosage('');
        setMedNotes('');
        setActiveForm('none');
        loadData();
      }
    } catch (err) { console.error(err); }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle || !remTimeStr) return;
    try {
      const res = await fetch('/api/healthy-living', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reminder',
          reminder_type: remType,
          title: remTitle,
          description: remDesc,
          reminder_time: remTimeStr,
          is_recurring: true
        })
      });
      if (res.ok) {
        setRemTitle('');
        setRemDesc('');
        setRemTimeStr('');
        setActiveForm('none');
        loadData();
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdateGoalProgress = async (id: number, val: string) => {
    if (!val) return;
    try {
      const res = await fetch('/api/healthy-living', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'update_goal',
          id,
          current_value: parseFloat(val)
        })
      });
      if (res.ok) {
        setUpdateVal(prev => ({ ...prev, [id]: '' }));
        loadData();
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteItem = async (id: number, type: 'goal' | 'medication' | 'reminder') => {
    try {
      const res = await fetch(`/api/healthy-living?id=${id}&type=${type}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) { console.error(err); }
  };

  const getGoalIcon = (type: string) => {
    if (type === 'steps') return <Footprints size={20} />;
    if (type === 'water') return <Coffee size={20} />;
    if (type === 'sleep') return <Moon size={20} />;
    return <TrendingUp size={20} />;
  };

  return (
    <div className="page-container animate-in">
      {/* Dynamic Health Tip Banner */}
      <div className="card-glass" style={{ background: 'var(--warning)', color: '#000000', marginBottom: 32, padding: '24px 32px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Sparkles size={36} />
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800, opacity: 0.9 }}>Tips Pola Hidup Sehat Hari Ini</span>
            <h3 style={{ fontSize: '1.25rem', marginTop: 4, fontWeight: 900, color: '#000000' }}>Minum Air Putih Cukup</h3>
            <p style={{ fontSize: '0.85rem', marginTop: 4, opacity: 0.9, lineHeight: 1.5, fontWeight: 600 }}>
              Pastikan Anda mencukupi kebutuhan air 2 Liter sehari. Ini menjaga fungsi sel tubuh, kesehatan kulit, dan metabolisme tetap prima.
            </p>
          </div>
        </div>
      </div>

      <div className="grid-3">
        {/* Goals Tracker */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={18} style={{ color: 'var(--warning)' }} /> Target Gaya Hidup
            </h3>
            <button className="btn btn-secondary btn-icon" onClick={() => { handleGoalTypeChange('steps'); setActiveForm('goal'); }} style={{ width: 28, height: 28 }}>
              <Plus size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {goals.length > 0 ? (
              goals.map((g) => {
                const pct = Math.min(100, Math.round((g.current_value / g.target_value) * 100)) || 0;
                return (
                  <div key={g.id} style={{ padding: 12, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <div className="flex-between" style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ color: 'var(--primary-light)' }}>{getGoalIcon(g.goal_type)}</div>
                        <strong style={{ fontSize: '0.85rem' }}>{g.title}</strong>
                      </div>
                      <button className="btn btn-icon btn-secondary" onClick={() => handleDeleteItem(g.id, 'goal')} style={{ width: 24, height: 24, border: 'none', background: 'none' }}>
                        <Trash2 size={12} style={{ color: 'var(--danger)' }} />
                      </button>
                    </div>

                    <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                      <span>Progres: {pct}%</span>
                      <span>{g.current_value} / {g.target_value} {g.unit}</span>
                    </div>

                    <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
                    </div>

                    {/* Progress Update Form */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input 
                        className="input" 
                        type="number" 
                        placeholder="Update nilai" 
                        value={updateVal[g.id] || ''} 
                        onChange={e => setUpdateVal(prev => ({ ...prev, [g.id]: e.target.value }))}
                        style={{ padding: '6px 8px', fontSize: '0.75rem', flex: 1 }} 
                      />
                      <button className="btn btn-primary btn-sm" onClick={() => handleUpdateGoalProgress(g.id, updateVal[g.id])} style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                        Update
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
                Belum ada target diatur. Klik tombol (+) di atas untuk menambah.
              </p>
            )}
          </div>
        </div>

        {/* Medication Intake */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Pill size={18} style={{ color: 'var(--primary-light)' }} /> Jadwal Obat
            </h3>
            <button className="btn btn-secondary btn-icon" onClick={() => setActiveForm('medication')} style={{ width: 28, height: 28 }}>
              <Plus size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {medications.length > 0 ? (
              medications.map((m) => (
                <div key={m.id} className="flex-between" style={{ padding: 12, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>{m.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dosis: {m.dosage} | Frekuensi: {m.frequency}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary-light)', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Clock size={12} /> {m.time_of_day}
                    </span>
                  </div>
                  <button className="btn btn-icon btn-secondary" onClick={() => handleDeleteItem(m.id, 'medication')} style={{ width: 28, height: 28, border: 'none', background: 'none' }}>
                    <Trash2 size={13} style={{ color: 'var(--danger)' }} />
                  </button>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
                Tidak ada jadwal minum obat aktif.
              </p>
            )}
          </div>
        </div>

        {/* Lifestyle Reminders */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} style={{ color: 'var(--success)' }} /> Pengingat Harian
            </h3>
            <button className="btn btn-secondary btn-icon" onClick={() => setActiveForm('reminder')} style={{ width: 28, height: 28 }}>
              <Plus size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reminders.length > 0 ? (
              reminders.map((r) => (
                <div key={r.id} className="flex-between" style={{ padding: 12, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>{r.title}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.description}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Clock size={12} /> Pukul {r.reminder_time}
                    </span>
                  </div>
                  <button className="btn btn-icon btn-secondary" onClick={() => handleDeleteItem(r.id, 'reminder')} style={{ width: 28, height: 28, border: 'none', background: 'none' }}>
                    <Trash2 size={13} style={{ color: 'var(--danger)' }} />
                  </button>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
                Belum ada pengingat harian aktif.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Goal Form Modal */}
      {activeForm === 'goal' && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Tambah Target Gaya Hidup</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setActiveForm('none')}>✕</button>
            </div>
            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Jenis Target</label>
                <select className="input" value={goalType} onChange={e => handleGoalTypeChange(e.target.value)}>
                  <option value="steps">Langkah Kaki (Steps)</option>
                  <option value="water">Minum Air (Water)</option>
                  <option value="sleep">Waktu Tidur (Sleep)</option>
                </select>
              </div>

              <div className="input-group">
                <label>Nama Target *</label>
                <input className="input" placeholder="Nama target" value={goalTitle} onChange={e => setGoalTitle(e.target.value)} required />
              </div>

              <div className="grid-equal-2">
                <div className="input-group">
                  <label>Nilai Target *</label>
                  <input className="input" type="number" placeholder="Misal: 8000" value={goalTarget} onChange={e => setGoalTarget(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Satuan</label>
                  <input className="input" value={goalUnit} disabled />
                </div>
              </div>

              <div className="input-group">
                <label>Batas Waktu (Opsional)</label>
                <input className="input" type="date" value={goalDeadline} onChange={e => setGoalDeadline(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveForm('none')} style={{ flex: 1 }}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan Target</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medication Form Modal */}
      {activeForm === 'medication' && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Tambah Jadwal Obat</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setActiveForm('none')}>✕</button>
            </div>
            <form onSubmit={handleCreateMedication} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Nama Obat / Suplemen *</label>
                <input className="input" placeholder="Nama obat" value={medName} onChange={e => setMedName(e.target.value)} required />
              </div>

              <div className="input-group">
                <label>Dosis / Aturan Pakai</label>
                <input className="input" placeholder="Contoh: 1 tablet, 500mg, 1 sendok teh" value={medDosage} onChange={e => setMedDosage(e.target.value)} />
              </div>

              <div className="grid-equal-2">
                <div className="input-group">
                  <label>Frekuensi</label>
                  <select className="input" value={medFreq} onChange={e => setMedFreq(e.target.value)}>
                    <option>1x sehari</option>
                    <option>2x sehari</option>
                    <option>3x sehari</option>
                    <option>4x sehari</option>
                    <option>Bila perlu</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Waktu Konsumsi</label>
                  <input className="input" placeholder="Contoh: Sebelum Makan" value={medTime} onChange={e => setMedTime(e.target.value)} />
                </div>
              </div>

              <div className="input-group">
                <label>Catatan Tambahan</label>
                <input className="input" placeholder="Instruksi tambahan" value={medNotes} onChange={e => setMedNotes(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveForm('none')} style={{ flex: 1 }}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan Jadwal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reminder Form Modal */}
      {activeForm === 'reminder' && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Tambah Pengingat Harian</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setActiveForm('none')}>✕</button>
            </div>
            <form onSubmit={handleCreateReminder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Jenis Pengingat</label>
                <select className="input" value={remType} onChange={e => setRemType(e.target.value)}>
                  <option>Minum Air</option>
                  <option>Istirahat</option>
                  <option>Olahraga / Peregangan</option>
                  <option>Cek Tanda Vital</option>
                </select>
              </div>

              <div className="input-group">
                <label>Judul Pengingat *</label>
                <input className="input" placeholder="Judul" value={remTitle} onChange={e => setRemTitle(e.target.value)} required />
              </div>

              <div className="input-group">
                <label>Deskripsi singkat</label>
                <input className="input" placeholder="Pesan pengingat" value={remDesc} onChange={e => setRemDesc(e.target.value)} />
              </div>

              <div className="input-group">
                <label>Waktu Alarm *</label>
                <input className="input" type="time" value={remTimeStr} onChange={e => setRemTimeStr(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveForm('none')} style={{ flex: 1 }}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan Pengingat</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
