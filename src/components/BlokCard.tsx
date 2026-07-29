import type { Blok, IsDurumu } from '../types';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';
import { getBlokRaporlari } from '../store/reportStore';
import { IS_KALEMLERI } from '../data/isKalemleri';

interface Props {
  ada: string;
  blok: Blok;
  onClick?: () => void;
}

export default function BlokCard({ ada, blok, onClick }: Props) {
  const raporlar = getBlokRaporlari(ada, blok.blok_no);
  const isKalemleri = IS_KALEMLERI as readonly string[];
  const tamamlanan = isKalemleri.filter((ik) => {
    const son = raporlar.filter((r) => r.is_kalemi === ik)
      .sort((a, b) => new Date(b.olusturma_tarihi).getTime() - new Date(a.olusturma_tarihi).getTime());
    return son.length > 0 && son[0].durum === 'tamamlandi';
  }).length;

  const geciken = isKalemleri.filter((ik) => {
    const son = raporlar.filter((r) => r.is_kalemi === ik)
      .sort((a, b) => new Date(b.olusturma_tarihi).getTime() - new Date(a.olusturma_tarihi).getTime());
    return son.length > 0 && son[0].durum === 'gecikme';
  }).length;

  const progress = isKalemleri.length > 0 ? Math.round((tamamlanan / isKalemleri.length) * 100) : 0;
  const sonDurum: IsDurumu | null = raporlar.length > 0
    ? raporlar.sort((a, b) => new Date(b.olusturma_tarihi).getTime() - new Date(a.olusturma_tarihi).getTime())[0].durum
    : null;

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        border: '1px solid #f0f0f0',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>
          Blok {blok.blok_no}
        </div>
        {sonDurum && <StatusBadge durum={sonDurum} size="sm" />}
      </div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
        {blok.tip} | {blok.daire_sayisi} Daire | {blok.kat_sayisi} Kat
      </div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
        {blok.yapi_konfigurasyonu}
      </div>
      <ProgressBar value={progress} height={6} label={`${tamamlanan}/${isKalemleri.length} iş kalemi`} />
      {geciken > 0 && (
        <div style={{ marginTop: 6, fontSize: 12, color: '#ef4444', fontWeight: 500 }}>
          ⚠ {geciken} gecikme
        </div>
      )}
    </div>
  );
}
