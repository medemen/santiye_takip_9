import { useState } from 'react';
import { personelData } from '../data/personelData';
import { blokData } from '../data/blokData';
import { getPersonelRaporlari } from '../store/reportStore';
import { getKullaniciAtamasi, setKullaniciAtamasi } from '../store/atamaStore';
import type { BlokAtamasi } from '../types';
import ReportCard from '../components/ReportCard';

export default function Personnel() {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [editPerson, setEditPerson] = useState<string | null>(null);
  const [editAtama, setEditAtama] = useState<BlokAtamasi>({});

  const adaGroups = personelData.adalar.map((entry) => ({
    ada: entry.ada,
    santiye_sefi: entry.santiye_sefi,
    personel: entry.personel,
  }));

  const raporlar = selectedPerson ? getPersonelRaporlari(selectedPerson) : [];

  const rolRenkleri: Record<string, string> = {
    'Saha Mühendisi': '#dbeafe',
    'Saha Mimarı': '#ede9fe',
    'Saha Teknikeri': '#d1fae5',
    'Formen': '#fef3c7',
  };

  const rolYaziRenkleri: Record<string, string> = {
    'Saha Mühendisi': '#1e40af',
    'Saha Mimarı': '#5b21b6',
    'Saha Teknikeri': '#065f46',
    'Formen': '#92400e',
  };

  const openEdit = (ad_soyad: string) => {
    setEditPerson(ad_soyad);
    setEditAtama(getKullaniciAtamasi(ad_soyad));
  };

  const toggleBlok = (ada: string, blokNo: number) => {
    setEditAtama((prev) => {
      const current = prev[ada] || [];
      const updated = current.includes(blokNo)
        ? current.filter((b) => b !== blokNo)
        : [...current, blokNo].sort((a, b) => a - b);
      return { ...prev, [ada]: updated };
    });
  };

  const toggleAda = (ada: string, bloklar: { blok_no: number }[]) => {
    setEditAtama((prev) => {
      const current = prev[ada] || [];
      const allSelected = bloklar.every((b) => current.includes(b.blok_no));
      if (allSelected) {
        const { [ada]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [ada]: bloklar.map((b) => b.blok_no) };
    });
  };

  const saveEdit = () => {
    if (editPerson) {
      setKullaniciAtamasi(editPerson, editAtama);
      setEditPerson(null);
      setEditAtama({});
    }
  };

  const cancelEdit = () => {
    setEditPerson(null);
    setEditAtama({});
  };

  if (selectedPerson) {
    return (
      <div>
        <button
          onClick={() => setSelectedPerson(null)}
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
          ← Personele Dön
        </button>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>
          {selectedPerson}
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
          Toplam {raporlar.length} rapor
        </p>

        {raporlar.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 14 }}>
            Henüz rapor bulunmuyor
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {raporlar.map((r) => (
              <ReportCard key={r.id} rapor={r} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (editPerson) {
    return (
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: 0 }}>
            Blok Atama
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={cancelEdit}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                color: '#4b5563',
                cursor: 'pointer',
              }}
            >
              İptal
            </button>
            <button onClick={saveEdit}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f59e0b',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Kaydet
            </button>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
            border: '1px solid #f0f0f0',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1f2937' }}>{editPerson}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            Atanacağı blokları seçin
          </div>
        </div>

        {blokData.adalar.map((ada) => {
          const secili = editAtama[ada.ada] || [];
          const hepsiSecili = ada.bloklar.every((b) => secili.includes(b.blok_no));
          return (
            <div key={ada.ada} style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: 0 }}>
                  {ada.ada}
                </h3>
                <button
                  onClick={() => toggleAda(ada.ada, ada.bloklar)}
                  style={{
                    background: 'none',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    padding: '2px 8px',
                    fontSize: 11,
                    color: hepsiSecili ? '#f59e0b' : '#6b7280',
                    cursor: 'pointer',
                  }}
                >
                  {hepsiSecili ? 'Temizle' : 'Tümünü Seç'}
                </button>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))',
                  gap: 6,
                }}
              >
                {ada.bloklar.map((b) => {
                  const active = secili.includes(b.blok_no);
                  return (
                    <button
                      key={b.blok_no}
                      onClick={() => toggleBlok(ada.ada, b.blok_no)}
                      style={{
                        padding: 8,
                        backgroundColor: active ? '#f59e0b' : '#f3f4f6',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        color: active ? '#fff' : '#4b5563',
                        cursor: 'pointer',
                      }}
                    >
                      {b.blok_no}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: 0 }}>
          Personel
        </h1>
      </div>

      {adaGroups.map((group) => (
        <div key={group.ada} style={{ marginBottom: 20 }}>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#374151',
              marginBottom: 8,
              paddingBottom: 6,
              borderBottom: '2px solid #f59e0b',
            }}
          >
            {group.ada}
          </h2>

          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 12,
              marginBottom: 8,
              border: '1px solid #f0f0f0',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', marginBottom: 4 }}>
              👷 {group.santiye_sefi}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Şantiye Şefi</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {group.personel.map((p) => (
              <div
                key={p.ad_soyad}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  padding: '10px 14px',
                  border: '1px solid #f0f0f0',
                }}
              >
                <div
                  onClick={() => setSelectedPerson(p.ad_soyad)}
                  style={{ flex: 1, cursor: 'pointer' }}
                >
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{p.ad_soyad}</div>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: 11,
                      padding: '1px 8px',
                      borderRadius: 8,
                      backgroundColor: rolRenkleri[p.rol] || '#f3f4f6',
                      color: rolYaziRenkleri[p.rol] || '#4b5563',
                      marginTop: 2,
                    }}
                  >
                    {p.rol}
                  </span>
                </div>
                <button
                  onClick={() => openEdit(p.ad_soyad)}
                  style={{
                    background: 'none',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: '4px 10px',
                    fontSize: 13,
                    color: '#6b7280',
                    cursor: 'pointer',
                    marginLeft: 8,
                  }}
                  title="Blok atamalarını düzenle"
                >
                  ✏️
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
