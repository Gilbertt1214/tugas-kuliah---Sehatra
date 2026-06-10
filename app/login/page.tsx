'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push('/dashboard');
    } catch { setError('Gagal terhubung ke server'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-brutal)', border: 'var(--border-brutal)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: '#000000', margin: '0 auto', boxShadow: '3px 3px 0px #000000' }}>SH</div>
          <h1>Masuk ke Sehatra</h1>
          <p>Akses layanan kesehatan digital Anda</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email / NIK / No. BPJS</label>
            <input className="input" type="text" placeholder="Masukkan email, NIK, atau nomor BPJS" value={identifier} onChange={e => setIdentifier(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input className="input" type="password" placeholder="Masukkan password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <div className="auth-footer">
          Belum punya akun? <Link href="/register">Daftar sekarang</Link>
        </div>
      </div>
    </div>
  );
}
