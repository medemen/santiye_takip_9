import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRaporlar } from '../store/reportStore';
import { blokData } from '../data/blokData';
import ReportCard from '../components/ReportCard';
import { DURUM_LABELLARI } from '../data/isKalemleri';

export default function ReportList() {
  const [searchParams] = useSearchParams();
  const preAda = searchParams.get('ada') || '';
  const preBlok = searchParams.get('blok') || '';

  const [filterAda, setFilterAda] = useState(preAda);
  const [filterBlok, setFilterBlok] = useState(preBlok);
  const [filterDurum, setFilterDurum] = useState('');

  const raporlar = getRaporlar().sort(
    (a, b) => new Date(b.olusturma_tarihi).getTime() - new Date(a.olusturma_tarihi).getTime()
  );

  const filtered = raporlar.filter((r) => {
    if (filterAda && r.ada !== filterAda) return false;
    if (filterBlok && r.blok_no !== parseInt(filterBlok)) return false;
    if (filterDurum && r.durum !== filterDurum) return false;
    return true;
  });

  const adaList = blokData.adalar;

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 16 }}>
        Raporlar
      </h1>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 14,
          marginBottom: 16,
          border: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select
            value={filterAda}
            onChange={(e) => { setFilterAda(e.target.value); setFilterBlok(''); }}
            style={{
              flex: 1,
              minWidth: 100,
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 12,
              backgroundColor: '#fff',
            }}
          >
            <option value="">Tüm Adalar</option>
            {adaList.map((a) => (
              <option key={a.ada} value={a.ada}>{a.ada}</option>
            ))}
          </select>

          <select
            value={filterBlok}
            onChange={(e) => setFilterBlok(e.target.value)}
            style={{
              flex: 1,
              minWidth: 80,
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 12,
              backgroundColor: '#fff',
            }}
          >
            <option value="">Tüm Bloklar</option>
            {filterAda && adaList.find((a) => a.ada === filterAda)?.bloklar.map((b) => (
              <option key={b.blok_no} value={b.blok_no.toString()}>
                Blok {b.blok_no}
              </option>
            ))}
          </select>

          <select
            value={filterDurum}
            onChange={(e) => setFilterDurum(e.target.value)}
            style={{
              flex: 1,
              minWidth: 80,
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 12,
              backgroundColor: '#fff',
            }}
          >
            <option value="">Tüm Durumlar</option>
            {(Object.entries(DURUM_LABELLARI) as [string, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 40,
              color: '#9ca3af',
              backgroundColor: '#fff',
              borderRadius: 12,
              border: '1px solid #f0f0f0',
            }}
          >
            <p style={{ fontSize: 14 }}>Eşleşen rapor bulunamadı</p>
            <p style={{ fontSize: 12 }}>Filtreleri temizleyip tekrar deneyin</p>
          </div>
        ) : (
          filtered.map((r) => <ReportCard key={r.id} rapor={r} />)
        )}
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
        Toplam {filtered.length} rapor
      </div>
    </div>
  );
}
