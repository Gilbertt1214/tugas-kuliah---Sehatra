'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', nik: '', bpjs_number: '', password: '', confirmPassword: '', blood_type: '', height: '', weight: '', birth_date: '', gender: '', allergies: '', chronic_conditions: '' });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true); setError('');
    if (form.password !== form.confirmPassword) { setError('Password tidak cocok'); setLoading(false); return; }
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, height: form.height ? parseFloat(form.height) : null, weight: form.weight ? parseFloat(form.weight) : null }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      router.push('/login');
    } catch { setError('Gagal terhubung ke server'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-brutal)', border: 'var(--border-brutal)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: '#000000', margin: '0 auto', boxShadow: '3px 3px 0px #000000' }}>SH</div>
          <h1>Daftar Sehatra</h1>
          <p>Buat akun kesehatan digital Anda</p>
        </div>
        <div className="auth-steps">
          <div className={`auth-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`} />
          <div className={`auth-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`} />
          <div className={`auth-step ${step >= 3 ? 'active' : ''}`} />
        </div>
        {error && <div className="error-message">{error}</div>}

        {step === 1 && (
          <div className="auth-form">
            <div className="input-group"><label>Nama Lengkap *</label><input className="input" placeholder="Nama lengkap" value={form.name} onChange={e => update('name', e.target.value)} required /></div>
            <div className="input-group"><label>Email *</label><input className="input" type="email" placeholder="email@contoh.com" value={form.email} onChange={e => update('email', e.target.value)} required /></div>
            <div className="input-group"><label>No. Telepon</label><input className="input" placeholder="08xxxxxxxxxx" value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
            <div className="input-group"><label>NIK (Opsional)</label><input className="input" placeholder="16 digit NIK" value={form.nik} onChange={e => update('nik', e.target.value)} maxLength={16} /></div>
            <div className="input-group"><label>No. BPJS (Opsional)</label><input className="input" placeholder="Nomor BPJS" value={form.bpjs_number} onChange={e => update('bpjs_number', e.target.value)} /></div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }} onClick={() => { if (!form.name || !form.email) { setError('Nama dan email wajib diisi'); return; } setError(''); setStep(2); }}>Selanjutnya</button>
          </div>
        )}

        {step === 2 && (
          <div className="auth-form">
            <div className="input-group"><label>Password *</label><input className="input" type="password" placeholder="Minimal 6 karakter" value={form.password} onChange={e => update('password', e.target.value)} /></div>
            <div className="input-group"><label>Konfirmasi Password *</label><input className="input" type="password" placeholder="Ulangi password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} /></div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary btn-lg" style={{ flex: 1 }} onClick={() => setStep(1)}>Kembali</button>
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => { if (!form.password || form.password.length < 6) { setError('Password minimal 6 karakter'); return; } if (form.password !== form.confirmPassword) { setError('Password tidak cocok'); return; } setError(''); setStep(3); }}>Selanjutnya</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="auth-form">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 8 }}>Profil kesehatan (opsional, bisa diisi nanti)</p>
            <div className="grid-equal-2">
              <div className="input-group"><label>Golongan Darah</label><select className="input" value={form.blood_type} onChange={e => update('blood_type', e.target.value)}><option value="">Pilih</option><option>A</option><option>B</option><option>AB</option><option>O</option></select></div>
              <div className="input-group"><label>Jenis Kelamin</label><select className="input" value={form.gender} onChange={e => update('gender', e.target.value)}><option value="">Pilih</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
              <div className="input-group"><label>Tinggi (cm)</label><input className="input" type="number" placeholder="170" value={form.height} onChange={e => update('height', e.target.value)} /></div>
              <div className="input-group"><label>Berat (kg)</label><input className="input" type="number" placeholder="65" value={form.weight} onChange={e => update('weight', e.target.value)} /></div>
            </div>
            <div className="input-group"><label>Tanggal Lahir</label><input className="input" type="date" value={form.birth_date} onChange={e => update('birth_date', e.target.value)} /></div>
            <div className="input-group"><label>Alergi</label><input className="input" placeholder="Contoh: kacang, seafood" value={form.allergies} onChange={e => update('allergies', e.target.value)} /></div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary btn-lg" style={{ flex: 1 }} onClick={() => setStep(2)}>Kembali</button>
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>{loading ? 'Memproses...' : 'Daftar'}</button>
            </div>
          </div>
        )}

        <div className="auth-footer">
          Sudah punya akun? <Link href="/login">Masuk disini</Link>
        </div>
      </div>
    </div>
  );
}
