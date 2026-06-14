'use client';

import { Menu, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  userName: string;
  onOpenSidebar: () => void;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':     { title: 'Dashboard Kesehatan',         subtitle: 'Ikhtisar kondisi kesehatan Anda dan rekomendasi AI' },
  '/monitoring':    { title: 'Health Monitoring',            subtitle: 'Sinkronisasi perangkat kesehatan dan pantau tanda vital Anda' },
  '/emergency':     { title: 'Smart Emergency System',       subtitle: 'Akses cepat bantuan darurat dan kelola kontak darurat' },
  '/records':       { title: 'Integrated Health Records',    subtitle: 'Akses rekam medis digital dan pemesanan layanan kesehatan' },
  '/family':        { title: 'Family Health Dashboard',      subtitle: 'Pantau kesehatan dan kelola pengingat seluruh anggota keluarga' },
  '/mental-health': { title: 'Mental Health Care',           subtitle: 'Mood tracker, analisis kesehatan mental, dan konsultasi' },
  '/detection':     { title: 'Smart Disease Detection',      subtitle: 'Analisis gejala interaktif berbasis AI untuk deteksi dini risiko penyakit' },
  '/healthy-living':{ title: 'Healthy Living Assistant',     subtitle: 'Atur target kesehatan, jadwal obat, dan pengingat harian' },
  '/ai-chat':       { title: 'Asisten Kesehatan AI',         subtitle: 'Konsultasi kesehatan cerdas didukung oleh Qwen AI' },
  '/admin':         { title: 'Admin Panel',                  subtitle: 'Kelola pengguna dan pantau sistem Sehatra' },
};

export default function Header({ userName, onOpenSidebar }: HeaderProps) {
  const pathname = usePathname();
  const info = PAGE_TITLES[pathname] || {
    title: 'Sehatra',
    subtitle: 'Smart Healthcare Transformation for Indonesia',
  };

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
        {/*
          Hamburger button — HANYA muncul di mobile (≤768px).
          Visibilitas sepenuhnya dikontrol oleh globals.css:
            .mobile-menu-btn          → display: none   (desktop default)
            @media (max-width: 768px) → display: flex   (mobile override)

          PENTING: JANGAN taruh display di sini. Inline style akan
          selalu menang atas CSS class dan merusak hide/show logic.
        */}
        <button
          onClick={onOpenSidebar}
          className="mobile-menu-btn"
          aria-label="Buka Menu"
        >
          <Menu size={22} strokeWidth={2.5} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>
            {info.title}
          </h1>
          <p
            className="mobile-hide"
            style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}
          >
            {info.subtitle}
          </p>
        </div>
      </div>

      <div className="flex-gap">
        <button
          className="btn btn-icon btn-secondary"
          style={{ width: 38, height: 38, position: 'relative' }}
          aria-label="Notifikasi"
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--danger)',
            }}
          />
        </button>

        <div className="header-user">
          <div className="header-avatar">{initials}</div>
          <div className="mobile-hide" style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{userName || 'Pengguna'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Profil Kesehatan Aktif
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}