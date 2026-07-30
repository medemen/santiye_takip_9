import type { Oturum } from '../types';
import { isSantiyeSefi, getSefAdalar } from '../data/personelData';

const STORAGE_KEY = 'santiye_oturum';

export function girisYap(ad_soyad: string, rol: string): Oturum {
  const admin = isSantiyeSefi(ad_soyad);
  const yetkiliAdalar = admin ? getSefAdalar(ad_soyad) : [];
  const oturum: Oturum = {
    ad_soyad,
    rol,
    admin,
    yetkili_adalar: yetkiliAdalar,
    giris_tarihi: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(oturum));
  return oturum;
}

export function cikisYap(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentUser(): Oturum | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

export function isAdmin(): boolean {
  return getCurrentUser()?.admin ?? false;
}
