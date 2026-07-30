import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { personelData } from '../data/personelData';
import { girisYap } from '../store/authStore';
import { supabase, isSupabaseReady } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('');
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [supabaseLogin, setSupabaseLogin] = useState(false);
  const [hata, setHata] = useState('');

  const tumKullanicilar = [
    ...personelData.santiye_sefleri.map((s) => ({
      ad_soyad: s.ad_soyad,
      rol: 'Şantiye Şefi',
    })),
    ...personelData.personel.map((p) => ({
      ad_soyad: p.ad_soyad,
      rol: p.rol,
    })),
  ];

  const handleGiris = () => {
    if (!selected) return;
    const kisi = tumKullanicilar.find((p) => p.ad_soyad === selected);
    if (kisi) {
      girisYap(kisi.ad_soyad, kisi.rol);
      navigate('/');
    }
  };

  const handleSupabaseGiris = async () => {
    if (!email || !sifre) return;
    setHata('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: sifre });
      if (error) {
        setHata(error.message);
        return;
      }
      if (data.user) {
        const { data: profil } = await supabase
          .from('kullanicilar')
          .select('ad_soyad, rol')
          .eq('id', data.user.id)
          .single();
        if (profil) {
          girisYap(profil.ad_soyad, profil.rol);
          navigate('/');
        } else {
          setHata('Kullanıcı profili bulunamadı');
        }
      }
    } catch {
      setHata('Bağlantı hatası');
    }
  };

  const handleGoogleGiris = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) setHata(error.message);
    } catch {
      setHata('Google girişi başarısız');
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
        {!supabaseLogin ? (
          <>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 8 }}>
              Kullanıcı Adı
            </label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                border: '2px solid #e5e7eb', fontSize: 14, backgroundColor: '#fff',
                boxSizing: 'border-box', marginBottom: 16,
              }}
            >
              <option value="">Kişi seçin</option>
              {tumKullanicilar.map((k) => (
                <option key={k.ad_soyad} value={k.ad_soyad}>
                  {k.ad_soyad} ({k.rol})
                </option>
              ))}
            </select>

            <button
              onClick={handleGiris}
              disabled={!selected}
              style={{
                width: '100%', padding: '14px',
                backgroundColor: selected ? '#f59e0b' : '#e5e7eb',
                border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                color: selected ? '#fff' : '#9ca3af',
                cursor: selected ? 'pointer' : 'not-allowed',
              }}
            >
              Giriş Yap
            </button>

            {isSupabaseReady() && (
              <button
                onClick={() => setSupabaseLogin(true)}
                style={{
                  width: '100%', padding: '10px', marginTop: 8,
                  background: 'none', border: 'none', fontSize: 12,
                  color: '#6b7280', cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                E-posta ile giriş yap →
              </button>
            )}
          </>
        ) : (
          <>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12, marginTop: 0 }}>
              E-posta ile Giriş
            </h3>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 6 }}>
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                border: '2px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box', marginBottom: 12,
              }}
            />

            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 6 }}>
              Şifre
            </label>
            <input
              type="password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                border: '2px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box', marginBottom: 16,
              }}
            />

            {hata && (
              <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 12, textAlign: 'center' }}>
                {hata}
              </div>
            )}

            <button
              onClick={handleSupabaseGiris}
              disabled={!email || !sifre}
              style={{
                width: '100%', padding: '14px',
                backgroundColor: email && sifre ? '#f59e0b' : '#e5e7eb',
                border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                color: email && sifre ? '#fff' : '#9ca3af',
                cursor: email && sifre ? 'pointer' : 'not-allowed',
              }}
            >
              Giriş Yap
            </button>

            <button
              onClick={handleGoogleGiris}
              style={{
                width: '100%', padding: '12px', marginTop: 8,
                backgroundColor: '#fff', border: '1px solid #e5e7eb',
                borderRadius: 12, fontSize: 14, fontWeight: 600,
                color: '#374151', cursor: 'pointer',
              }}
            >
              Google ile Giriş Yap
            </button>

            <button
              onClick={() => { setSupabaseLogin(false); setHata(''); }}
              style={{
                width: '100%', padding: '10px', marginTop: 8,
                background: 'none', border: 'none', fontSize: 12,
                color: '#6b7280', cursor: 'pointer',
              }}
            >
              ← Kişi seçimine dön
            </button>
          </>
        )}
      </div>
    </div>
  );
}
