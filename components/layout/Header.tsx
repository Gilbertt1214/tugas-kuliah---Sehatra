'use client';

import { Menu, User, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  userName: string;
  onOpenSidebar: () => void;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard Kesehatan', subtitle: 'Ikhtisar kondisi kesehatan Anda dan rekomendasi AI' },
  '/monitoring': { title: 'Health Monitoring', subtitle: 'Sinkronisasi perangkat kesehatan dan pantau tanda vital Anda' },
  '/emergency': { title: 'Smart Emergency System', subtitle: 'Akses cepat bantuan darurat dan kelola kontak darurat' },
  '/records': { title: 'Integrated Health Records', subtitle: 'Akses rekam medis digital dan pemesanan layanan kesehatan' },
  '/family': { title: 'Family Health Dashboard', subtitle: 'Pantau kesehatan dan kelola pengingat seluruh anggota keluarga' },
  '/mental-health': { title: 'Mental Health Care', subtitle: 'Mood tracker, analisis kesehatan mental, dan konsultasi' },
  '/detection': { title: 'Smart Disease Detection', desc: 'Analisis gejala interaktif berbasis AI untuk deteksi dini risiko penyakit' } as any,
  '/healthy-living': { title: 'Healthy Living Assistant', subtitle: 'Atur target kesehatan, jadwal obat, dan pengingat harian' },
  '/ai-chat': { title: 'Asisten Kesehatan AI', subtitle: 'Konsultasi kesehatan cerdas didukung oleh Qwen AI' }
};

export default function Header({ userName, onOpenSidebar }: HeaderProps) {
  const pathname = usePathname();
  const info = PAGE_TITLES[pathname] || { title: 'Sehatra', subtitle: 'Smart Healthcare Transformation for Indonesia' };
  
  // Custom case override for 'detection' due to typing/key helper difference
  const displayTitle = pathname === '/detection' ? 'Smart Disease Detection' : info.title;
  const displaySubtitle = pathname === '/detection' ? 'Analisis gejala interaktif berbasis AI untuk deteksi dini risiko penyakit' : info.subtitle;

  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'US';

  return (
    <header className="header">
      <div className="flex-gap">
        <button 
          onClick={onOpenSidebar} 
          className="btn btn-icon btn-secondary mobile-menu-btn"
          style={{ width: 38, height: 38 }}
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif' }}>{displayTitle}</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }} className="mobile-hide">{displaySubtitle}</p>
        </div>
      </div>

      <div className="flex-gap">
        <button className="btn btn-icon btn-secondary" style={{ width: 38, height: 38, position: 'relative' }}>
          <Bell size={18} />
          <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)' }} />
        </button>
        <div className="header-user">
          <div className="header-avatar">{initials}</div>
          <div className="mobile-hide" style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{userName || 'Pengguna'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Profil Kesehatan Aktif</div>
          </div>
        </div>
      </div>
    </header>
  );
}
