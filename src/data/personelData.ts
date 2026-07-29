import personelJson from '../../data/personel.json';
import type { PersonelData } from '../types';

export const personelData = personelJson as PersonelData;

export function getPersonelByAda(ada: string) {
  const adaKey = ada === 'ADA-1' || ada === 'ADA-2' ? 'ADA-1-2'
    : ada === 'ADA-3' || ada === 'ADA-4' ? 'ADA-3-4'
    : 'ADA-5-6';
  return personelData.adalar.find((a) => a.ada === adaKey);
}

export function getSantiyeSefi(ada: string): string {
  const entry = getPersonelByAda(ada);
  return entry?.santiye_sefi ?? 'Belirtilmemiş';
}

export function getBlokSorumlulari(ada: string): string[] {
  const entry = getPersonelByAda(ada);
  if (!entry) return [];
  return entry.personel.map((p) => p.ad_soyad);
}

export function getAllPersonel() {
  const result: { ada: string; santiye_sefi: string; personel: { ad_soyad: string; rol: string }[] }[] = [];
  for (const entry of personelData.adalar) {
    result.push({
      ada: entry.ada,
      santiye_sefi: entry.santiye_sefi,
      personel: entry.personel,
    });
  }
  return result;
}
