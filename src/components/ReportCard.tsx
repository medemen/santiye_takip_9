import type { Rapor } from '../types';
import StatusBadge from './StatusBadge';
import { formatDateTime } from '../utils/helpers';

interface Props {
  rapor: Rapor;
  onClick?: () => void;
}

export default function ReportCard({ rapor, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid #f3f4f6',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>
          {rapor.ada} - Blok {rapor.blok_no}
        </div>
        <StatusBadge durum={rapor.durum} size="sm" />
      </div>
      <div style={{ fontSize: 13, color: '#4b5563', marginBottom: 4 }}>
        <span style={{ fontWeight: 600 }}>{rapor.is_kalemi}</span>
        {rapor.ilerleme_yuzde > 0 && rapor.durum !== 'tamamlandi' && (
          <span style={{ marginLeft: 8, color: '#6b7280' }}>%{rapor.ilerleme_yuzde}</span>
        )}
      </div>
      {rapor.aciklama && (
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6, lineHeight: 1.4 }}>
          {rapor.aciklama}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af' }}>
        <span>{rapor.raporlayan}</span>
        <span>{formatDateTime(rapor.olusturma_tarihi)}</span>
      </div>
    </div>
  );
}
