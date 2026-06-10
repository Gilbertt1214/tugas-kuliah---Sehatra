'use client';

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Phone, 
  Plus, 
  Trash2, 
  Send,
  User,
  HeartCrack,
  ShieldAlert,
  Loader2
} from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  phone: string;
  relationship: string;
}

interface AlertLog {
  id: number;
  latitude: number;
  longitude: number;
  address: string;
  status: string;
  created_at: string;
}

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for contact
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Keluarga');
  const [submittingContact, setSubmittingContact] = useState(false);

  // SOS state
  const [sosActive, setSosActive] = useState(false);
  const [sosStatus, setSosStatus] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch('/api/emergency');
      if (res.ok) {
        const d = await res.json();
        setContacts(d.contacts || []);
        setAlerts(d.alerts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setSubmittingContact(true);
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          name,
          phone,
          relationship
        })
      });
      if (res.ok) {
        setName('');
        setPhone('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingContact(false);
    }
  };

  const handleDeleteContact = async (id: number) => {
    try {
      const res = await fetch(`/api/emergency?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerSOS = () => {
    setSosActive(true);
    setSosStatus('Mendapatkan lokasi GPS...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoords({ lat, lng });
          
          setSosStatus('Mengirimkan koordinat lokasi ke database & instansi kesehatan...');
          
          try {
            const res = await fetch('/api/emergency', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'alert',
                latitude: lat,
                longitude: lng,
                address: `Koordinat GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                message: 'DARURAT! Pengguna menekan tombol SOS Sehatra. Lokasi terlampir!'
              })
            });

            if (res.ok) {
              setSosStatus('SOS Sukses dikirim! Notifikasi terkirim ke kontak darurat Anda.');
              setTimeout(() => {
                loadData();
              }, 1000);
            } else {
              setSosStatus('Gagal mengirimkan notifikasi SOS ke server.');
            }
          } catch (err) {
            setSosStatus('Koneksi bermasalah saat mengirimkan SOS.');
          }
        },
        async (error) => {
          console.error(error);
          setSosStatus('Gagal mendapatkan GPS. Mengirim darurat tanpa koordinat...');
          // Send SOS without coordinates
          try {
            await fetch('/api/emergency', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'alert',
                message: 'DARURAT! Bantuan dibutuhkan (Lokasi GPS tidak aktif)'
              })
            });
            setSosStatus('SOS Terkirim ke server (Tanpa lokasi GPS).');
            loadData();
          } catch {
            setSosStatus('Gagal terhubung.');
          }
        }
      );
    } else {
      setSosStatus('Geolocation tidak didukung oleh browser Anda.');
    }
  };

  return (
    <div className="page-container animate-in">
      <div className="grid-2-custom" style={{ alignItems: 'start' }}>
        {/* SOS Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 24px' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', marginBottom: 20 }}>
            <ShieldAlert size={22} />
            Smart SOS Trigger
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 32 }}>
            Tekan tombol di bawah dalam situasi darurat. Sistem akan langsung mengirimkan koordinat lokasi Anda ke instansi ambulans & kontak darurat.
          </p>

          <button className="emergency-btn" onClick={triggerSOS} disabled={sosActive && sosStatus.includes('Mendapatkan')}>
            {sosActive ? 'SOS AKTIF' : 'SOS'}
          </button>

          {sosActive && (
            <div style={{ marginTop: 32, padding: 16, background: 'var(--danger)', border: 'var(--border-brutal)', borderRadius: 'var(--radius-brutal)', width: '100%', color: '#000000', boxShadow: '4px 4px 0px #000000' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <Loader2 size={16} className="animate-spin" style={{ color: '#000000' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#000000' }}>Status Darurat</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#000000', fontWeight: 700 }}>{sosStatus}</p>
              {coords && (
                <div style={{ marginTop: 12, fontSize: '0.75rem', color: '#000000', display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                  <MapPin size={12} />
                  <span>Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}</span>
                </div>
              )}
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 12, width: '100%' }} onClick={() => { setSosActive(false); setCoords(null); }}>
                Batalkan SOS
              </button>
            </div>
          )}
        </div>

        {/* Contacts & Logs Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Contacts Manager */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={18} style={{ color: 'var(--success)' }} />
              Kontak Darurat
            </h3>
            
            {contacts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {contacts.map((c) => (
                  <div key={c.id} className="flex-between" style={{ padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-brutal)', border: 'var(--border-brutal)' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-brutal)', background: 'var(--primary)', border: '2px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000000' }}>
                        <User size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{c.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.phone} ({c.relationship})</div>
                      </div>
                    </div>
                    <button className="btn btn-secondary btn-icon" onClick={() => handleDeleteContact(c.id)} style={{ width: 32, height: 32, color: 'var(--danger)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24, textAlign: 'center', padding: '16px 0' }}>
                Belum ada kontak darurat ditambahkan. Silakan tambahkan minimal satu kontak.
              </p>
            )}

            <form onSubmit={handleAddContact} className="grid-form-3">
              <div className="input-group">
                <label>Nama Kontak</label>
                <input className="input" placeholder="Nama lengkap" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>No. HP / Telepon</label>
                <input className="input" placeholder="08xxxxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Hubungan</label>
                <select className="input" value={relationship} onChange={e => setRelationship(e.target.value)}>
                  <option>Keluarga</option>
                  <option>Teman</option>
                  <option>Tetangga</option>
                  <option>Lainnya</option>
                </select>
              </div>
              <button className="btn btn-primary" type="submit" disabled={submittingContact} style={{ gridColumn: 'span 3', marginTop: 8 }}>
                <Plus size={16} /> Tambah Kontak Darurat
              </button>
            </form>
          </div>

          {/* SOS Alert Logs */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Riwayat Pemicu SOS</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Waktu Pemicu</th>
                    <th>Lokasi / Alamat</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.length > 0 ? (
                    alerts.map((al) => (
                      <tr key={al.id}>
                        <td>{new Date(al.created_at).toLocaleString('id-ID')}</td>
                        <td style={{ fontSize: '0.8rem' }}>{al.address || 'GPS tidak terdeteksi'}</td>
                        <td>
                          <span className={`badge ${al.status === 'active' ? 'badge-danger' : 'badge-success'}`}>
                            {al.status === 'active' ? 'Aktif / Respons' : 'Selesai'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Belum ada riwayat keadaan darurat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
