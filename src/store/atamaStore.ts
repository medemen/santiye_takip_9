import type { KullaniciAtamalari, BlokAtamasi } from '../types';

const BLOK_KEY = 'santiye_atanabilir_bloklar';
const ADA_KEY = 'santiye_kullanici_ada_atamalari';

function getBlokAtamalar(): KullaniciAtamalari {
  try {
    const data = localStorage.getItem(BLOK_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveBlokAtamalar(atamalar: KullaniciAtamalari): void {
  localStorage.setItem(BLOK_KEY, JSON.stringify(atamalar));
}

export function getKullaniciBlokAtamasi(ad_soyad: string): BlokAtamasi {
  const atamalar = getBlokAtamalar();
  return atamalar[ad_soyad] || {};
}

export function setKullaniciBlokAtamasi(ad_soyad: string, atama: BlokAtamasi): void {
  const atamalar = getBlokAtamalar();
  atamalar[ad_soyad] = atama;
  saveBlokAtamalar(atamalar);
}

export function getKullaniciBloklari(ad_soyad: string, ada: string): number[] {
  const atama = getKullaniciBlokAtamasi(ad_soyad);
  return atama[ada] || [];
}

export function kullaniciAdaAtanmisMi(ad_soyad: string): string[] {
  const atama = getKullaniciBlokAtamasi(ad_soyad);
  return Object.keys(atama).filter((ada) => (atama[ada]?.length ?? 0) > 0);
}

function getAdaAtamalar(): Record<string, string | null> {
  try {
    const data = localStorage.getItem(ADA_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveAdaAtamalar(atamalar: Record<string, string | null>): void {
  localStorage.setItem(ADA_KEY, JSON.stringify(atamalar));
}

export function setKullaniciAdaAtamasi(ad_soyad: string, ada: string | null): void {
  const atamalar = getAdaAtamalar();
  if (ada === null) {
    delete atamalar[ad_soyad];
  } else {
    atamalar[ad_soyad] = ada;
  }
  saveAdaAtamalar(atamalar);
}

export function getKullaniciAdaAtamasi(ad_soyad: string): string | null {
  const atamalar = getAdaAtamalar();
  if (ad_soyad in atamalar) {
    return atamalar[ad_soyad];
  }
  return null;
}

export function getAdaPersonelListesi(ada: string): string[] {
  const atamalar = getAdaAtamalar();
  return Object.entries(atamalar)
    .filter(([, v]) => v === ada)
    .map(([k]) => k);
}

export function getButunAdaAtamalari(): Record<string, string | null> {
  return getAdaAtamalar();
}
