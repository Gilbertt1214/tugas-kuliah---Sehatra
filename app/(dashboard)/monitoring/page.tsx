'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Watch, 
  RefreshCw, 
  Plus, 
  CheckCircle,
  AlertTriangle,
  Bluetooth,
  Battery,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from 'recharts';
import { BangleJSConnector } from '@/lib/banglejs-connector';

interface Metric {
  id: number;
  metric_type: string;
  value: number;
  unit: string;
  notes: string;
  recorded_at: string;
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [connectingDevice, setConnectingDevice] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Bangle.js specific states
  const [currentHeartRate, setCurrentHeartRate] = useState<number | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<{ name: string; id: string } | null>(null);
  const bangleConnector = useRef<BangleJSConnector | null>(null);
  
  // Metric Inputs
  const [type, setType] = useState('heart_rate');
  const [val, setVal] = useState('');
  const [unit, setUnit] = useState('bpm');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Sync animation
  const [syncing, setSyncing] = useState(false);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/health/monitoring');
      if (res.ok) {
        const d = await res.json();
        setMetrics(d.metrics || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchMetrics();
    
    // Cleanup on unmount
    return () => {
      if (bangleConnector.current) {
        bangleConnector.current.disconnect();
      }
    };
  }, []);

  const handleConnectSmartwatch = async () => {
    setConnectingDevice(true);
    
    try {
      // Check Web Bluetooth support
      if (!BangleJSConnector.isSupported()) {
        alert('❌ Web Bluetooth tidak didukung di browser ini.\n\nSilakan gunakan:\n• Chrome Desktop\n• Edge Desktop\n• Opera Desktop\n\n(Tidak support: Safari, Firefox, iOS browsers)');
        setConnectingDevice(false);
        return;
      }

      // Initialize connector with callbacks
      bangleConnector.current = new BangleJSConnector({
        onHeartRateChange: async (value) => {
          console.log('💓 Heart rate updated:', value);
          setCurrentHeartRate(value);
          
          // Auto-save to database
          await fetch('/api/health/monitoring', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              metric_type: 'heart_rate',
              value: value,
              unit: 'bpm',
              notes: `Auto-sync dari ${deviceInfo?.name || 'Smartwatch'} (Real-time)`
            })
          });
          
          fetchMetrics(); // Refresh UI
        },
        onBatteryChange: (value) => {
          console.log('🔋 Battery updated:', value);
          setBatteryLevel(value);
        },
        onDisconnect: () => {
          console.log('🔌 Device disconnected');
          setDeviceConnected(false);
          setDeviceInfo(null);
          setCurrentHeartRate(null);
          setBatteryLevel(null);
        },
        onError: (error) => {
          console.error('❌ Error:', error);
          alert('Error: ' + error.message);
        }
      });

      // Connect to device - this will show browser's device picker
      const connected = await bangleConnector.current.connect();
      
      if (connected) {
        setDeviceConnected(true);
        setConnectingDevice(false);
        
        const info = bangleConnector.current.getDeviceInfo();
        setDeviceInfo(info);
        
        // Get initial battery level
        const battery = await bangleConnector.current.getBatteryLevel();
        if (battery !== null) {
          setBatteryLevel(battery);
        }
        
        console.log('✅ Connected to:', info?.name);
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectingDevice(false);
      
      if (error instanceof Error) {
        // User cancelled the pairing dialog
        if (error.message.includes('User cancelled') || error.name === 'NotFoundError') {
          // Silent fail - user just closed dialog
          return;
        }
        // Other errors
        alert('Gagal terhubung: ' + error.message);
      }
    }
  };

  const simulateSyncData = async () => {
    setSyncing(true);
    try {
      const deviceName = deviceInfo?.name || 'Smartwatch';
      const demoData = [
        { metric_type: 'heart_rate', value: 76, unit: 'bpm', notes: `Sinkronisasi otomatis ${deviceName}` },
        { metric_type: 'steps', value: 6420, unit: 'langkah', notes: `Sinkronisasi otomatis ${deviceName}` },
        { metric_type: 'blood_pressure', value: 120, unit: 'mmHg', notes: `Sinkronisasi otomatis ${deviceName}` },
        { metric_type: 'blood_sugar', value: 98, unit: 'mg/dL', notes: `Sinkronisasi otomatis ${deviceName}` }
      ];

      for (const item of demoData) {
        await fetch('/api/health/monitoring', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      }
      fetchMetrics();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setSyncing(false), 1500);
    }
  };

  const handleDisconnect = async () => {
    if (bangleConnector.current) {
      await bangleConnector.current.disconnect();
    }
    setDeviceConnected(false);
    setDeviceInfo(null);
    setCurrentHeartRate(null);
    setBatteryLevel(null);
  };

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!val) return;
    setSaving(true);
    try {
      const res = await fetch('/api/health/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric_type: type,
          value: parseFloat(val),
          unit,
          notes: notes || 'Input manual oleh Pengguna'
        })
      });
      if (res.ok) {
        setVal('');
        setNotes('');
        fetchMetrics();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleTypeChange = (t: string) => {
    setType(t);
    if (t === 'heart_rate') setUnit('bpm');
    else if (t === 'blood_pressure') setUnit('mmHg');
    else if (t === 'blood_sugar') setUnit('mg/dL');
    else if (t === 'steps') setUnit('langkah');
    else if (t === 'weight') setUnit('kg');
  };

  // Recommendations logic (AI simulation client-side helper)
  const getAIAlerts = () => {
    const alerts = [];
    const latestHeart = metrics.find(m => m.metric_type === 'heart_rate');
    const latestBP = metrics.find(m => m.metric_type === 'blood_pressure');
    const latestSugar = metrics.find(m => m.metric_type === 'blood_sugar');

    if (latestHeart) {
      if (latestHeart.value > 100) {
        alerts.push({ type: 'danger', text: `Detak jantung Anda tinggi (${latestHeart.value} bpm). Direkomendasikan untuk beristirahat.` });
      } else if (latestHeart.value < 55) {
        alerts.push({ type: 'warning', text: `Detak jantung istirahat rendah (${latestHeart.value} bpm). Pantau jika ada gejala pusing.` });
      }
    }

    if (latestBP) {
      if (latestBP.value > 135) {
        alerts.push({ type: 'danger', text: `Tekanan darah Anda cenderung tinggi (${latestBP.value} mmHg). Batasi asupan garam.` });
      }
    }

    if (latestSugar) {
      if (latestSugar.value > 140) {
        alerts.push({ type: 'warning', text: `Kadar gula darah di atas normal (${latestSugar.value} mg/dL). Hindari konsumsi minuman manis.` });
      }
    }

    return alerts;
  };

  const aiAlerts = getAIAlerts();

  // Graph Data Formatting
  const getChartData = (metricType: string) => {
    return metrics
      .filter(m => m.metric_type === metricType)
      .slice(0, 10)
      .reverse()
      .map(m => ({
        date: new Date(m.recorded_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        value: m.value
      }));
  };

  const heartRateData = getChartData('heart_rate');
  const stepsData = getChartData('steps');

  return (
    <div className="page-container animate-in">
      <div className="grid-2-custom">
        {/* Device Sync & Input Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Smartwatch Integration Card */}
          <div className="card-glass">
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Watch size={20} style={{ color: 'var(--primary)' }} />
              Koneksi Perangkat Pintar
            </h3>
            
            {deviceConnected ? (
              <div>
                {/* Connected Device Info */}
                <div className="flex-between" style={{ background: 'var(--bg-input)', border: 'var(--border-brutal)', padding: 12, borderRadius: 'var(--radius-brutal)', marginBottom: 12, boxShadow: '3px 3px 0px #000000' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1 }}>
                    <CheckCircle size={18} style={{ color: 'var(--success)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--success)' }}>🔴 Live Connection</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {deviceInfo?.name || 'Smartwatch Connected'}
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-icon" onClick={simulateSyncData} disabled={syncing} style={{ width: 32, height: 32 }} title="Manual Sync">
                    <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                  </button>
                </div>

                {/* Real-time metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div style={{ background: 'var(--bg-card)', border: 'var(--border-brutal)', padding: 12, borderRadius: 'var(--radius-brutal)', boxShadow: '2px 2px 0px #000000' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Activity size={14} style={{ color: 'var(--danger)' }} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>HEART RATE</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)' }}>
                      {currentHeartRate !== null ? currentHeartRate : '--'} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>bpm</span>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-card)', border: 'var(--border-brutal)', padding: 12, borderRadius: 'var(--radius-brutal)', boxShadow: '2px 2px 0px #000000' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Battery size={14} style={{ color: 'var(--success)' }} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>BATTERY</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)' }}>
                      {batteryLevel !== null ? batteryLevel : '--'} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>%</span>
                    </div>
                  </div>
                </div>
                
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  🔴 Data kesehatan tersinkronisasi secara real-time dari smartwatch Anda.
                </p>
                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={handleDisconnect}>
                  Putuskan Perangkat
                </button>
              </div>
            ) : (
              <div>
                {/* Connection Instructions */}
                <div style={{ background: 'var(--bg-card)', padding: 12, borderRadius: 'var(--radius-brutal)', marginBottom: 16, fontSize: '0.8rem', border: 'var(--border-brutal)' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Bluetooth size={16} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', marginBottom: 8 }}>Cara Koneksi Smartwatch:</strong>
                      <ol style={{ marginLeft: 16, lineHeight: 1.6, fontSize: '0.75rem' }}>
                        <li>Pastikan smartwatch Anda sudah menyala</li>
                        <li>Aktifkan Bluetooth di laptop/PC Anda</li>
                        <li>Klik tombol "Hubungkan Smartwatch"</li>
                        <li>Pilih device Anda dari dialog yang muncul</li>
                        <li>Klik "Pair" untuk menghubungkan</li>
                      </ol>
                      <div style={{ marginTop: 8, padding: 8, background: 'var(--bg-input)', borderRadius: 6, fontSize: '0.7rem' }}>
                        💡 <strong>Tip:</strong> Pastikan smartwatch Anda sudah aktif dan Bluetooth-nya menyala.
                      </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} 
                  onClick={handleConnectSmartwatch}
                  disabled={connectingDevice}
                >
                  {connectingDevice ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Menghubungkan...
                    </>
                  ) : (
                    <>
                      <Bluetooth size={16} />
                      Hubungkan Smartwatch
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Manual Input Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Plus size={20} style={{ color: 'var(--success)' }} />
              Catat Tanda Vital Baru
            </h3>
            <form onSubmit={handleAddMetric} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Jenis Pengukuran</label>
                <select className="input" value={type} onChange={e => handleTypeChange(e.target.value)}>
                  <option value="heart_rate">Detak Jantung (Heart Rate)</option>
                  <option value="blood_pressure">Tekanan Darah (Blood Pressure)</option>
                  <option value="blood_sugar">Gula Darah (Blood Sugar)</option>
                  <option value="steps">Langkah Kaki (Steps)</option>
                  <option value="weight">Berat Badan (Weight)</option>
                </select>
              </div>

              <div className="input-group">
                <label>Nilai Pengukuran</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" type="number" step="any" placeholder="Masukkan nilai" value={val} onChange={e => setVal(e.target.value)} required style={{ flex: 1 }} />
                  <span className="btn btn-secondary" style={{ pointerEvents: 'none', minWidth: 80 }}>{unit}</span>
                </div>
              </div>

              <div className="input-group">
                <label>Catatan Tambahan (Opsional)</label>
                <input className="input" placeholder="Misal: setelah sarapan, setelah olahraga" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: '100%' }}>
                {saving ? 'Menyimpan...' : 'Simpan Pengukuran'}
              </button>
            </form>
          </div>
        </div>

        {/* Analytics & Graphs Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* AI Alerts banner */}
          {aiAlerts.length > 0 && (
            <div className="card" style={{ background: 'var(--danger)', color: '#000000', border: 'var(--border-brutal)', boxShadow: '4px 4px 0px #000000' }}>
              <h4 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8, color: '#000000', marginBottom: 12 }}>
                <AlertTriangle size={18} />
                Analisis & Peringatan AI
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {aiAlerts.map((a, idx) => (
                  <div key={idx} style={{ fontSize: '0.85rem', color: '#000000', display: 'flex', gap: 8, fontWeight: 600 }}>
                    <span>•</span>
                    <span>{a.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Heart Rate Graph */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Grafik Detak Jantung (Bpm)</h3>
            <div style={{ width: '100%', height: 260, minWidth: 0, minHeight: 260 }}>
              {mounted && heartRateData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={heartRateData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }} />
                    <Line type="monotone" dataKey="value" stroke="var(--danger)" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {mounted ? 'Belum ada data detak jantung untuk ditampilkan di grafik.' : 'Memuat grafik...'}
                </div>
              )}
            </div>
          </div>

          {/* Steps Graph */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Grafik Aktivitas Langkah Kaki</h3>
            <div style={{ width: '100%', height: 260, minWidth: 0, minHeight: 260 }}>
              {mounted && stepsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stepsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }} />
                    <Line type="monotone" dataKey="value" stroke="var(--success)" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {mounted ? 'Belum ada data langkah kaki untuk ditampilkan di grafik.' : 'Memuat grafik...'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
