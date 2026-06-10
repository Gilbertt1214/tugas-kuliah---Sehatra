'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  Plus, 
  Clock, 
  User, 
  ShieldAlert, 
  Stethoscope,
  ChevronRight,
  Download
} from 'lucide-react';

interface MedicalRecord {
  id: number;
  record_type: string;
  doctor_name: string;
  facility: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  visit_date: string;
}

interface Booking {
  id: number;
  doctor_name: string;
  specialty: string;
  facility: string;
  booking_date: string;
  booking_time: string;
  status: string;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'records' | 'bookings'>('records');

  // Booking Form State
  const [docName, setDocName] = useState('');
  const [specialty, setSpecialty] = useState('Dokter Umum');
  const [facility, setFacility] = useState('Puskesmas Sehatra Center');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookNotes, setBookNotes] = useState('');
  const [bookingProgress, setBookingProgress] = useState(false);

  // Record Form State
  const [recType, setRecType] = useState('Checkup');
  const [recDoc, setRecDoc] = useState('');
  const [recFac, setRecFac] = useState('');
  const [recDiag, setRecDiag] = useState('');
  const [recPresc, setRecPresc] = useState('');
  const [recDate, setRecDate] = useState('');
  const [recNotes, setRecNotes] = useState('');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch('/api/health/records');
      if (res.ok) {
        const d = await res.json();
        setRecords(d.records || []);
        setBookings(d.bookings || []);
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

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !bookDate || !bookTime) return;
    setBookingProgress(true);
    try {
      const res = await fetch('/api/health/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'booking',
          doctor_name: docName,
          specialty,
          facility,
          booking_date: bookDate,
          booking_time: bookTime,
          notes: bookNotes
        })
      });
      if (res.ok) {
        setDocName('');
        setBookDate('');
        setBookTime('');
        setBookNotes('');
        loadData();
        setActiveTab('bookings');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBookingProgress(false);
    }
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recDoc || !recDiag || !recDate) return;
    setSavingRecord(true);
    try {
      const res = await fetch('/api/health/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'record',
          record_type: recType,
          doctor_name: recDoc,
          facility: recFac || 'Puskesmas Sehatra Center',
          diagnosis: recDiag,
          prescription: recPresc,
          notes: recNotes,
          visit_date: recDate
        })
      });
      if (res.ok) {
        setRecDoc('');
        setRecFac('');
        setRecDiag('');
        setRecPresc('');
        setRecDate('');
        setRecNotes('');
        setShowAddRecord(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingRecord(false);
    }
  };

  const getDiagnosisRecommendation = (diagnosis: string) => {
    const d = diagnosis.toLowerCase();
    if (d.includes('hipertensi') || d.includes('darah tinggi')) {
      return 'Kurangi makanan asin/garam. Pantau tekanan darah harian secara rutin.';
    }
    if (d.includes('diabetes') || d.includes('gula darah')) {
      return 'Kurangi konsumsi karbohidrat simpleks/gula. Kontrol kadar glukosa secara terjadwal.';
    }
    if (d.includes('maag') || d.includes('lambung') || d.includes('gastritis')) {
      return 'Makan teratur dengan porsi kecil tapi sering. Hindari makanan asam & pedas.';
    }
    if (d.includes('flu') || d.includes('ispa') || d.includes('batuk')) {
      return 'Perbanyak istirahat tidur malam, minum air hangat, konsumsi makanan bergizi kaya vitamin C.';
    }
    return 'Lakukan kontrol berkala ke dokter Anda sesuai jadwal rekomendasi resep.';
  };

  return (
    <div className="page-container animate-in">
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div className="tabs">
          <button className={`tab ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FileText size={16} /> Rekam Medis Digital
          </button>
          <button className={`tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} /> Booking Dokter / Layanan
          </button>
        </div>
        
        {activeTab === 'records' && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddRecord(true)}>
            <Plus size={16} /> Catat Riwayat Medis
          </button>
        )}
      </div>

      {activeTab === 'records' ? (
        <div className="grid-3-custom">
          {/* Medical Records List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {records.length > 0 ? (
              records.map((rec) => (
                <div key={rec.id} className="card-glass" style={{ borderLeft: '4px solid var(--primary)' }}>
                  <div className="flex-between" style={{ marginBottom: 12 }}>
                    <div>
                      <span className="badge badge-primary" style={{ marginBottom: 4 }}>{rec.record_type}</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{rec.diagnosis}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Oleh {rec.doctor_name} di {rec.facility}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Tanggal: {new Date(rec.visit_date).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                  
                  {rec.prescription && (
                    <div style={{ background: 'var(--bg-input)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: 12 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-light)', marginBottom: 4 }}>Resep Obat:</div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{rec.prescription}</p>
                    </div>
                  )}

                  {rec.notes && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                      <strong>Catatan Dokter:</strong> {rec.notes}
                    </p>
                  )}

                  <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--primary-light)' }}>
                      <Stethoscope size={16} />
                      <span style={{ fontSize: '0.75rem' }}>AI Advice: {getDiagnosisRecommendation(rec.diagnosis)}</span>
                    </div>
                    <button className="btn btn-secondary btn-icon" style={{ width: 28, height: 28 }} title="Unduh File PDF Rekam Medis">
                      <Download size={12} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                <FileText size={48} strokeWidth={1} style={{ marginBottom: 16 }} />
                <p>Belum ada data rekam medis terdaftar.</p>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowAddRecord(true)}>
                  Catat Riwayat Sekarang
                </button>
              </div>
            )}
          </div>

          {/* Records Summary Sidebar */}
          <div>
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Status Integrasi</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-brutal)', border: 'var(--border-brutal)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, background: 'var(--success)', border: '1px solid #000000', display: 'inline-block' }}></span>
                    BPJS SATUSEHAT Aktif
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Data rekam medis Anda tersinkronisasi otomatis dengan portal Kemenkes RI SATUSEHAT.
                  </p>
                </div>
                <div style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-brutal)', border: 'var(--border-brutal)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Total Diagnosis Tersimpan: {records.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Doctor Booking Section */
        <div className="grid-2-custom" style={{ alignItems: 'start' }}>
          {/* Booking Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Stethoscope size={20} style={{ color: 'var(--primary)' }} />
              Buat Janji Dokter
            </h3>
            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Nama Dokter / Spesialisasi *</label>
                <input className="input" placeholder="Contoh: dr. Budi Santoso, Sp.A" value={docName} onChange={e => setDocName(e.target.value)} required />
              </div>

              <div className="input-group">
                <label>Spesialisasi</label>
                <select className="input" value={specialty} onChange={e => setSpecialty(e.target.value)}>
                  <option>Dokter Umum</option>
                  <option>Dokter Spesialis Anak (Sp.A)</option>
                  <option>Dokter Spesialis Jantung (Sp.JP)</option>
                  <option>Dokter Spesialis Kandungan (Sp.OG)</option>
                  <option>Dokter Spesialis Paru (Sp.P)</option>
                  <option>Dokter Gigi</option>
                </select>
              </div>

              <div className="input-group">
                <label>Fasilitas Kesehatan / Rumah Sakit</label>
                <input className="input" placeholder="Nama Rumah Sakit/Klinik" value={facility} onChange={e => setFacility(e.target.value)} />
              </div>

              <div className="grid-equal-2">
                <div className="input-group">
                  <label>Tanggal Kunjungan *</label>
                  <input className="input" type="date" value={bookDate} onChange={e => setBookDate(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Jam Kunjungan *</label>
                  <input className="input" type="time" value={bookTime} onChange={e => setBookTime(e.target.value)} required />
                </div>
              </div>

              <div className="input-group">
                <label>Keluhan / Catatan</label>
                <input className="input" placeholder="Keluhan singkat" value={bookNotes} onChange={e => setBookNotes(e.target.value)} />
              </div>

              <button className="btn btn-primary" type="submit" disabled={bookingProgress}>
                {bookingProgress ? 'Menyimpan...' : 'Booking Layanan Kesehatan'}
              </button>
            </form>
          </div>

          {/* Bookings List */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Jadwal Kunjungan Aktif</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Dokter</th>
                    <th>Spesialis</th>
                    <th>Jadwal</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length > 0 ? (
                    bookings.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{b.doctor_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.facility}</div>
                        </td>
                        <td>{b.specialty}</td>
                        <td>
                          <div>{new Date(b.booking_date).toLocaleDateString('id-ID')}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.booking_time} WIB</div>
                        </td>
                        <td>
                          <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                            {b.status === 'confirmed' ? 'Dikonfirmasi' : 'Menunggu'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Belum ada jadwal konsultasi aktif.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      {showAddRecord && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Catat Riwayat Medis Mandiri</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowAddRecord(false)}>✕</button>
            </div>
            <form onSubmit={handleRecordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Jenis Pelayanan</label>
                <select className="input" value={recType} onChange={e => setRecType(e.target.value)}>
                  <option>Checkup</option>
                  <option>Rawat Jalan</option>
                  <option>Resep Obat</option>
                  <option>Laboratorium</option>
                </select>
              </div>

              <div className="input-group">
                <label>Nama Dokter / Pemeriksa *</label>
                <input className="input" placeholder="Nama Dokter" value={recDoc} onChange={e => setRecDoc(e.target.value)} required />
              </div>

              <div className="input-group">
                <label>Instansi Kesehatan / Klinik</label>
                <input className="input" placeholder="Rumah Sakit / Puskesmas" value={recFac} onChange={e => setRecFac(e.target.value)} />
              </div>

              <div className="input-group">
                <label>Diagnosis Utama *</label>
                <input className="input" placeholder="Contoh: Hipertensi, Gastritis" value={recDiag} onChange={e => setRecDiag(e.target.value)} required />
              </div>

              <div className="input-group">
                <label>Resep Obat (Opsional)</label>
                <textarea className="input" placeholder="Tuliskan nama obat & dosis" value={recPresc} onChange={e => setRecPresc(e.target.value)} />
              </div>

              <div className="input-group">
                <label>Tanggal Pemeriksaan *</label>
                <input className="input" type="date" value={recDate} onChange={e => setRecDate(e.target.value)} required />
              </div>

              <div className="input-group">
                <label>Catatan Tambahan</label>
                <input className="input" placeholder="Keluhan / instruksi tambahan" value={recNotes} onChange={e => setRecNotes(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddRecord(false)} style={{ flex: 1 }}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={savingRecord} style={{ flex: 1 }}>
                  {savingRecord ? 'Menyimpan...' : 'Simpan Riwayat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
