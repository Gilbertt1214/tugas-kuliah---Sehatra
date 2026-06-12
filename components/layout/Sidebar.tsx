'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Activity, 
  AlertTriangle, 
  FileText, 
  Users, 
  Brain, 
  Search, 
  Calendar, 
  LogOut,
  Menu,
  X,
  Heart,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

const MENU_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/monitoring', label: 'Health Monitoring', icon: Activity },
  { href: '/emergency', label: 'Smart Emergency', icon: AlertTriangle },
  { href: '/records', label: 'Rekam Medis', icon: FileText },
  { href: '/family', label: 'Kesehatan Keluarga', icon: Users },
  { href: '/mental-health', label: 'Kesehatan Mental', icon: Brain },
  { href: '/detection', label: 'Deteksi Penyakit', icon: Search },
  { href: '/healthy-living', label: 'Gaya Hidup Sehat', icon: Calendar },
  { href: '/ai-chat', label: 'Asisten AI Qwen', icon: MessageSquare },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export default function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/profile', { method: 'DELETE' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Heart size={20} fill="#000000" stroke="#000000" />
        </div>
        <div className="sidebar-logo-text">Seha<span>tra</span></div>
        <button 
          onClick={onClose} 
          className="btn btn-icon btn-secondary mobile-menu-btn" 
          style={{ marginLeft: 'auto', width: 32, height: 32 }}
        >
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">Menu Utama</div>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon className="link-icon" size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {userRole === 'admin' && (
          <>
            <div className="sidebar-section" style={{ marginTop: 16 }}>Administrator</div>
            <Link 
              href="/admin"
              className={`sidebar-link ${pathname === '/admin' ? 'active' : ''}`}
              onClick={onClose}
            >
              <ShieldCheck className="link-icon" size={18} />
              <span>Admin Panel</span>
            </Link>
          </>
        )}
      </nav>

      <div style={{ marginTop: 'auto', padding: '16px 0 0 0', borderTop: '1px solid var(--glass-border)' }}>
        <button className="sidebar-link" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
          <LogOut className="link-icon" size={18} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
