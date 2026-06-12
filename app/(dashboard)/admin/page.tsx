'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, ShieldCheck, Trash2, AlertTriangle, Activity, FileText, Search, UserCheck, UserX,
  BarChart3, Download, Eye, Filter, RefreshCw, Database, Clock, TrendingUp, Brain, Heart,
  Server, LayoutDashboard, Cpu, Network
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';

interface UserData {
  id: number; name: string; email: string; phone: string; nik: string; bpjs_number: string; role: string;
  created_at: string; blood_type: string; height: number; weight: number; birth_date: string; gender: string;
}

interface Stats {
  totalUsers: number; totalAdmins: number; totalEmergencies: number; totalRecords: number;
  totalDetections: number; totalMoodLogs?: number; totalAssessments?: number; activeToday?: number;
}

interface ActivityLog {
  id: number; user_id: number; user_name: string; action: string; description: string; created_at: string;
}

interface SystemHealth {
  databaseSize: string; totalTables: number; uptime: string; lastBackup: string;
  cpuUsage: string; memoryUsage: string; activeConnections: number; latency: string; status: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system'>('overview');
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
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
        setChartData(d.chartData || null);
      }
    } catch (err) {
      setError('Gagal memuat data utama.');
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
    loadActivityLogs();
    loadSystemHealth();

    const interval = setInterval(() => {
      loadSystemHealth();
    }, 5000);

    return () => clearInterval(interval);
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

  const handleExportCSV = () => {
    const headers = ['ID', 'Nama', 'Email', 'NIK', 'BPJS', 'Phone', 'Role', 'Gender', 'Blood Type', 'Terdaftar'];
    const rows = users.map(u => [
      u.id, u.name, u.email, u.nik || '-', u.bpjs_number || '-', u.phone || '-', u.role, u.gender || '-', u.blood_type || '-', new Date(u.created_at).toLocaleDateString('id-ID')
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sehatra-users-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setActionMsg('Data berhasil diexport ke CSV!');
    setTimeout(() => setActionMsg(''), 3000);
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
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || u.nik?.includes(searchTerm);
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
          <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>Kembali ke Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-in">
      <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Admin Console</h1>
          <p className="page-subtitle">Pusat kendali, analitik, dan manajemen platform Sehatra.</p>
        </div>
      </div>

      {actionMsg && <div className="success-message" style={{ marginBottom: 24 }}>{actionMsg}</div>}

      {/* TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, borderBottom: '2px solid var(--border)', paddingBottom: 16 }}>
        <button 
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={() => setActiveTab('overview')}
          style={{ gap: 8 }}
        >
          <LayoutDashboard size={16} /> Overview & Analytics
        </button>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={() => setActiveTab('users')}
          style={{ gap: 8 }}
        >
          <Users size={16} /> User Management
        </button>
        <button 
          className={`btn ${activeTab === 'system' ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={() => setActiveTab('system')}
          style={{ gap: 8 }}
        >
          <Server size={16} /> System Diagnostics
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {stats && (
            <div className="grid-4">
              <div className="metric-card">
                <div className="metric-icon" style={{ background: 'var(--primary)', color: '#000' }}><Users size={22} /></div>
                <div className="metric-value">{stats.totalUsers}</div>
                <div className="metric-label">Total Pengguna</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon" style={{ background: 'var(--success)', color: '#000' }}><TrendingUp size={22} /></div>
                <div className="metric-value">{stats.activeToday || 0}</div>
                <div className="metric-label">Aktif Hari Ini</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon" style={{ background: 'var(--danger)', color: '#000' }}><AlertTriangle size={22} /></div>
                <div className="metric-value">{stats.totalEmergencies}</div>
                <div className="metric-label">Total Darurat</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon" style={{ background: 'var(--accent)', color: '#000' }}><Activity size={22} /></div>
                <div className="metric-value">{stats.totalDetections || 0}</div>
                <div className="metric-label">Deteksi Penyakit</div>
              </div>
            </div>
          )}

          {chartData && (
            <div className="grid-2-custom">
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Pertumbuhan Pengguna (6 Bulan)</h3>
                <div style={{ width: '100%', height: 300, minWidth: 0, minHeight: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.growthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" stroke="var(--text-muted)" />
                      <YAxis stroke="var(--text-muted)" />
                      <RechartsTooltip contentStyle={{ background: 'var(--bg-card)', borderColor: '#000' }} />
                      <Legend />
                      <Line type="monotone" dataKey="users" name="Total Users" stroke="var(--primary)" strokeWidth={3} />
                      <Line type="monotone" dataKey="active" name="Active Users" stroke="var(--success)" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Distribusi Aktivitas Platform</h3>
                <div style={{ width: '100%', height: 300, minWidth: 0, minHeight: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.activityData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" stroke="var(--text-muted)" />
                      <YAxis dataKey="name" type="category" width={100} stroke="var(--text-muted)" fontSize={12} />
                      <RechartsTooltip contentStyle={{ background: 'var(--bg-card)', borderColor: '#000' }} />
                      <Bar dataKey="value" fill="var(--accent)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} /> Aktivitas Terkini (Real-time)
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={loadActivityLogs}><RefreshCw size={14} /></button>
            </div>
            <div className="table-container" style={{ maxHeight: 300 }}>
              <table>
                <thead>
                  <tr><th>Waktu</th><th>User</th><th>Aksi</th><th>Deskripsi</th></tr>
                </thead>
                <tbody>
                  {activityLogs.slice(0, 10).map((log, i) => (
                    <tr key={`act-${log.id}-${i}`}>
                      <td style={{ fontSize: '0.85rem' }}>{new Date(log.created_at).toLocaleString('id-ID')}</td>
                      <td>{log.user_name}</td>
                      <td><span className="badge badge-secondary">{log.action}</span></td>
                      <td style={{ fontSize: '0.85rem' }}>{log.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} /> Daftar Semua Pengguna ({filteredUsers.length})
            </h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleExportCSV} title="Export Data"><Download size={16} /> Export CSV</button>
              <div style={{ position: 'relative' }}>
                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="input" style={{ paddingRight: 32, minWidth: 120 }}>
                  <option value="all">Semua Role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <Filter size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg-input)', border: 'var(--border-brutal)', borderRadius: 'var(--radius-brutal)', padding: '8px 14px' }}>
                <Search size={16} style={{ color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Cari nama, email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none' }} />
              </div>
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="card-glass" style={{ marginBottom: 16, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--warning)', borderColor: '#000' }}>
              <span style={{ fontWeight: 700, color: '#000' }}>{selectedUsers.length} pengguna dipilih</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}><Trash2 size={14} /> Hapus Semua</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedUsers([])}>Batal</button>
              </div>
            </div>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}><input type="checkbox" checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0} onChange={() => setSelectedUsers(selectedUsers.length === filteredUsers.length ? [] : filteredUsers.map(u => u.id))} style={{ cursor: 'pointer' }} /></th>
                  <th>Nama</th><th>Email</th><th>Role</th><th>Terdaftar</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                  <tr key={`${u.id}-${i}`} style={{ background: selectedUsers.includes(u.id) ? 'var(--glass-bg)' : undefined }}>
                    <td><input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => setSelectedUsers(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])} style={{ cursor: 'pointer' }} /></td>
                    <td>
                      <div style={{ fontWeight: 800 }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>NIK: {u.nik || '-'}</div>
                    </td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>{u.role?.toUpperCase()}</span></td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedUser(u); setShowUserModal(true); }}><Eye size={14} /></button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleChangeRole(u.id, u.role)} title={u.role === 'admin' ? 'Jadikan User' : 'Jadikan Admin'}>{u.role === 'admin' ? <UserX size={14} /> : <UserCheck size={14} />}</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id, u.name)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan={6} style={{ textAlign: 'center' }}>Tidak ada pengguna ditemukan.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM DIAGNOSTICS */}
      {activeTab === 'system' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="flex-between">
            <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}><Server size={20} /> Diagnostic Overview</h2>
            <div style={{ color: 'var(--success)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="pulse-dot" style={{ width: 8, height: 8, background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }}></span>
              Live Sync (5s)
            </div>
          </div>
          
          {systemHealth ? (
            <div className="grid-3">
              <div className="card-glass" style={{ borderLeft: '5px solid var(--success)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Cpu size={16} /> Server CPU</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Outfit' }}>{systemHealth.cpuUsage}</div>
                <div style={{ fontSize: '0.75rem', marginTop: 4 }}>Healthy Load</div>
              </div>
              <div className="card-glass" style={{ borderLeft: '5px solid var(--warning)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Database size={16} /> RAM / Memory</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Outfit' }}>{systemHealth.memoryUsage}</div>
                <div style={{ fontSize: '0.75rem', marginTop: 4 }}>Allocated usage</div>
              </div>
              <div className="card-glass" style={{ borderLeft: '5px solid var(--primary)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Network size={16} /> Active Connections</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Outfit' }}>{systemHealth.activeConnections}</div>
                <div style={{ fontSize: '0.75rem', marginTop: 4 }}>Current sessions</div>
              </div>
            </div>
          ) : <div className="card">Loading metrics...</div>}

          {systemHealth && (
            <div className="grid-2-custom">
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Database & Storage</h3>
                <table style={{ width: '100%', fontSize: '0.95rem' }}>
                  <tbody>
                    <tr><td style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}><strong>Size:</strong></td><td style={{ textAlign: 'right' }}>{systemHealth.databaseSize}</td></tr>
                    <tr><td style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}><strong>Tables:</strong></td><td style={{ textAlign: 'right' }}>{systemHealth.totalTables}</td></tr>
                    <tr><td style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}><strong>Last Backup:</strong></td><td style={{ textAlign: 'right' }}>{systemHealth.lastBackup}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Network & API</h3>
                <table style={{ width: '100%', fontSize: '0.95rem' }}>
                  <tbody>
                    <tr><td style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}><strong>API Latency:</strong></td><td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 800 }}>{systemHealth.latency}</td></tr>
                    <tr><td style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}><strong>Uptime:</strong></td><td style={{ textAlign: 'right' }}>{systemHealth.uptime}</td></tr>
                    <tr><td style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}><strong>Environment:</strong></td><td style={{ textAlign: 'right' }}><span className="badge badge-primary">PRODUCTION</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Modal ... (simplified but functionally identical) */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3 className="modal-title">Detail Pengguna</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowUserModal(false)}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card-glass" style={{ padding: 16 }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 12 }}>Informasi Akun</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px 16px', fontSize: '0.9rem' }}>
                  <strong>ID:</strong><span>{selectedUser.id}</span>
                  <strong>Nama:</strong><span>{selectedUser.name}</span>
                  <strong>Email:</strong><span>{selectedUser.email}</span>
                  <strong>Role:</strong><span className="badge badge-primary">{selectedUser.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
