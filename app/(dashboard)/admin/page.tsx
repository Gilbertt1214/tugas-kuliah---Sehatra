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
  BarChart3,
  Download,
  Eye,
  Filter,
  RefreshCw,
  Database,
  Clock,
  TrendingUp,
  Brain,
  Heart
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
  totalMoodLogs?: number;
  totalAssessments?: number;
  activeToday?: number;
}

interface ActivityLog {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  description: string;
  created_at: string;
}

interface SystemHealth {
  databaseSize: string;
  totalTables: number;
  uptime: string;
  lastBackup: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showActivityLogs, setShowActivityLogs] = useState(false);
  const [showSystemHealth, setShowSystemHealth] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
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

  const loadActivityLogs = async () => {
    try {
      const res = await fetch('/api/admin/activity-logs');
      if (res.ok) {
        const d = await res.json();
        setActivityLogs(d.logs || []);
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    }
  };

  const loadSystemHealth = async () => {
    try {
      const res = await fetch('/api/admin/system-health');
      if (res.ok) {
        const d = await res.json();
        setSystemHealth(d);
      }
    } catch (err) {
      console.error('Failed to load system health:', err);
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

  const handleViewUser = (user: UserData) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nama', 'Email', 'NIK', 'BPJS', 'Phone', 'Role', 'Gender', 'Blood Type', 'Terdaftar'];
    const rows = users.map(u => [
      u.id,
      u.name,
      u.email,
      u.nik || '-',
      u.bpjs_number || '-',
      u.phone || '-',
      u.role,
      u.gender || '-',
      u.blood_type || '-',
      new Date(u.created_at).toLocaleDateString('id-ID')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sehatra-users-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    setActionMsg('Data berhasil diexport ke CSV!');
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleToggleSelectUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (!confirm(`Yakin ingin menghapus ${selectedUsers.length} pengguna? Aksi ini tidak bisa dibatalkan.`)) return;
    
    try {
      const res = await fetch('/api/admin/users/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUsers })
      });
      
      if (res.ok) {
        setActionMsg(`${selectedUsers.length} pengguna berhasil dihapus.`);
        setSelectedUsers([]);
        loadData();
        setTimeout(() => setActionMsg(''), 3000);
      } else {
        setActionMsg('Gagal menghapus pengguna.');
      }
    } catch {
      setActionMsg('Terjadi kesalahan.');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nik?.includes(searchTerm);
    
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

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
          <div key="stat-users" className="metric-card">
            <div className="metric-icon" style={{ background: 'var(--primary)', color: '#000000' }}>
              <Users size={22} />
            </div>
            <div className="metric-value">{stats.totalUsers}</div>
            <div className="metric-label">Total Pengguna</div>
          </div>
          <div key="stat-admins" className="metric-card">
            <div className="metric-icon" style={{ background: 'var(--secondary)', color: '#000000' }}>
              <ShieldCheck size={22} />
            </div>
            <div className="metric-value">{stats.totalAdmins}</div>
            <div className="metric-label">Total Admin</div>
          </div>
          <div key="stat-emergencies" className="metric-card">
            <div className="metric-icon" style={{ background: 'var(--danger)', color: '#000000' }}>
              <AlertTriangle size={22} />
            </div>
            <div className="metric-value">{stats.totalEmergencies}</div>
            <div className="metric-label">Total Darurat</div>
          </div>
          <div key="stat-records" className="metric-card">
            <div className="metric-icon" style={{ background: 'var(--success)', color: '#000000' }}>
              <FileText size={22} />
            </div>
            <div className="metric-value">{stats.totalRecords}</div>
            <div className="metric-label">Rekam Medis</div>
          </div>
          <div key="stat-mood" className="metric-card">
            <div className="metric-icon" style={{ background: 'var(--accent)', color: '#000000' }}>
              <Brain size={22} />
            </div>
            <div className="metric-value">{stats.totalMoodLogs || 0}</div>
            <div className="metric-label">Mood Logs</div>
          </div>
          <div key="stat-assessments" className="metric-card">
            <div className="metric-icon" style={{ background: 'var(--accent-light)', color: '#000000' }}>
              <Heart size={22} />
            </div>
            <div className="metric-value">{stats.totalAssessments || 0}</div>
            <div className="metric-label">Assessments</div>
          </div>
          <div key="stat-detections" className="metric-card">
            <div className="metric-icon" style={{ background: '#FF6B9D', color: '#000000' }}>
              <Activity size={22} />
            </div>
            <div className="metric-value">{stats.totalDetections || 0}</div>
            <div className="metric-label">Deteksi Penyakit</div>
          </div>
          <div key="stat-active" className="metric-card">
            <div className="metric-icon" style={{ background: '#4ECDC4', color: '#000000' }}>
              <TrendingUp size={22} />
            </div>
            <div className="metric-value">{stats.activeToday || 0}</div>
            <div className="metric-label">Aktif Hari Ini</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid-3" style={{ marginBottom: 32 }}>
        <button
          key="action-logs"
          className="btn btn-secondary"
          onClick={() => {
            setShowActivityLogs(true);
            loadActivityLogs();
          }}
          style={{ width: '100%', justifyContent: 'center', gap: 8 }}
        >
          <Clock size={18} /> Lihat Activity Logs
        </button>
        <button
          key="action-health"
          className="btn btn-secondary"
          onClick={() => {
            setShowSystemHealth(true);
            loadSystemHealth();
          }}
          style={{ width: '100%', justifyContent: 'center', gap: 8 }}
        >
          <Database size={18} /> System Health
        </button>
        <button
          key="action-export"
          className="btn btn-primary"
          onClick={handleExportCSV}
          style={{ width: '100%', justifyContent: 'center', gap: 8 }}
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} /> Daftar Semua Pengguna ({filteredUsers.length})
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {/* Role Filter */}
            <div style={{ position: 'relative' }}>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="input"
                style={{ paddingRight: 32, minWidth: 120 }}
              >
                <option value="all">Semua Role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <Filter size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
            </div>
            
            {/* Search */}
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
            
            {/* Refresh */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={loadData}
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="card-glass" style={{ marginBottom: 16, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--accent)', borderColor: '#000' }}>
            <span style={{ fontWeight: 700, color: '#000' }}>
              {selectedUsers.length} pengguna dipilih
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleBulkDelete}
              >
                <Trash2 size={14} /> Hapus Semua
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedUsers([])}
              >
                Batal
              </button>
            </div>
          </div>
        )}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
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
                  <tr key={u.id} style={{ background: selectedUsers.includes(u.id) ? 'var(--glass-bg)' : undefined }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.id)}
                        onChange={() => handleToggleSelectUser(u.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
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
                          onClick={() => handleViewUser(u)}
                          title="Lihat Detail"
                        >
                          <Eye size={14} />
                        </button>
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
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    {searchTerm ? 'Tidak ada pengguna ditemukan.' : 'Belum ada pengguna terdaftar.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3 className="modal-title">Detail Pengguna</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowUserModal(false)}>
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>×</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div key="modal-account" className="card-glass" style={{ padding: 16 }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={16} /> Informasi Akun
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px 16px', fontSize: '0.9rem' }}>
                  <strong key="account-id-label">ID:</strong>
                  <span key="account-id-value">{selectedUser.id}</span>
                  
                  <strong key="account-name-label">Nama Lengkap:</strong>
                  <span key="account-name-value">{selectedUser.name}</span>
                  
                  <strong key="account-email-label">Email:</strong>
                  <span key="account-email-value">{selectedUser.email}</span>
                  
                  <strong key="account-phone-label">Telepon:</strong>
                  <span key="account-phone-value">{selectedUser.phone || '-'}</span>
                  
                  <strong key="account-role-label">Role:</strong>
                  <span key="account-role-value" className={`badge ${selectedUser.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>
                    {selectedUser.role?.toUpperCase()}
                  </span>
                  
                  <strong key="account-reg-label">Terdaftar:</strong>
                  <span key="account-reg-value">{new Date(selectedUser.created_at).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div key="modal-identity" className="card-glass" style={{ padding: 16 }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={16} /> Data Identitas
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px 16px', fontSize: '0.9rem' }}>
                  <strong key="identity-nik-label">NIK:</strong>
                  <span key="identity-nik-value">{selectedUser.nik || '-'}</span>
                  
                  <strong key="identity-bpjs-label">No. BPJS:</strong>
                  <span key="identity-bpjs-value">{selectedUser.bpjs_number || '-'}</span>
                  
                  <strong key="identity-birth-label">Tanggal Lahir:</strong>
                  <span key="identity-birth-value">{selectedUser.birth_date ? new Date(selectedUser.birth_date).toLocaleDateString('id-ID') : '-'}</span>
                  
                  <strong key="identity-gender-label">Jenis Kelamin:</strong>
                  <span key="identity-gender-value">{selectedUser.gender === 'L' ? 'Laki-laki' : selectedUser.gender === 'P' ? 'Perempuan' : '-'}</span>
                </div>
              </div>

              <div key="modal-health" className="card-glass" style={{ padding: 16 }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Heart size={16} /> Profil Kesehatan
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px 16px', fontSize: '0.9rem' }}>
                  <strong key="health-blood-label">Golongan Darah:</strong>
                  <span key="health-blood-value">{selectedUser.blood_type || '-'}</span>
                  
                  <strong key="health-height-label">Tinggi Badan:</strong>
                  <span key="health-height-value">{selectedUser.height ? `${selectedUser.height} cm` : '-'}</span>
                  
                  <strong key="health-weight-label">Berat Badan:</strong>
                  <span key="health-weight-value">{selectedUser.weight ? `${selectedUser.weight} kg` : '-'}</span>
                  
                  {selectedUser.height && selectedUser.weight && (
                    <>
                      <strong key="health-bmi-label">BMI:</strong>
                      <span key="health-bmi-value">{((selectedUser.weight / ((selectedUser.height / 100) ** 2)).toFixed(1))}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs Modal */}
      {showActivityLogs && (
        <div className="modal-overlay" onClick={() => setShowActivityLogs(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 800 }}>
            <div className="modal-header">
              <h3 className="modal-title">Activity Logs</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowActivityLogs(false)}>
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>×</span>
              </button>
            </div>

            <div className="table-container" style={{ maxHeight: 400 }}>
              <table>
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>User</th>
                    <th>Aksi</th>
                    <th>Deskripsi</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.length > 0 ? (
                    activityLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.85rem' }}>
                          {new Date(log.created_at).toLocaleString('id-ID')}
                        </td>
                        <td>{log.user_name}</td>
                        <td>
                          <span className="badge badge-secondary">{log.action}</span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{log.description}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Belum ada activity log.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* System Health Modal */}
      {showSystemHealth && (
        <div className="modal-overlay" onClick={() => setShowSystemHealth(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3 className="modal-title">System Health Monitor</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowSystemHealth(false)}>
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>×</span>
              </button>
            </div>

            {systemHealth ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div key="health-db" className="card-glass" style={{ padding: 16 }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Database size={16} /> Database Status
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px 16px', fontSize: '0.9rem' }}>
                    <strong key="db-size-label">Database Size:</strong>
                    <span key="db-size-value">{systemHealth.databaseSize}</span>
                    
                    <strong key="db-tables-label">Total Tables:</strong>
                    <span key="db-tables-value">{systemHealth.totalTables}</span>
                    
                    <strong key="db-status-label">Status:</strong>
                    <span key="db-status-value" className="badge badge-success">HEALTHY</span>
                  </div>
                </div>

                <div key="health-system" className="card-glass" style={{ padding: 16 }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={16} /> System Info
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px 16px', fontSize: '0.9rem' }}>
                    <strong key="sys-uptime-label">Uptime:</strong>
                    <span key="sys-uptime-value">{systemHealth.uptime}</span>
                    
                    <strong key="sys-backup-label">Last Backup:</strong>
                    <span key="sys-backup-value">{systemHealth.lastBackup}</span>
                    
                    <strong key="sys-env-label">Environment:</strong>
                    <span key="sys-env-value" className="badge badge-primary">PRODUCTION</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                Loading system health data...
              </div>
            )}

           
          </div>
        </div>
      )}
    </div>
  );
}
