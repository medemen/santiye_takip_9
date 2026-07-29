import type { KullaniciAtamalari, BlokAtamasi } from '../types';

const STORAGE_KEY = 'santiye_atanabilir_bloklar';

export function getAtamalar(): KullaniciAtamalari {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveAtamalar(atamalar: KullaniciAtamalari): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(atamalar));
}

export function getKullaniciAtamasi(ad_soyad: string): BlokAtamasi {
  const atamalar = getAtamalar();
  return atamalar[ad_soyad] || {};
}

export function setKullaniciAtamasi(ad_soyad: string, atama: BlokAtamasi): void {
  const atamalar = getAtamalar();
  atamalar[ad_soyad] = atama;
  saveAtamalar(atamalar);
}

export function getKullaniciBloklari(ad_soyad: string, ada: string): number[] {
  const atama = getKullaniciAtamasi(ad_soyad);
  return atama[ada] || [];
}

export function kullaniciAdaAtanmisMi(ad_soyad: string): string[] {
  const atama = getKullaniciAtamasi(ad_soyad);
  return Object.keys(atama).filter((ada) => (atama[ada]?.length ?? 0) > 0);
}
