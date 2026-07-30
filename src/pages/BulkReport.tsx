import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blokData } from '../data/blokData';
import { IS_KALEMLERI, DURUM_LABELLARI } from '../data/isKalemleri';
import { saveRapor } from '../store/reportStore';
import { getCurrentUser } from '../store/authStore';
import { getKullaniciAdaAtamasi, getKullaniciBloklari } from '../store/atamaStore';
import type { IsDurumu } from '../types';
import { todayISO } from '../utils/helpers';
import { toastGoster } from '../store/toastStore';

export default function BulkReport() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const kullaniciAdi = user?.ad_soyad ?? '';

  const atananAda = getKullaniciAdaAtamasi(kullaniciAdi);
  const yetkiliAdalar: string[] = [];
  if (user?.admin) {
    yetkiliAdalar.push(...user.yetkili_adalar);
  } else if (atananAda) {
    yetkiliAdalar.push(atananAda);
  }

  const gosterilecekAdalar = user?.admin
    ? blokData.adalar.filter((a) => yetkiliAdalar.includes(a.ada))
    : atananAda
      ? blokData.adalar.filter((a) => a.ada === atananAda)
      : [];

  const [ada, setAda] = useState('');
  const [seciliBloklar, setSeciliBloklar] = useState<number[]>([]);
  const [isKalemi, setIsKalemi] = useState('');
  const [durum, setDurum] = useState<IsDurumu>('devam_ediyor');
  const [ilerleme, setIlerleme] = useState(50);
  const [aciklama, setAciklama] = useState('');
  const [tarih, setTarih] = useState(todayISO());

  const adaData = ada ? blokData.adalar.find((a) => a.ada === ada) : null;

  const toggleBlok = (blokNo: number) => {
    setSeciliBloklar((prev) =>
      prev.includes(blokNo)
        ? prev.filter((b) => b !== blokNo)
        : [...prev, blokNo]
    );
  };

  const tumunuSec = () => {
    if (!adaData) return;
    setSeciliBloklar(adaData.bloklar.map((b) => b.blok_no));
  };

  const temizle = () => setSeciliBloklar([]);

  const handleSubmit = () => {
    if (!ada || seciliBloklar.length === 0 || !isKalemi || !user) return;
    for (const blokNo of seciliBloklar) {
      saveRapor({
        tarih,
        raporlayan: kullaniciAdi,
        ada,
        blok_no: blokNo,
        is_kalemi: isKalemi,
        durum,
        ilerleme_yuzde: durum === 'tamamlandi' ? 100 : ilerleme,
        aciklama,
      });
    }
    toastGoster(`${seciliBloklar.length} blok için rapor kaydedildi`, 'success');
    navigate('/raporlar');
  };

  if (gosterilecekAdalar.length === 0) {
    return (
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>Toplu Rapor</h1>
        <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 40, textAlign: 'center', border: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Size atanmış bir ada bulunmuyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>Toplu Rapor</h1>
      <p style={{ fontSize: 13, color: '#6b7280', margin: 0, marginBottom: 16 }}>
        Tek seferde birden çok blok için rapor oluşturun
      </p>

      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, border: '1px solid #f0f0f0' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 6 }}>Ada</label>
          <select
            value={ada}
            onChange={(e) => { setAda(e.target.value); setSeciliBloklar([]); }}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 14, backgroundColor: '#fff', boxSizing: 'border-box' }}
          >
            <option value="">Ada seçin</option>
            {gosterilecekAdalar.map((a) => (
              <option key={a.ada} value={a.ada}>{a.ada} ({a.blok_sayisi} blok)</option>
            ))}
          </select>
        </div>

        {ada && adaData && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#4b5563' }}>Bloklar ({seciliBloklar.length}/{adaData.bloklar.length} seçili)</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={tumunuSec} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#6b7280', cursor: 'pointer' }}>Tümünü Seç</button>
                <button onClick={temizle} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#6b7280', cursor: 'pointer' }}>Temizle</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))', gap: 6 }}>
              {adaData.bloklar.map((b) => {
                const active = seciliBloklar.includes(b.blok_no);
                return (
                  <button
                    key={b.blok_no}
                    onClick={() => toggleBlok(b.blok_no)}
                    style={{
                      padding: 8,
                      backgroundColor: active ? '#f59e0b' : '#f3f4f6',
                      border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      color: active ? '#fff' : '#4b5563', cursor: 'pointer',
                    }}
                  >
                    {b.blok_no}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 6 }}>İş Kalemi</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {IS_KALEMLERI.map((ik) => (
              <button
                key={ik}
                onClick={() => setIsKalemi(ik)}
                style={{
                  padding: '8px 6px',
                  backgroundColor: isKalemi === ik ? '#f59e0b' : '#f9fafb',
                  border: '1px solid', borderColor: isKalemi === ik ? '#f59e0b' : '#e5e7eb',
                  borderRadius: 8, fontSize: 11, fontWeight: 500,
                  color: isKalemi === ik ? '#fff' : '#374151', cursor: 'pointer',
                }}
              >
                {ik}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 6 }}>Durum</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(Object.entries(DURUM_LABELLARI) as [IsDurumu, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setDurum(key)}
                style={{
                  flex: 1, padding: '10px 8px',
                  backgroundColor: durum === key ? '#f59e0b' : '#f3f4f6',
                  border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600,
                  color: durum === key ? '#fff' : '#4b5563', cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {durum !== 'tamamlandi' && durum !== 'planlandi' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 6 }}>İlerleme: %{ilerleme}</label>
            <input type="range" min={0} max={100} value={ilerleme} onChange={(e) => setIlerleme(parseInt(e.target.value))} style={{ width: '100%' }} />
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 6 }}>Açıklama</label>
          <textarea
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            placeholder="Tüm seçili bloklar için geçerli açıklama..."
            rows={2}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 6 }}>Tarih</label>
          <input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, boxSizing: 'border-box' }} />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!ada || seciliBloklar.length === 0 || !isKalemi}
          style={{
            width: '100%', padding: 14,
            backgroundColor: ada && seciliBloklar.length > 0 && isKalemi ? '#f59e0b' : '#e5e7eb',
            border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
            color: ada && seciliBloklar.length > 0 && isKalemi ? '#fff' : '#9ca3af',
            cursor: ada && seciliBloklar.length > 0 && isKalemi ? 'pointer' : 'not-allowed',
          }}
        >
          {seciliBloklar.length > 0 ? `${seciliBloklar.length} Blok İçin Rapor Kaydet` : 'Blok Seçin'}
        </button>
      </div>
    </div>
  );
}
