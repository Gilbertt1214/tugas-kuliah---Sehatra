import Link from 'next/link';
import { 
  Activity, 
  ShieldAlert, 
  Brain, 
  Search, 
  Users, 
  FileText, 
  Pill, 
  Heart,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  const stats = [
    { label: 'Indikator Kesehatan', value: '8+', color: 'var(--primary)' },
    { label: 'Respons SOS Darurat', value: '< 5 Mnt', color: 'var(--danger)' },
    { label: 'Akurasi Diagnosis AI', value: '98%', color: 'var(--success)' },
    { label: 'Koneksi Faskes', value: '150+', color: 'var(--warning)' }
  ];

  const features = [
    { 
      icon: <Activity style={{ color: '#000000' }} />, 
      title: 'Health Monitoring', 
      desc: 'Pantau indikator vital harian (detak jantung, tekanan darah, tidur) terintegrasi IoT.',
      badge: 'Real-time',
      bg: 'hsl(199, 89%, 65%)'
    },
    { 
      icon: <ShieldAlert style={{ color: '#000000' }} />, 
      title: 'Smart Emergency', 
      desc: 'Sistem darurat satu tombol SOS dengan pengiriman koordinat GPS instan ke kontak & faskes.',
      badge: '24/7 Siaga',
      bg: 'var(--danger)'
    },
    { 
      icon: <Brain style={{ color: '#000000' }} />, 
      title: 'Mental Health Care', 
      desc: 'Skrining suasana hati, tracking tingkat stres, dan asisten AI curhat yang aman.',
      badge: 'Sesi Privat',
      bg: 'hsl(271, 91%, 75%)'
    },
    { 
      icon: <Search style={{ color: '#000000' }} />, 
      title: 'AI Disease Detection', 
      desc: 'Deteksi dini potensi penyakit berdasarkan gejala klinis dengan mesin AI prediktif.',
      badge: 'Rekomendasi AI',
      bg: 'var(--success)'
    },
    { 
      icon: <Users style={{ color: '#000000' }} />, 
      title: 'Family Health', 
      desc: 'Dashboard terpusat untuk memantau rekam medis dan pengingat obat seluruh anggota keluarga.',
      badge: 'Multi-Profil',
      bg: 'var(--warning)'
    },
    { 
      icon: <FileText style={{ color: '#000000' }} />, 
      title: 'Integrated Records', 
      desc: 'Simpan riwayat medis, diagnosis dokter, dan resep obat digital Anda secara aman.',
      badge: 'Terorganisir',
      bg: 'hsl(199, 89%, 75%)'
    }
  ];

  return (
    <div className="sehatra-landing-container">
      {/* Brutalist Dot Grid Background Effect */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(var(--text-muted) 1px, transparent 1px)',
        backgroundSize: '24px 24px', opacity: 0.08, pointerEvents: 'none'
      }} />

      {/* Navigation Header */}
      <header className="sehatra-header">
        <div className="sehatra-header-logo">
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-brutal)', border: 'var(--border-brutal)',
            background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '3px 3px 0px #000000'
          }}>
            <Heart size={20} fill="#000000" stroke="#000000" />
          </div>
          <span className="sehatra-header-logo-text">
            Seha<span style={{ color: 'var(--success)' }}>tra</span>
          </span>
        </div>
        <div className="sehatra-header-actions">
          <Link href="/login" className="btn btn-secondary">
            Masuk
          </Link>
          <Link href="/register" className="btn btn-primary">
            Daftar Akun
          </Link>
        </div>
      </header>

      {/* Main Hero & Content Section */}
      <main style={{ padding: '40px 20px', flex: 1, zIndex: 1, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div className="sehatra-hero-section">
          
          {/* Column 1: Info */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
              background: 'var(--warning)', border: 'var(--border-brutal)', borderRadius: 'var(--radius-brutal)',
              fontSize: '0.8rem', fontWeight: 900, color: '#000000', marginBottom: 24, boxShadow: '2px 2px 0px #000000',
              textTransform: 'uppercase'
            }}>
              <Sparkles size={14} /> Era Baru Smart Healthcare
            </div>
            
            <h1 className="landing-hero-title" style={{ fontSize: '3.8rem', lineHeight: '1.05', fontWeight: 900, marginBottom: 20, textTransform: 'uppercase' }}>
              Transformasi <br />
              Kesehatan <br />
              <span style={{ 
                color: '#000000', background: 'var(--success)', padding: '2px 14px', 
                border: 'var(--border-brutal)', display: 'inline-block', transform: 'rotate(-1.5deg)',
                boxShadow: '4px 4px 0px var(--danger)'
              }}>Cerdas</span>
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 36, fontWeight: 500 }}>
              Platform kesehatan digital berbasis AI yang menyatukan pemantauan kesehatan harian, 
              skrining penyakit cerdas, sistem darurat SOS, dan rekam medis keluarga dalam satu ekosistem preventif & prediktif.
            </p>

            <div className="sehatra-hero-actions">
              <Link href="/register" className="btn btn-primary btn-lg" style={{ padding: '16px 32px', fontSize: '1rem' }}>
                Mulai Sekarang <ArrowRight size={20} />
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg" style={{ padding: '16px 32px', fontSize: '1rem' }}>
                Akses Dashboard
              </Link>
            </div>

            {/* Feature Badges list */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                <ShieldCheck size={18} style={{ color: 'var(--success)' }} />
                <span>Terintegrasi BPJS & Kemenkes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                <Clock size={18} style={{ color: 'var(--primary-light)' }} />
                <span>Pemantauan AI 24/7</span>
              </div>
            </div>
          </div>

          {/* Column 2: Neo-Brutalist Health Mockup */}
          <div style={{
            background: 'var(--bg-card)', border: 'var(--border-brutal)', borderRadius: 'var(--radius-brutal)',
            padding: '24px', boxShadow: '10px 10px 0px #000000', position: 'relative', width: '100%'
          }}>
            {/* Window header */}
            <div style={{ 
              display: 'flex', gap: 6, borderBottom: '2px solid #000000', paddingBottom: 16, marginBottom: 20,
              alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff3e55', border: '1px solid #000' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffcc00', border: '1px solid #000' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#00f5c6', border: '1px solid #000' }} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>SEHATRA AI ASSISTANT</span>
            </div>

            {/* Simulated AI message */}
            <div style={{ 
              background: 'var(--bg-dark)', border: 'var(--border-brutal)', padding: 16, borderRadius: 'var(--radius-brutal)',
              marginBottom: 16, boxShadow: '4px 4px 0px #000000'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--success)' }}>AI AGENT ACTIVE</span>
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.4, color: 'var(--text-primary)' }}>
                "Berdasarkan data smartwatch Anda: Detak jantung stabil di 72 BPM, kualitas tidur 85% optimal. 
                Hasil tes gejala awal flu tergolong rendah. Tetap jaga hidrasi tubuh!"
              </p>
            </div>

            {/* Quick Metrics display inside mock */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ 
                background: 'var(--primary)', color: '#000000', padding: 12, borderRadius: 'var(--radius-brutal)',
                border: 'var(--border-brutal)', boxShadow: '3px 3px 0px #000000'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>Detak Jantung</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>72 <span style={{ fontSize: '0.9rem' }}>BPM</span></div>
              </div>
              <div style={{ 
                background: 'var(--danger)', color: '#000000', padding: 12, borderRadius: 'var(--radius-brutal)',
                border: 'var(--border-brutal)', boxShadow: '3px 3px 0px #000000'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>Sistem SOS</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', marginTop: 4 }}>STANDBY</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="sehatra-stats-grid">
          {stats.map((s, idx) => (
            <div key={idx} className="sehatra-stats-item">
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Section Features Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 12, textTransform: 'uppercase' }}>
            All-In-One Smart Healthcare
          </h2>
          <p style={{ maxWidth: 650, margin: '0 auto', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Layanan kesehatan digital pintar terintegrasi dalam satu sistem yang dirancang responsif, efisien, dan berorientasi pada masyarakat.
          </p>
        </div>

        {/* Features List */}
        <div className="sehatra-features-grid">
          {features.map((f, i) => (
            <div key={i} style={{
              padding: 28, border: 'var(--border-brutal)', borderRadius: 'var(--radius-brutal)',
              background: 'var(--bg-card)', boxShadow: '6px 6px 0px #000000', display: 'flex', flexDirection: 'column',
              transition: 'var(--transition-brutal)', position: 'relative'
            }}>
              {/* Feature Icon Container */}
              <div style={{
                width: 50, height: 50, borderRadius: 'var(--radius-brutal)', border: 'var(--border-brutal)',
                background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20, boxShadow: '3px 3px 0px #000000'
              }}>
                {f.icon}
              </div>

              {/* Feature title */}
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: 12, textTransform: 'uppercase' }}>
                {f.title}
              </h3>

              {/* Feature Description */}
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1, marginBottom: 20 }}>
                {f.desc}
              </p>

              {/* Tag / Badge */}
              <div style={{
                alignSelf: 'flex-start', padding: '4px 12px', border: '2px solid #000000',
                borderRadius: 4, background: '#000000', color: 'var(--text-primary)',
                fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase'
              }}>
                {f.badge}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '30px 40px', borderTop: 'var(--border-brutal)', background: 'var(--bg-card)',
        textAlign: 'center', zIndex: 1
      }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          © {new Date().getFullYear()} Sehatra. Smart Healthcare Transformation for Indonesia. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
