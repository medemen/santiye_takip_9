import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { blokData } from '../data/blokData';
import { personelData } from '../data/personelData';
import { IS_KALEMLERI, DURUM_LABELLARI } from '../data/isKalemleri';
import { saveRapor } from '../store/reportStore';
import { getCurrentUser } from '../store/authStore';
import { getKullaniciAdaAtamasi, getKullaniciBloklari } from '../store/atamaStore';
import type { IsDurumu } from '../types';
import { todayISO } from '../utils/helpers';

type Step = 'ada' | 'blok' | 'is_kalemi' | 'detay';

export default function ReportAdd() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preAda = searchParams.get('ada') || '';
  const preBlok = searchParams.get('blok') || '';

  const user = getCurrentUser();
  const kullaniciAdi = user?.ad_soyad ?? '';

  const atananAda = getKullaniciAdaAtamasi(kullaniciAdi);
  const userBloklar = atananAda ? getKullaniciBloklari(kullaniciAdi, atananAda) : [];

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

  const [step, setStep] = useState<Step>(preAda ? 'blok' : 'ada');
  const [ada, setAda] = useState(preAda);
  const [blokNo, setBlokNo] = useState(preBlok ? parseInt(preBlok) : 0);
  const [isKalemi, setIsKalemi] = useState('');
  const [durum, setDurum] = useState<IsDurumu>('devam_ediyor');
  const [ilerleme, setIlerleme] = useState(50);
  const [aciklama, setAciklama] = useState('');
  const [tarih, setTarih] = useState(todayISO());

  const adaData = ada ? blokData.adalar.find((a) => a.ada === ada) : null;

  const getBlokFiltre = () => {
    if (!ada) return [];
    if (user?.admin) {
      const blokAtama = getKullaniciBloklari(kullaniciAdi, ada);
      return blokAtama.length > 0 ? blokAtama : adaData?.bloklar.map((b) => b.blok_no) ?? [];
    }
    if (atananAda === ada) {
      return userBloklar.length > 0 ? userBloklar : adaData?.bloklar.map((b) => b.blok_no) ?? [];
    }
    return [];
  };

  const handleSubmit = () => {
    if (!ada || !blokNo || !isKalemi || !user) return;
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
    navigate('/raporlar');
  };

  const renderStepIndicator = () => {
    const steps = ['ada', 'blok', 'is_kalemi', 'detay'] as Step[];
    const labels = ['Ada', 'Blok', 'İş Kalemi', 'Detay'];
    const currentIdx = steps.indexOf(step);
    return (
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {steps.map((s, i) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: i <= currentIdx ? '#f59e0b' : '#e5e7eb',
              transition: 'background-color 0.3s',
            }}
          />
        ))}
        <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', width: '100%', marginTop: 4 }}>
          {labels[currentIdx]} ({currentIdx + 1}/4)
        </div>
      </div>
    );
  };

  if (gosterilecekAdalar.length === 0) {
    return (
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>
          Rapor Ekle
        </h1>
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 40,
            textAlign: 'center',
            border: '1px solid #f0f0f0',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            Size atanmış bir ada bulunmuyor.
            {user?.admin ? ' Personel sayfasından atama yapabilirsiniz.' : ''}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>
        Rapor Ekle
      </h1>
      <p style={{ fontSize: 13, color: '#6b7280', margin: 0, marginBottom: 16 }}>
        Blok ilerleme durumunu raporlayın
      </p>

      {renderStepIndicator()}

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid #f0f0f0',
        }}
      >
        {/* ADIM 1: Ada Seçimi */}
        {step === 'ada' && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              Ada Seçin
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {gosterilecekAdalar.map((a) => (
                <button
                  key={a.ada}
                  onClick={() => {
                    setAda(a.ada);
                    setStep('blok');
                  }}
                  style={{
                    padding: '14px 16px',
                    backgroundColor: '#f8fafc',
                    border: '2px solid #e5e7eb',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#1f2937',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {a.ada} — {a.blok_sayisi} Blok
                  <div style={{ fontSize: 12, fontWeight: 400, color: '#6b7280', marginTop: 2 }}>
                    {a.toplam_daire} daire, {a.toplam_kat} kat
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ADIM 2: Blok Seçimi */}
        {step === 'blok' && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              {ada} — Blok Seçin
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                gap: 8,
                marginBottom: 16,
              }}
            >
              {adaData?.bloklar
                .filter((b) => getBlokFiltre().includes(b.blok_no))
                .map((b) => (
                  <button
                    key={b.blok_no}
                    onClick={() => {
                      setBlokNo(b.blok_no);
                      setStep('is_kalemi');
                    }}
                    style={{
                      padding: 10,
                      backgroundColor: blokNo === b.blok_no ? '#f59e0b' : '#f3f4f6',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      color: blokNo === b.blok_no ? '#fff' : '#4b5563',
                      cursor: 'pointer',
                    }}
                  >
                    {b.blok_no}
                  </button>
                ))}
            </div>
            <button
              onClick={() => setStep('ada')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              ← Geri
            </button>
          </div>
        )}

        {/* ADIM 3: İş Kalemi Seçimi */}
        {step === 'is_kalemi' && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              {ada} - Blok {blokNo} — İş Kalemi
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                marginBottom: 16,
              }}
            >
              {IS_KALEMLERI.map((ik) => (
                <button
                  key={ik}
                  onClick={() => {
                    setIsKalemi(ik);
                    setStep('detay');
                  }}
                  style={{
                    padding: '10px 8px',
                    backgroundColor: isKalemi === ik ? '#f59e0b' : '#f9fafb',
                    border: '1px solid',
                    borderColor: isKalemi === ik ? '#f59e0b' : '#e5e7eb',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 500,
                    color: isKalemi === ik ? '#fff' : '#374151',
                    cursor: 'pointer',
                  }}
                >
                  {ik}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep('blok')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              ← Geri
            </button>
          </div>
        )}

        {/* ADIM 4: Detay */}
        {step === 'detay' && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              {ada} - Blok {blokNo} — {isKalemi}
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 6 }}>
                Durum
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(Object.entries(DURUM_LABELLARI) as [IsDurumu, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setDurum(key)}
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      backgroundColor: durum === key ? '#f59e0b' : '#f3f4f6',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 600,
                      color: durum === key ? '#fff' : '#4b5563',
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {durum !== 'tamamlandi' && durum !== 'planlandi' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 6 }}>
                  İlerleme: %{ilerleme}
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={ilerleme}
                  onChange={(e) => setIlerleme(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af' }}>
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 6 }}>
                Açıklama
              </label>
              <textarea
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                placeholder="İşin durumu hakkında notlar..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #e5e7eb',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 6 }}>
                Tarih
              </label>
              <input
                type="date"
                value={tarih}
                onChange={(e) => setTarih(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #e5e7eb',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 6 }}>
                Raporlayan
              </label>
              <input
                type="text"
                value={kullaniciAdi}
                readOnly
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #e5e7eb',
                  fontSize: 13,
                  backgroundColor: '#f9fafb',
                  color: '#374151',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setStep('is_kalemi')}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#4b5563',
                  cursor: 'pointer',
                }}
              >
                ← Geri
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f59e0b',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Kaydet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
