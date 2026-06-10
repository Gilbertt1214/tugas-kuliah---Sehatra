'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  Activity, 
  Heart, 
  Calendar,
  AlertCircle,
  Bell
} from 'lucide-react';

interface FamilyMember {
  id: number;
  name: string;
  relationship: string;
  birth_date: string;
  gender: string;
  blood_type: string;
  allergies: string;
  chronic_conditions: string;
}

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Anak');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('L');
  const [bloodType, setBloodType] = useState('O');
  const [allergies, setAllergies] = useState('');
  const [chronic, setChronic] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/family');
      if (res.ok) {
        const d = await res.json();
        setMembers(d.members || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          relationship,
          birth_date: birthDate,
          gender,
          blood_type: bloodType,
          allergies,
          chronic_conditions: chronic
        })
      });
      if (res.ok) {
        setName('');
        setBirthDate('');
        setAllergies('');
        setChronic('');
        setShowAddForm(false);
        fetchMembers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: number) => {
    try {
      const res = await fetch(`/api/family?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchMembers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper: calculate age from date of birth
  const getAge = (dobString: string) => {
    if (!dobString) return '0 tahun';
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} tahun`;
  };

  // Immunization recommendation list based on relationship/age (AI simulation helper)
  const getImmunizationRecommendation = (member: FamilyMember) => {
    const ageVal = parseInt(getAge(member.birth_date));
    if (member.relationship.toLowerCase() === 'anak' || ageVal < 5) {
      return { type: 'Vaksin Polio & DPT-HB-Hib', schedule: 'Terjadwal: Setiap Bulan' };
    }
    if (ageVal > 55) {
      return { type: 'Vaksin Influenza & Pneumokokus', schedule: 'Terjadwal: Tahunan' };
    }
    return { type: 'Booster Tetanus / COVID-19', schedule: 'Direkomendasikan berkala' };
  };

  return (
    <div className="page-container animate-in">
      <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Kesehatan Keluarga</h1>
          <p className="page-subtitle">Pantau kesehatan anak, istri, suami, atau orang tua Anda secara kolektif.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          <Plus size={18} /> Tambah Anggota Keluarga
        </button>
      </div>

      {/* Grid Cards of Family Members */}
      {members.length > 0 ? (
        <div className="grid-3">
          {members.map((member) => {
            const vaccine = getImmunizationRecommendation(member);
            return (
              <div key={member.id} className="card-glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="flex-between" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div className="header-avatar" style={{ background: 'var(--primary)', width: 44, height: 44, fontSize: '1rem' }}>
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{member.name}</h4>
                        <span className="badge badge-accent">{member.relationship}</span>
                      </div>
                    </div>
                    <button className="btn btn-secondary btn-icon" onClick={() => handleDeleteMember(member.id)} style={{ width: 32, height: 32, color: 'var(--danger)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16, borderBottom: '1px solid var(--glass-border)', paddingBottom: 16 }}>
                    <div className="flex-between"><span>Umur:</span><strong style={{ color: 'var(--text-primary)' }}>{getAge(member.birth_date)}</strong></div>
                    <div className="flex-between"><span>Golongan Darah:</span><strong style={{ color: 'var(--text-primary)' }}>{member.blood_type || '-'}</strong></div>
                    <div className="flex-between"><span>Riwayat Alergi:</span><strong style={{ color: 'var(--danger)' }}>{member.allergies || 'Tidak ada'}</strong></div>
                    <div className="flex-between"><span>Kondisi Kronis:</span><strong style={{ color: 'var(--warning)' }}>{member.chronic_conditions || 'Tidak ada'}</strong></div>
                  </div>

                  {/* Vaccine / Med reminder block */}
                  <div style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-brutal)', border: 'var(--border-brutal)', display: 'flex', gap: 8, alignItems: 'flex-start', boxShadow: '3px 3px 0px #000000' }}>
                    <Bell size={16} style={{ color: 'var(--primary-light)', marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>Pengingat Vaksinasi</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{vaccine.type}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--primary-light)', fontWeight: 800, marginTop: 2 }}>{vaccine.schedule}</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
                  <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                    Lihat Grafik Tanda Vital
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)' }}>
          <Users size={48} strokeWidth={1} style={{ marginBottom: 16 }} />
          <p>Belum ada data anggota keluarga terdaftar.</p>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowAddForm(true)}>
            Tambahkan Anggota Pertama
          </button>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 550 }}>
            <div className="modal-header">
              <h3 className="modal-title">Tambah Anggota Keluarga</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowAddForm(false)}>✕</button>
            </div>
            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Nama Lengkap Anggota Keluarga *</label>
                <input className="input" placeholder="Nama Lengkap" value={name} onChange={e => setName(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label>Hubungan *</label>
                  <select className="input" value={relationship} onChange={e => setRelationship(e.target.value)}>
                    <option>Anak</option>
                    <option>Suami</option>
                    <option>Istri</option>
                    <option>Orang Tua</option>
                    <option>Kakek/Nenek</option>
                    <option>Lainnya</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Jenis Kelamin</label>
                  <select className="input" value={gender} onChange={e => setGender(e.target.value)}>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label>Tanggal Lahir *</label>
                  <input className="input" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} required />
                </div>

                <div className="input-group">
                  <label>Golongan Darah</label>
                  <select className="input" value={bloodType} onChange={e => setBloodType(e.target.value)}>
                    <option>A</option>
                    <option>B</option>
                    <option>AB</option>
                    <option>O</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Riwayat Alergi (Opsional)</label>
                <input className="input" placeholder="Contoh: kacang, debu, obat parasetamol" value={allergies} onChange={e => setAllergies(e.target.value)} />
              </div>

              <div className="input-group">
                <label>Penyakit Kronis / Bawaan (Opsional)</label>
                <input className="input" placeholder="Contoh: asma, tekanan darah tinggi" value={chronic} onChange={e => setChronic(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)} style={{ flex: 1 }}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
                  {submitting ? 'Menyimpan...' : 'Simpan Data Keluarga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
