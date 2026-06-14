import Link from 'next/link';
import {
  Heart,
  Brain,
  ShieldAlert,
  Activity,
  Users,
  Zap,
  Target,
  Lightbulb,
  Award,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  TrendingUp,
  Globe,
  Smartphone,
  Clock
} from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: <Heart size={28} style={{ color: '#000000' }} />,
      title: 'Patient-Centric',
      desc: 'Pengguna adalah prioritas utama. Setiap fitur dirancang untuk kemudahan akses kesehatan',
      bg: 'var(--danger)'
    },
    {
      icon: <Brain size={28} style={{ color: '#000000' }} />,
      title: 'AI-Powered Intelligence',
      desc: 'Teknologi machine learning untuk diagnosis prediktif dan rekomendasi personal',
      bg: 'var(--primary)'
    },
    {
      icon: <ShieldAlert size={28} style={{ color: '#000000' }} />,
      title: 'Safety First',
      desc: 'Keamanan data kesehatan dengan enkripsi end-to-end dan compliance HIPAA',
      bg: 'var(--warning)'
    },
    {
      icon: <Users size={28} style={{ color: '#000000' }} />,
      title: 'Community Driven',
      desc: 'Membangun ekosistem kesehatan yang menghubungkan pasien, dokter, dan faskes',
      bg: 'var(--success)'
    }
  ];

  const features = [
    { icon: <Activity size={20} />, text: 'Real-time Health Monitoring' },
    { icon: <Brain size={20} />, text: 'AI Disease Detection' },
    { icon: <ShieldAlert size={20} />, text: 'Emergency SOS System' },
    { icon: <Heart size={20} />, text: 'Mental Health Support' },
    { icon: <Users size={20} />, text: 'Family Health Dashboard' },
    { icon: <Zap size={20} />, text: 'IoT Device Integration' }
  ];

  const stats = [
    { number: '150+', label: 'Partner Faskes', icon: <Globe size={24} /> },
    { number: '98%', label: 'Akurasi AI', icon: <Target size={24} /> },
    { number: '24/7', label: 'Support Aktif', icon: <Clock size={24} /> },
    { number: '100K+', label: 'Trusted Users', icon: <Users size={24} /> }
  ];

  return (
    <div className="sehatra-landing-container">
      {/* Background Pattern */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(var(--text-muted) 1px, transparent 1px)',
        backgroundSize: '24px 24px', opacity: 0.08, pointerEvents: 'none'
      }} />

      {/* Header */}
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
        <div className="sehatra-header-actions" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/" className="btn btn-secondary">
            <ArrowLeft size={18} /> 
            <span className="mobile-hide">Kembali</span>
          </Link>
          <Link href="/register" className="btn btn-primary">
            <span className="mobile-hide">Daftar Sekarang</span>
            <span className="mobile-show">Daftar</span>
          </Link>
        </div>
      </header>

      <main style={{ padding: '40px 20px', flex: 1, zIndex: 1, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 80, paddingTop: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
            background: 'var(--primary)', border: 'var(--border-brutal)', borderRadius: 'var(--radius-brutal)',
            fontSize: '0.8rem', fontWeight: 900, color: '#000000', marginBottom: 24, boxShadow: '2px 2px 0px #000000',
            textTransform: 'uppercase'
          }}>
            <Sparkles size={14} /> Tentang Sehatra
          </div>

          <h1 className="landing-hero-title" style={{ 
            fontSize: '4rem', 
            fontWeight: 900, 
            marginBottom: 24, 
            lineHeight: 1.1,
            textTransform: 'uppercase'
          }}>
            Smart Healthcare<br />
            <span style={{ 
              color: '#000000', 
              background: 'var(--success)', 
              padding: '4px 20px', 
              display: 'inline-block',
              transform: 'rotate(-1deg)',
              boxShadow: '6px 6px 0px var(--danger)',
              border: 'var(--border-brutal)'
            }}>
              Transformation
            </span>
            <br />for Indonesia
          </h1>

          <p style={{ 
            fontSize: '1.25rem', 
            maxWidth: 900, 
            margin: '0 auto', 
            color: 'var(--text-secondary)', 
            lineHeight: 1.7,
            fontWeight: 500
          }}>
            <strong style={{ color: 'var(--primary)' }}>Sehatra</strong> merupakan singkatan dari <strong>Smart Healthcare Transformation for Indonesia</strong>, 
            yang mencerminkan transformasi pelayanan kesehatan menuju sistem yang lebih modern, cerdas, dan terintegrasi. 
            Nama "Sehatra" juga berasal dari kata <strong style={{ color: 'var(--success)' }}>"sehat"</strong> yang merepresentasikan 
            tujuan utama platform, yaitu meningkatkan kualitas kesehatan masyarakat Indonesia melalui pemanfaatan teknologi digital.
          </p>
        </div>

        {/* What is Sehatra Section */}
        <div className="about-card">
          <div style={{ 
            position: 'absolute', 
            top: -20, 
            left: 40,
            background: 'var(--primary)',
            padding: '8px 20px',
            border: 'var(--border-brutal)',
            borderRadius: 'var(--radius-brutal)',
            boxShadow: '4px 4px 0px #000000',
            fontWeight: 900,
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            color: '#000000'
          }}>
            <Smartphone size={18} style={{ display: 'inline', marginRight: 8 }} />
            Apa itu Sehatra?
          </div>

          <div style={{ marginTop: 20 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 24, textTransform: 'uppercase' }}>
              All-in-One Smart Healthcare Platform
            </h2>
            
            <div style={{ 
              fontSize: '1.05rem', 
              color: 'var(--text-secondary)', 
              lineHeight: 1.8, 
              marginBottom: 24 
            }}>
              <p style={{ marginBottom: 20 }}>
                Sehatra merupakan platform kesehatan digital (<em>digital health platform</em>) berbasis <strong>Artificial Intelligence (AI)</strong> yang 
                dirancang untuk menghadirkan pelayanan kesehatan modern yang lebih <strong style={{ color: 'var(--primary)' }}>personal</strong>, <strong style={{ color: 'var(--success)' }}>preventif</strong>, 
                <strong style={{ color: 'var(--warning)' }}> interaktif</strong>, dan <strong style={{ color: 'var(--danger)' }}>terintegrasi</strong> dalam satu aplikasi.
              </p>
              
              <p style={{ marginBottom: 20 }}>
                Sehatra mengusung konsep <strong>"All-in-One Smart Healthcare Platform"</strong>, yaitu platform yang menggabungkan berbagai layanan 
                kesehatan dalam satu sistem digital sehingga masyarakat dapat memperoleh akses layanan kesehatan dengan lebih <strong>mudah</strong>, 
                <strong> cepat</strong>, dan <strong>efisien</strong>.
              </p>
            </div>

            <div style={{ 
              background: 'var(--bg-dark)', 
              border: 'var(--border-brutal)', 
              borderRadius: 'var(--radius-sm)',
              padding: 24,
              boxShadow: '4px 4px 0px #000000',
              marginBottom: 24
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <TrendingUp size={24} style={{ color: 'var(--success)' }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, textTransform: 'uppercase' }}>
                  Keunggulan Sehatra
                </h3>
              </div>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Berbeda dengan aplikasi kesehatan konvensional yang umumnya hanya menyediakan layanan konsultasi atau 
                penyimpanan data kesehatan, Sehatra hadir sebagai <strong style={{ color: 'var(--primary-light)' }}>ekosistem smart healthcare</strong> yang 
                mengintegrasikan teknologi <strong>Artificial Intelligence (AI)</strong>, <strong>Internet of Things (IoT)</strong>, 
                <strong> wearable device</strong>, serta layanan kesehatan digital berbasis data secara <strong style={{ color: 'var(--success)' }}>realtime</strong>.
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
              gap: 16 
            }}>
              {[
                { icon: <Heart size={20} />, label: 'Personal', color: 'var(--danger)' },
                { icon: <ShieldAlert size={20} />, label: 'Preventif', color: 'var(--success)' },
                { icon: <Brain size={20} />, label: 'Interaktif', color: 'var(--primary)' },
                { icon: <Activity size={20} />, label: 'Terintegrasi', color: 'var(--warning)' }
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 16,
                  background: item.color,
                  color: '#000000',
                  border: 'var(--border-brutal)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  boxShadow: '3px 3px 0px #000000'
                }}>
                  {item.icon}
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4P Healthcare Concept */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 12, textTransform: 'uppercase' }}>
              Konsep 4P Healthcare
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 700, margin: '0 auto' }}>
              Sehatra mengusung konsep healthcare modern yang berfokus pada 4 pilar utama
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              {
                title: 'Preventive',
                desc: 'Mendorong masyarakat menjaga kesehatan secara preventif melalui pemantauan harian dan deteksi dini',
                icon: <ShieldAlert size={32} />,
                color: 'var(--success)'
              },
              {
                title: 'Predictive',
                desc: 'Menggunakan AI untuk memprediksi risiko penyakit berdasarkan data dan pola kesehatan pengguna',
                icon: <Brain size={32} />,
                color: 'var(--primary)'
              },
              {
                title: 'Personalized',
                desc: 'Memberikan rekomendasi gaya hidup sehat yang disesuaikan dengan kondisi masing-masing pengguna',
                icon: <Heart size={32} />,
                color: 'var(--danger)'
              },
              {
                title: 'Participatory',
                desc: 'Melibatkan pengguna aktif dalam pengelolaan kesehatan mereka sendiri dengan teknologi',
                icon: <Users size={32} />,
                color: 'var(--warning)'
              }
            ].map((concept) => (
              <div key={concept.title} style={{
                background: 'var(--bg-card)',
                border: 'var(--border-brutal)',
                borderRadius: 'var(--radius-brutal)',
                padding: 32,
                boxShadow: '6px 6px 0px #000000',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}>
                <div style={{
                  width: 70,
                  height: 70,
                  background: concept.color,
                  border: 'var(--border-brutal)',
                  borderRadius: 'var(--radius-brutal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '4px 4px 0px #000000',
                  color: '#000000'
                }}>
                  {concept.icon}
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, textTransform: 'uppercase', color: concept.color }}>
                  {concept.title}
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {concept.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Services Section */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 12, textTransform: 'uppercase' }}>
              Layanan Terintegrasi
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 700, margin: '0 auto' }}>
              Seluruh layanan terintegrasi dalam satu platform menciptakan pelayanan kesehatan yang responsif, efisien, dan berorientasi pada kebutuhan masyarakat
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {[
              {
                title: 'Smart AI Health Monitoring & Detection',
                desc: 'Pemantauan kesehatan realtime dengan AI yang dapat mendeteksi anomali dan memberikan peringatan dini',
                icon: <Activity size={24} />,
                bg: 'var(--primary)',
                features: ['Real-time monitoring', 'AI anomaly detection', 'Wearable integration']
              },
              {
                title: 'Smart Emergency System',
                desc: 'Sistem darurat SOS satu tombol dengan pengiriman lokasi GPS otomatis ke kontak dan fasilitas kesehatan terdekat',
                icon: <ShieldAlert size={24} />,
                bg: 'var(--danger)',
                features: ['One-tap SOS', 'GPS tracking', '24/7 response']
              },
              {
                title: 'Family Health Dashboard',
                desc: 'Dashboard terpusat untuk memantau kesehatan seluruh anggota keluarga dalam satu tampilan yang mudah',
                icon: <Users size={24} />,
                bg: 'var(--warning)',
                features: ['Multi-profile', 'Centralized view', 'Family insights']
              },
              {
                title: 'Mental Health Care',
                desc: 'Layanan kesehatan mental dengan skrining mood, tracking stress, dan konsultasi psikolog berlisensi',
                icon: <Brain size={24} />,
                bg: 'hsl(271, 91%, 75%)',
                features: ['Mood tracking', 'PHQ-9 screening', 'Professional support']
              },
              {
                title: 'Integrated Health Record & Service',
                desc: 'Penyimpanan rekam medis digital yang aman dan terintegrasi dengan layanan booking janji temu dokter',
                icon: <Activity size={24} />,
                bg: 'var(--success)',
                features: ['Digital records', 'Doctor booking', 'Secure storage']
              },
              {
                title: 'Smart Disease Detection',
                desc: 'Deteksi dini penyakit menggunakan AI berdasarkan gejala dengan akurasi tinggi dan rekomendasi spesialis',
                icon: <Activity size={24} />,
                bg: 'hsl(199, 89%, 65%)',
                features: ['AI diagnosis', '98% accuracy', 'Specialist recommendation']
              },
              {
                title: 'Healthy Living Assistant',
                desc: 'Asisten digital untuk manajemen obat, tracking goal kesehatan, dan rekomendasi gaya hidup sehat personal',
                icon: <Heart size={24} />,
                bg: 'hsl(350, 89%, 70%)',
                features: ['Medication reminder', 'Health goals', 'Lifestyle tips']
              }
            ].map((service) => (
              <div key={service.title} style={{
                background: 'var(--bg-card)',
                border: 'var(--border-brutal)',
                borderRadius: 'var(--radius-brutal)',
                padding: 28,
                boxShadow: '6px 6px 0px #000000',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  width: 60,
                  height: 60,
                  background: service.bg,
                  border: 'var(--border-brutal)',
                  borderRadius: 'var(--radius-brutal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  boxShadow: '4px 4px 0px #000000',
                  color: '#000000'
                }}>
                  {service.icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: 12, textTransform: 'uppercase', lineHeight: 1.3 }}>
                  {service.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>
                  {service.desc}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {service.features.map((feature, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', fontWeight: 600 }}>
                      <CheckCircle size={14} style={{ color: service.bg }} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vision Section */}
        <div className="about-card-dark">
          <Lightbulb size={48} style={{ color: 'var(--warning)', marginBottom: 20 }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24, textTransform: 'uppercase' }}>
            Menuju Society 5.0
          </h2>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'var(--text-secondary)', maxWidth: 900, margin: '0 auto' }}>
            Dengan konsep tersebut, Sehatra diharapkan dapat menjadi <strong style={{ color: 'var(--primary-light)' }}>inovasi digital health platform</strong> yang 
            mendukung transformasi pelayanan kesehatan modern di Indonesia, sekaligus mewujudkan sistem kesehatan yang 
            lebih <strong style={{ color: 'var(--success)' }}>cerdas</strong>, <strong style={{ color: 'var(--primary)' }}>inklusif</strong>, 
            dan <strong style={{ color: 'var(--warning)' }}>berkelanjutan</strong> di era <strong>Society 5.0</strong>.
          </p>
        </div>
        <div className="about-card">
          <div style={{ 
            position: 'absolute', 
            top: -20, 
            left: 40,
            background: 'var(--warning)',
            padding: '8px 20px',
            border: 'var(--border-brutal)',
            borderRadius: 'var(--radius-brutal)',
            boxShadow: '4px 4px 0px #000000',
            fontWeight: 900,
            fontSize: '0.9rem',
            textTransform: 'uppercase'
          }}>
            <Target size={18} style={{ display: 'inline', marginRight: 8 }} />
            Misi Kami
          </div>

          <div className="about-grid-split">
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24, textTransform: 'uppercase', lineHeight: 1.2 }}>
                Membuat Kesehatan<br />Berkualitas<br />
                <span style={{ color: 'var(--success)' }}>Accessible for All</span>
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
                Kami percaya bahwa setiap orang berhak mendapatkan akses mudah ke layanan kesehatan berkualitas. 
                Dengan teknologi AI dan IoT, Sehatra mentransformasi cara masyarakat Indonesia menjaga kesehatan mereka.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {features.map((f) => (
                  <div key={f.text} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    background: 'var(--bg-dark)',
                    border: 'var(--border-brutal)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}>
                    {f.icon}
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'var(--primary)',
              border: 'var(--border-brutal)',
              borderRadius: 'var(--radius-brutal)',
              padding: 40,
              boxShadow: '8px 8px 0px #000000',
              color: '#000000'
            }}>
              <Lightbulb size={48} style={{ marginBottom: 20 }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 16, textTransform: 'uppercase' }}>
                Vision 2030
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, fontWeight: 600 }}>
                Menjadi platform kesehatan digital #1 di Indonesia dengan 5 juta pengguna aktif, 
                terintegrasi penuh dengan BPJS & sistem kesehatan nasional, dan menurunkan angka 
                keterlambatan diagnosis penyakit hingga 70%.
              </p>
            </div>
          </div>
        </div>

        {/* Values Grid */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 12, textTransform: 'uppercase' }}>
              Core Values
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
              Prinsip fundamental yang membentuk setiap keputusan dan inovasi kami
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {values.map((v) => (
              <div key={v.title} style={{
                padding: 32,
                background: 'var(--bg-card)',
                border: 'var(--border-brutal)',
                borderRadius: 'var(--radius-brutal)',
                boxShadow: '6px 6px 0px #000000',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}>
                <div style={{
                  width: 60,
                  height: 60,
                  background: v.bg,
                  border: 'var(--border-brutal)',
                  borderRadius: 'var(--radius-brutal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '4px 4px 0px #000000'
                }}>
                  {v.icon}
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, textTransform: 'uppercase' }}>
                  {v.title}
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div style={{
          background: 'var(--bg-dark)',
          border: 'var(--border-brutal)',
          borderRadius: 'var(--radius-brutal)',
          padding: '60px 40px',
          marginBottom: 80,
          boxShadow: '8px 8px 0px #000000'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 12, textTransform: 'uppercase' }}>
              Sehatra in Numbers
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
              Dampak nyata yang kami ciptakan untuk kesehatan Indonesia
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 32 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 80,
                  height: 80,
                  background: 'var(--primary)',
                  border: 'var(--border-brutal)',
                  borderRadius: 'var(--radius-brutal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '4px 4px 0px #000000',
                  color: '#000000'
                }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--success)', marginBottom: 8 }}>
                  {s.number}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 12, textTransform: 'uppercase' }}>
              Powered by Modern Tech
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 700, margin: '0 auto' }}>
              Stack teknologi terkini untuk performa optimal, keamanan maksimal, dan skalabilitas tinggi
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
            {[
              { name: 'Next.js 16', desc: 'React Framework', color: 'var(--primary)' },
              { name: 'TypeScript', desc: 'Type Safety', color: 'var(--success)' },
              { name: 'Turso/SQLite', desc: 'Edge Database', color: 'var(--warning)' },
              { name: 'TensorFlow', desc: 'AI/ML Engine', color: 'var(--danger)' },
              { name: 'IoT Integration', desc: 'Smart Devices', color: 'hsl(271, 91%, 75%)' },
              { name: 'End-to-End Encryption', desc: 'Data Security', color: 'var(--accent)' }
            ].map((tech) => (
              <div key={tech.name} style={{
                padding: 20,
                background: 'var(--bg-card)',
                border: 'var(--border-brutal)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '3px 3px 0px #000000',
                borderLeft: `6px solid ${tech.color}`
              }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 4 }}>
                  {tech.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {tech.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div style={{
          background: 'var(--success)',
          color: '#000000',
          border: 'var(--border-brutal)',
          borderRadius: 'var(--radius-brutal)',
          padding: '60px 40px',
          textAlign: 'center',
          boxShadow: '10px 10px 0px #000000',
          marginBottom: 40
        }}>
          <Award size={48} style={{ marginBottom: 20 }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 16, textTransform: 'uppercase' }}>
            Siap Memulai Perjalanan Kesehatan Anda?
          </h2>
          <p style={{ fontSize: '1.1rem', marginBottom: 32, fontWeight: 600, maxWidth: 600, margin: '0 auto 32px' }}>
            Bergabunglah dengan ribuan pengguna yang sudah merasakan transformasi kesehatan digital bersama Sehatra
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn" style={{
              background: '#000000',
              color: 'var(--success)',
              border: '3px solid #000000',
              padding: '16px 40px',
              fontSize: '1.1rem',
              fontWeight: 900,
              boxShadow: '6px 6px 0px rgba(0,0,0,0.3)'
            }}>
              <CheckCircle size={20} /> Daftar Gratis Sekarang
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{
              padding: '16px 40px',
              fontSize: '1.1rem'
            }}>
              Sudah Punya Akun? Masuk
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer style={{
        padding: '30px 40px',
        borderTop: 'var(--border-brutal)',
        background: 'var(--bg-card)',
        textAlign: 'center',
        zIndex: 1
      }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          © {new Date().getFullYear()} Sehatra. Transforming Healthcare with AI & Innovation. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
