'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  Activity,
  FileText,
  Search,
  UserCheck,
  UserX,
  ChevronDown,
  BarChart3
} from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  nik: string;
  bpjs_number: string;
  role: string;
  created_at: string;
  blood_type: string;
  height: number;
  weight: number;
  birth_date: string;
  gender: string;
}

interface Stats {
  totalUsers: number;
  totalAdmins: number;
  totalEmergencies: number;
  totalRecords: number;
  totalDetections: number;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const router = useRouter();

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.status === 403) {
        setError('Akses ditolak. Anda bukan admin.');
        return;
      }
      if (res.ok) {
        const d = await res.json();
        setUsers(d.users || []);
        setStats(d.stats || null);
      }
    } catch (err) {
      setError('Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Yakin ingin menghapus pengguna "${userName}"? Data ini tidak bisa dikembalikan.`)) return;
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
      const d = await res.json();
      if (res.ok) {
        setActionMsg(`Pengguna "${userName}" berhasil dihapus.`);
        loadData();
        setTimeout(() => setActionMsg(''), 3000);
      } else {
        setActionMsg(d.error);
      }
    } catch {
      setActionMsg('Gagal menghapus pengguna.');
    }
  };

  const handleChangeRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Ubah role menjadi "${newRole}"?`)) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      });
      const d = await res.json();
      if (res.ok) {
        setActionMsg(d.message);
        loadData();
        setTimeout(() => setActionMsg(''), 3000);
      } else {
        setActionMsg(d.error);
      }
    } catch {
      setActionMsg('Gagal mengubah role.');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nik?.includes(searchTerm)
  );

  if (error) {
    return (
      <div className="page-container animate-in">
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <ShieldCheck size={56} style={{ color: 'var(--danger)', marginBottom: 16 }} />
          <h2 style={{ marginBottom: 8 }}>Akses Ditolak</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{error}</p>
          <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-in">
      <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Kelola pengguna, pantau statistik platform Sehatra.</p>
        </div>
      </div>

      {actionMsg && (
        <div className="success-message" style={{ marginBottom: 24 }}>
          {actionMsg}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: 32 }}>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: 'var(--primary)', color: '#000000' }}>
              <Users size={22} />
            </div>
            <div className="metric-value">{stats.totalUsers}</div>
            <div className="metric-label">Total Pengguna</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: 'var(--secondary)', color: '#000000' }}>
              <ShieldCheck size={22} />
            </div>
            <div className="metric-value">{stats.totalAdmins}</div>
            <div className="metric-label">Total Admin</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: 'var(--danger)', color: '#000000' }}>
              <AlertTriangle size={22} />
            </div>
            <div className="metric-value">{stats.totalEmergencies}</div>
            <div className="metric-label">Total Darurat</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: 'var(--success)', color: '#000000' }}>
              <FileText size={22} />
            </div>
            <div className="metric-value">{stats.totalRecords}</div>
            <div className="metric-label">Rekam Medis</div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} /> Daftar Semua Pengguna
          </h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg-input)', border: 'var(--border-brutal)', borderRadius: 'var(--radius-brutal)', padding: '8px 14px', boxShadow: '3px 3px 0px #000000' }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Cari nama, email, NIK..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem', minWidth: 200 }}
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>NIK</th>
                <th>Role</th>
                <th>Terdaftar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 800 }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {u.gender === 'L' ? 'Laki-laki' : u.gender === 'P' ? 'Perempuan' : '-'} | Gol. Darah: {u.blood_type || '-'}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td style={{ fontSize: '0.85rem' }}>{u.nik || '-'}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>
                        {u.role?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(u.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleChangeRole(u.id, u.role)}
                          title={u.role === 'admin' ? 'Jadikan User' : 'Jadikan Admin'}
                        >
                          {u.role === 'admin' ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'var(--danger)', color: '#000000', border: 'var(--border-brutal)', boxShadow: '3px 3px 0px #000000' }}
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          title="Hapus Pengguna"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    {searchTerm ? 'Tidak ada pengguna ditemukan.' : 'Belum ada pengguna terdaftar.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
