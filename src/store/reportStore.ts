import type { Rapor } from '../types';

const STORAGE_KEY = 'santiye_raporlari';

export function getRaporlar(): Rapor[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRapor(rapor: Omit<Rapor, 'id' | 'olusturma_tarihi'>): Rapor {
  const yeni: Rapor = {
    ...rapor,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    olusturma_tarihi: new Date().toISOString(),
  };
  const raporlar = getRaporlar();
  raporlar.push(yeni);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(raporlar));
  return yeni;
}

export function getBlokRaporlari(ada: string, blokNo: number): Rapor[] {
  return getRaporlar().filter(
    (r) => r.ada === ada && r.blok_no === blokNo
  );
}

export function getAdaRaporlari(ada: string): Rapor[] {
  return getRaporlar().filter((r) => r.ada === ada);
}

export function getPersonelRaporlari(adSoyad: string): Rapor[] {
  return getRaporlar().filter((r) => r.raporlayan === adSoyad);
}

export function getBlokProgress(
  ada: string,
  blokNo: number,
  isKalemleri: readonly string[]
): Record<string, Rapor | null> {
  const raporlar = getBlokRaporlari(ada, blokNo);
  const progress: Record<string, Rapor | null> = {};
  for (const ik of isKalemleri) {
    const sonRapor = raporlar
      .filter((r) => r.is_kalemi === ik)
      .sort(
        (a, b) =>
          new Date(b.olusturma_tarihi).getTime() -
          new Date(a.olusturma_tarihi).getTime()
      );
    progress[ik] = sonRapor.length > 0 ? sonRapor[0] : null;
  }
  return progress;
}

export function getBlokGenelIlerleme(
  ada: string,
  blokNo: number,
  isKalemleri: readonly string[]
): number {
  const progress = getBlokProgress(ada, blokNo, isKalemleri);
  const values = Object.values(progress);
  if (values.length === 0) return 0;
  const toplam = values.reduce((sum, r) => {
    if (!r) return sum;
    if (r.durum === 'tamamlandi') return sum + 100;
    return sum + r.ilerleme_yuzde;
  }, 0);
  return Math.round(toplam / values.length);
}

export function getAdaGenelIlerleme(
  ada: string,
  blokList: { blok_no: number }[],
  isKalemleri: readonly string[]
): number {
  if (blokList.length === 0) return 0;
  const toplam = blokList.reduce((sum, b) => {
    return sum + getBlokGenelIlerleme(ada, b.blok_no, isKalemleri);
  }, 0);
  return Math.round(toplam / blokList.length);
}

export function getSonRaporlar(limit = 10): Rapor[] {
  return getRaporlar()
    .sort(
      (a, b) =>
        new Date(b.olusturma_tarihi).getTime() -
        new Date(a.olusturma_tarihi).getTime()
    )
    .slice(0, limit);
}

export function getIstatistikler() {
  const raporlar = getRaporlar();
  const tamamlananIsler = raporlar.filter((r) => r.durum === 'tamamlandi').length;
  const devamEdenIsler = raporlar.filter((r) => r.durum === 'devam_ediyor').length;
  const planlananIsler = raporlar.filter((r) => r.durum === 'planlandi').length;
  const gecikenIsler = raporlar.filter((r) => r.durum === 'gecikme').length;
  const toplamRapor = raporlar.length;

  return {
    tamamlananIsler,
    devamEdenIsler,
    planlananIsler,
    gecikenIsler,
    toplamRapor,
  };
}
