import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPersonel } from '../data/personelData';
import { girisYap } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('');

  const tumPersonel = getAllPersonel().flatMap((g) =>
    [
      { ad_soyad: g.santiye_sefi, rol: 'Şantiye Şefi' },
      ...g.personel.map((p) => ({ ad_soyad: p.ad_soyad, rol: p.rol })),
    ]
  );

  const handleGiris = () => {
    if (!selected) return;
    const kisi = tumPersonel.find((p) => p.ad_soyad === selected);
    if (kisi) {
      girisYap(kisi.ad_soyad, kisi.rol);
      navigate('/');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '80dvh',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏗️</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', margin: 0 }}>
          Güneyşehir Şantiyesi
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          Rapor Takip Sistemi
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid #f0f0f0',
        }}
      >
        <label
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: '#4b5563',
            marginBottom: 8,
          }}
        >
          Kullanıcı Adı
        </label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 12,
            border: '2px solid #e5e7eb',
            fontSize: 14,
            backgroundColor: '#fff',
            boxSizing: 'border-box',
            marginBottom: 16,
          }}
        >
          <option value="">Kişi seçin</option>
          {tumPersonel.map((p) => (
            <option key={p.ad_soyad} value={p.ad_soyad}>
              {p.ad_soyad} ({p.rol})
            </option>
          ))}
        </select>

        <button
          onClick={handleGiris}
          disabled={!selected}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: selected ? '#f59e0b' : '#e5e7eb',
            border: 'none',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            color: selected ? '#fff' : '#9ca3af',
            cursor: selected ? 'pointer' : 'not-allowed',
          }}
        >
          Giriş Yap
        </button>
      </div>
    </div>
  );
}
