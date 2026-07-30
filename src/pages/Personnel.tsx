import { useState } from 'react';
import { personelData } from '../data/personelData';
import { blokData } from '../data/blokData';
import { getPersonelRaporlari } from '../store/reportStore';
import { getKullaniciBlokAtamasi, setKullaniciBlokAtamasi, getKullaniciAdaAtamasi, setKullaniciAdaAtamasi } from '../store/atamaStore';
import { getCurrentUser } from '../store/authStore';
import type { BlokAtamasi } from '../types';
import ReportCard from '../components/ReportCard';

function exportCSV() {
  const { personel } = personelData;
  const rows = [['Ad Soyad', 'Rol', 'Varsayılan Ada', 'Atanan Ada', 'Atanan Bloklar']];
  for (const p of personel) {
    const lsAda = getKullaniciAdaAtamasi(p.ad_soyad);
    const atananAda = lsAda !== null ? lsAda : (p.atanan_ada || '');
    const blokAtama = getKullaniciBlokAtamasi(p.ad_soyad);
    const blokStr = atananAda && blokAtama[atananAda] ? blokAtama[atananAda].sort((a, b) => a - b).join('; ') : '';
    rows.push([p.ad_soyad, p.rol, p.atanan_ada || '', atananAda, blokStr]);
  }
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\r\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'personel_atamalari.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function Personnel() {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [editPerson, setEditPerson] = useState<string | null>(null);
  const [editAda, setEditAda] = useState<string>('');
  const [editBlokAtama, setEditBlokAtama] = useState<BlokAtamasi>({});

  const user = getCurrentUser();
  const isAdmin = user?.admin ?? false;
  const yetkiliAdalar = user?.yetkili_adalar ?? [];

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

  const getEffectiveAda = (ad_soyad: string): string | null => {
    const lsAtama = getKullaniciAdaAtamasi(ad_soyad);
    if (lsAtama !== null) return lsAtama;
    const person = personelData.personel.find((p) => p.ad_soyad === ad_soyad);
    return person?.atanan_ada ?? null;
  };

  const getAdaLabileli = (): { ada: string; personel: typeof personelData.personel }[] => {
    const atanmis = personelData.personel.filter((p) => getEffectiveAda(p.ad_soyad));
    const gruplu: Record<string, typeof personelData.personel> = {};
    for (const p of atanmis) {
      const a = getEffectiveAda(p.ad_soyad)!;
      if (!gruplu[a]) gruplu[a] = [];
      gruplu[a].push(p);
    }
    return blokData.adalar.map((b) => ({
      ada: b.ada,
      personel: gruplu[b.ada] || [],
    }));
  };

  const getAtanmamisPersonel = () => {
    return personelData.personel.filter((p) => !getEffectiveAda(p.ad_soyad));
  };

  const openEdit = (ad_soyad: string) => {
    setEditPerson(ad_soyad);
    const mevcutAda = getEffectiveAda(ad_soyad);
    setEditAda(mevcutAda ?? '');
    setEditBlokAtama(getKullaniciBlokAtamasi(ad_soyad));
  };

  const toggleBlok = (ada: string, blokNo: number) => {
    setEditBlokAtama((prev) => {
      const current = prev[ada] || [];
      const updated = current.includes(blokNo)
        ? current.filter((b) => b !== blokNo)
        : [...current, blokNo].sort((a, b) => a - b);
      return { ...prev, [ada]: updated };
    });
  };

  const toggleAda = (ada: string, bloklar: { blok_no: number }[]) => {
    setEditBlokAtama((prev) => {
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
    if (!editPerson) return;
    setKullaniciAdaAtamasi(editPerson, editAda || null);
    setKullaniciBlokAtamasi(editPerson, editBlokAtama);
    setEditPerson(null);
    setEditAda('');
    setEditBlokAtama({});
  };

  const cancelEdit = () => {
    setEditPerson(null);
    setEditAda('');
    setEditBlokAtama({});
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
          {getEffectiveAda(selectedPerson)
            ? `${getEffectiveAda(selectedPerson)} — Toplam ${raporlar.length} rapor`
            : `Atanmamış — Toplam ${raporlar.length} rapor`}
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
    const person = personelData.personel.find((p) => p.ad_soyad === editPerson);
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
            Personel Düzenle
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
          {person && (
            <span
              style={{
                display: 'inline-block',
                fontSize: 11,
                padding: '1px 8px',
                borderRadius: 8,
                backgroundColor: rolRenkleri[person.rol] || '#f3f4f6',
                color: rolYaziRenkleri[person.rol] || '#4b5563',
                marginTop: 4,
              }}
            >
              {person.rol}
            </span>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 6 }}>
            Atanacağı Ada
          </label>
          <select
            value={editAda}
            onChange={(e) => setEditAda(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              border: '2px solid #e5e7eb',
              fontSize: 14,
              backgroundColor: '#fff',
              boxSizing: 'border-box',
            }}
          >
            <option value="">Atanmamış</option>
            {(yetkiliAdalar.length > 0 ? yetkiliAdalar : blokData.adalar.map((a) => a.ada)).map((ada) => (
              <option key={ada} value={ada}>{ada}</option>
            ))}
          </select>
        </div>

        {editAda && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: 0 }}>
                Blok Atamaları ({editAda})
              </h3>
              <button
                onClick={() => {
                  const adaBlok = blokData.adalar.find((a) => a.ada === editAda);
                  if (adaBlok) toggleAda(editAda, adaBlok.bloklar);
                }}
                style={{
                  background: 'none',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  padding: '2px 8px',
                  fontSize: 11,
                  color: '#6b7280',
                  cursor: 'pointer',
                }}
              >
                Tümünü Seç/Temizle
              </button>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))',
                gap: 6,
              }}
            >
              {blokData.adalar.find((a) => a.ada === editAda)?.bloklar.map((b) => {
                const secili = editBlokAtama[editAda] || [];
                const active = secili.includes(b.blok_no);
                return (
                  <button
                    key={b.blok_no}
                    onClick={() => toggleBlok(editAda, b.blok_no)}
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
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
              Hiç blok seçilmezse tüm bloklara erişebilir
            </p>
          </div>
        )}
      </div>
    );
  }

  const atanmamis = getAtanmamisPersonel();
  const adaLabelli = getAdaLabileli();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: 0 }}>
          Personel
        </h1>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={exportCSV}
            style={{
              background: 'none',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 11,
              color: '#6b7280',
              cursor: 'pointer',
            }}
            title="CSV Dışa Aktar"
          >
            📥 CSV
          </button>
          {isAdmin && (
            <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>
              Yönetici modu
            </span>
          )}
        </div>
      </div>

      {atanmamis.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#ef4444',
              marginBottom: 8,
              paddingBottom: 6,
              borderBottom: '2px solid #ef4444',
            }}
          >
            Atanmamış Personel ({atanmamis.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {atanmamis.map((p) => (
              <PersonelKart
                key={p.ad_soyad}
                person={p}
                isAdmin={isAdmin}
                onClick={() => setSelectedPerson(p.ad_soyad)}
                onEdit={() => openEdit(p.ad_soyad)}
                rolRenkleri={rolRenkleri}
                rolYaziRenkleri={rolYaziRenkleri}
              />
            ))}
          </div>
        </div>
      )}

      {adaLabelli.map(({ ada, personel }) => {
        const sef = personelData.santiye_sefleri.find((s) => s.adalar.includes(ada));
        return (
          <div key={ada} style={{ marginBottom: 20 }}>
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
              {ada}
              {sef && (
                <span style={{ fontSize: 12, fontWeight: 400, color: '#6b7280', marginLeft: 8 }}>
                  👷 {sef.ad_soyad}
                </span>
              )}
            </h2>

            {personel.length === 0 ? (
              <div style={{ fontSize: 12, color: '#9ca3af', padding: '8px 0' }}>
                Bu adaya atanmış personel yok
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {personel.map((p) => (
                  <PersonelKart
                    key={p.ad_soyad}
                    person={p}
                    isAdmin={isAdmin}
                    onClick={() => setSelectedPerson(p.ad_soyad)}
                    onEdit={() => openEdit(p.ad_soyad)}
                    rolRenkleri={rolRenkleri}
                    rolYaziRenkleri={rolYaziRenkleri}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PersonelKart({
  person,
  isAdmin,
  onClick,
  onEdit,
  rolRenkleri,
  rolYaziRenkleri,
}: {
  person: { ad_soyad: string; rol: string };
  isAdmin: boolean;
  onClick: () => void;
  onEdit: () => void;
  rolRenkleri: Record<string, string>;
  rolYaziRenkleri: Record<string, string>;
}) {
  return (
    <div
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
      <div onClick={onClick} style={{ flex: 1, cursor: 'pointer' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{person.ad_soyad}</div>
        <span
          style={{
            display: 'inline-block',
            fontSize: 11,
            padding: '1px 8px',
            borderRadius: 8,
            backgroundColor: rolRenkleri[person.rol] || '#f3f4f6',
            color: rolYaziRenkleri[person.rol] || '#4b5563',
            marginTop: 2,
          }}
        >
          {person.rol}
        </span>
      </div>
      {isAdmin && (
        <button
          onClick={onEdit}
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
          title="Düzenle"
        >
          ✏️
        </button>
      )}
    </div>
  );
}
