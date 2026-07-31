import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { blokData } from '../data/blokData';
import { IS_KALEMLERI, DURUM_LABELLARI, DURUM_RENKLERI } from '../data/isKalemleri';
import { saveRapor, getRaporlar } from '../store/reportStore';
import { getCurrentUser } from '../store/authStore';
import { getKullaniciAdaAtamasi } from '../store/atamaStore';
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

  const blokDurumMap = useMemo(() => {
    if (!ada || !isKalemi) return {} as Record<number, { durum: IsDurumu; ilerleme_yuzde: number }>;
    const raporlar = getRaporlar().filter((r) => r.ada === ada && r.is_kalemi === isKalemi);
    const map: Record<number, { durum: IsDurumu; ilerleme_yuzde: number }> = {};
    for (const b of adaData?.bloklar ?? []) {
      const blokRaporlari = raporlar
        .filter((r) => r.blok_no === b.blok_no)
        .sort((a, b) => new Date(b.olusturma_tarihi).getTime() - new Date(a.olusturma_tarihi).getTime());
      if (blokRaporlari.length > 0) {
        map[b.blok_no] = { durum: blokRaporlari[0].durum, ilerleme_yuzde: blokRaporlari[0].ilerleme_yuzde };
      }
    }
    return map;
  }, [ada, isKalemi, adaData]);

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

  const mevcutRaporSayisi = ada && isKalemi
    ? Object.keys(blokDurumMap).length
    : 0;
  const toplamBlokSayisi = adaData?.bloklar.length ?? 0;

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
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 6 }}>İş Kalemi</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {IS_KALEMLERI.map((ik) => (
              <button
                key={ik}
                onClick={() => { setIsKalemi(ik); setSeciliBloklar([]); }}
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
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 6 }}>Ada</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {gosterilecekAdalar.map((a) => (
              <button
                key={a.ada}
                onClick={() => { setAda(a.ada); setSeciliBloklar([]); }}
                style={{
                  padding: '12px 14px',
                  backgroundColor: ada === a.ada ? '#f59e0b' : '#f9fafb',
                  border: '1px solid', borderColor: ada === a.ada ? '#f59e0b' : '#e5e7eb',
                  borderRadius: 10, fontSize: 13, fontWeight: 600,
                  color: ada === a.ada ? '#fff' : '#374151', cursor: 'pointer',
                }}
              >
                {a.ada} ({a.blok_sayisi} blok)
              </button>
            ))}
          </div>
        </div>

        {ada && adaData && isKalemi && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#4b5563' }}>
                Bloklar ({seciliBloklar.length}/{adaData.bloklar.length} seçili)
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={tumunuSec} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#6b7280', cursor: 'pointer' }}>Tümünü Seç</button>
                <button onClick={temizle} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#6b7280', cursor: 'pointer' }}>Temizle</button>
              </div>
            </div>

            {mevcutRaporSayisi > 0 && (
              <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px 0' }}>
                Seçili imalat için {mevcutRaporSayisi}/{toplamBlokSayisi} blokta rapor var (renkli gösterim)
              </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))', gap: 6 }}>
              {adaData.bloklar.map((b) => {
                const durumBilgisi = blokDurumMap[b.blok_no];
                const isSelected = seciliBloklar.includes(b.blok_no);
                let bgColor: string;
                let textColor: string;
                if (durumBilgisi) {
                  bgColor = DURUM_RENKLERI[durumBilgisi.durum];
                  textColor = '#fff';
                } else if (isSelected) {
                  bgColor = '#f59e0b';
                  textColor = '#fff';
                } else {
                  bgColor = '#f3f4f6';
                  textColor = '#4b5563';
                }
                const durumLabel = durumBilgisi ? DURUM_LABELLARI[durumBilgisi.durum] : '';
                const tooltip = durumBilgisi
                  ? `${durumLabel} (%${durumBilgisi.ilerleme_yuzde})`
                  : 'Henüz rapor girilmemiş';
                return (
                  <button
                    key={b.blok_no}
                    onClick={() => toggleBlok(b.blok_no)}
                    title={tooltip}
                    style={{
                      padding: 8,
                      backgroundColor: bgColor,
                      border: isSelected ? '2px solid #fff' : 'none',
                      borderRadius: 8, fontSize: 12, fontWeight: 600,
                      color: textColor, cursor: 'pointer',
                      boxShadow: isSelected ? '0 0 0 2px #f59e0b' : 'none',
                    }}
                  >
                    {b.blok_no}{isSelected ? ' ✓' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {ada && adaData && !isKalemi && (
          <div style={{ marginBottom: 16, padding: 24, textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: 10 }}>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Blokları görmek için önce bir iş kalemi seçin</p>
          </div>
        )}

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
