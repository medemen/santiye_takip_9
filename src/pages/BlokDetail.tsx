import { useParams, useNavigate } from 'react-router-dom';
import { blokData } from '../data/blokData';
import { IS_KALEMLERI } from '../data/isKalemleri';
import { getBlokProgress, getBlokRaporlari, getBlokGenelIlerleme } from '../store/reportStore';
import { getSantiyeSefi } from '../data/personelData';
import type { IsDurumu } from '../types';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import ReportCard from '../components/ReportCard';

export default function BlokDetail() {
  const { ada, blokNo } = useParams<{ ada: string; blokNo: string }>();
  const navigate = useNavigate();
  const blokNum = parseInt(blokNo || '0');

  const adaData = blokData.adalar.find((a) => a.ada === ada);
  const blok = adaData?.bloklar.find((b) => b.blok_no === blokNum);

  if (!adaData || !blok) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Blok bulunamadı</div>;
  }

  const progress = getBlokProgress(ada!, blokNum, IS_KALEMLERI);
  const genelIlerleme = getBlokGenelIlerleme(ada!, blokNum, IS_KALEMLERI);
  const santiyeSefi = getSantiyeSefi(ada!);
  const raporlar = getBlokRaporlari(ada!, blokNum).sort(
    (a, b) => new Date(b.olusturma_tarihi).getTime() - new Date(a.olusturma_tarihi).getTime()
  );

  const progressArray = (IS_KALEMLERI).map((ik) => {
    const r = progress[ik];
    return { isKalemi: ik, rapor: r };
  });

  const tamamlanan = progressArray.filter((p) => p.rapor?.durum === 'tamamlandi').length;
  const geciken = progressArray.filter((p) => p.rapor?.durum === 'gecikme').length;
  const devamEden = progressArray.filter((p) => p.rapor?.durum === 'devam_ediyor').length;

  return (
    <div>
      <button
        onClick={() => navigate(`/ada/${ada}`)}
        style={{
          background: 'none',
          border: 'none',
          color: '#f59e0b',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          padding: 0,
          marginBottom: 12,
        }}
      >
        ← {ada}'ya Dön
      </button>

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', margin: 0 }}>
            {ada} - Blok {blok.blok_no}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6, fontSize: 13, color: '#6b7280' }}>
          <span style={{ fontWeight: 600 }}>{blok.tip}</span>
          <span>|</span>
          <span>{blok.daire_sayisi} Daire</span>
          <span>|</span>
          <span>{blok.kat_sayisi} Kat</span>
          <span>|</span>
          <span>{blok.yapi_konfigurasyonu}</span>
        </div>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
          Şantiye Şefi: {santiyeSefi}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            padding: 10,
            backgroundColor: '#f8fafc',
            borderRadius: 10,
            fontSize: 12,
          }}
        >
          <span>✅ {tamamlanan} tamam</span>
          <span>🔵 {devamEden} devam</span>
          <span>⚠️ {geciken} gecikme</span>
          <span style={{ fontWeight: 700, color: '#f59e0b' }}>%{genelIlerleme}</span>
        </div>
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
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#4b5563', margin: 0, marginBottom: 12 }}>
          İş Kalemleri Durumu
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {progressArray.map(({ isKalemi, rapor }) => (
            <div
              key={isKalemi}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 10,
                backgroundColor: rapor?.durum === 'gecikme' ? '#fef2f2' : '#f9fafb',
              }}
            >
              <div style={{ width: 120, fontSize: 12, fontWeight: 500, color: '#374151', flexShrink: 0 }}>
                {isKalemi}
              </div>
              <div style={{ flex: 1 }}>
                <ProgressBar
                  value={rapor?.durum === 'tamamlandi' ? 100 : rapor?.ilerleme_yuzde ?? 0}
                  height={6}
                  color={rapor?.durum === 'gecikme' ? '#ef4444' : undefined}
                />
              </div>
              <div style={{ width: 70, textAlign: 'right', flexShrink: 0 }}>
                {rapor ? (
                  <StatusBadge durum={rapor.durum as IsDurumu} size="sm" />
                ) : (
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button
          onClick={() => navigate(`/rapor-ekle?ada=${ada}&blok=${blok.blok_no}`)}
          style={{
            flex: 1,
            padding: '12px 20px',
            backgroundColor: '#f59e0b',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Rapor Ekle
        </button>
        <button
          onClick={() => navigate(`/raporlar?ada=${ada}&blok=${blok.blok_no}`)}
          style={{
            flex: 1,
            padding: '12px 20px',
            backgroundColor: '#f3f4f6',
            color: '#4b5563',
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Raporları Gör
        </button>
      </div>

      {raporlar.length > 0 && (
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0',
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#4b5563', margin: 0, marginBottom: 12 }}>
            Rapor Geçmişi ({raporlar.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {raporlar.map((r) => (
              <ReportCard key={r.id} rapor={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
