import { useNavigate } from 'react-router-dom';
import { getIstatistikler, getSonRaporlar, getAdaGenelIlerleme } from '../store/reportStore';
import { blokData } from '../data/blokData';
import { IS_KALEMLERI, DURUM_RENKLERI } from '../data/isKalemleri';
import DonutChart from '../components/DonutChart';
import BarChart from '../components/BarChart';
import ReportCard from '../components/ReportCard';
import ProgressBar from '../components/ProgressBar';

export default function Dashboard() {
  const navigate = useNavigate();
  const stats = getIstatistikler();
  const sonRaporlar = getSonRaporlar(5);

  const donutData = [
    { name: 'Tamamlandı', value: stats.tamamlananIsler, color: DURUM_RENKLERI.tamamlandi },
    { name: 'Devam Ediyor', value: stats.devamEdenIsler, color: DURUM_RENKLERI.devam_ediyor },
    { name: 'Planlandı', value: stats.planlananIsler, color: DURUM_RENKLERI.planlandi },
    { name: 'Gecikme', value: stats.gecikenIsler, color: DURUM_RENKLERI.gecikme },
  ];

  const adaProgress = blokData.adalar.map((a) => ({
    name: a.ada,
    value: getAdaGenelIlerleme(a.ada, a.bloklar, IS_KALEMLERI as readonly string[]),
    color: '#f59e0b',
  }));

  const genelIlerleme =
    blokData.adalar.length > 0
      ? Math.round(
          blokData.adalar.reduce((s, a) => s + getAdaGenelIlerleme(a.ada, a.bloklar, IS_KALEMLERI as readonly string[]), 0) /
            blokData.adalar.length
        )
      : 0;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', margin: 0, marginBottom: 4 }}>
          Güneyşehir Şantiyesi
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
          Şahinbey Belediyesi Toplu Konutları
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 18,
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#4b5563' }}>Genel İlerleme</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: genelIlerleme === 100 ? '#22c55e' : '#f59e0b' }}>
            %{genelIlerleme}
          </span>
        </div>
        <ProgressBar value={genelIlerleme} height={10} />
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#4b5563', margin: 0 }}>
            Rapor Dağılımı
          </h3>
          <button
            onClick={() => navigate('/istatistik')}
            style={{
              background: 'none',
              border: 'none',
              color: '#f59e0b',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Detaylı İstatistik →
          </button>
        </div>
        <DonutChart data={donutData} />
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid #f0f0f0',
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#4b5563', margin: 0, marginBottom: 8 }}>
          Ada Bazında İlerleme
        </h3>
        <BarChart data={adaProgress} />
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#4b5563', margin: 0 }}>
            Son Raporlar
          </h3>
          <button
            onClick={() => navigate('/raporlar')}
            style={{
              background: 'none',
              border: 'none',
              color: '#f59e0b',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Tümü
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sonRaporlar.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: 20 }}>
              Henüz rapor eklenmemiş. İlk raporu eklemek için + butonuna tıklayın.
            </p>
          ) : (
            sonRaporlar.map((r) => <ReportCard key={r.id} rapor={r} />)
          )}
        </div>
      </div>
    </div>
  );
}