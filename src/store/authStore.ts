import type { Oturum } from '../types';
import { isSantiyeSefi, getSefAdalar } from '../data/personelData';
import { supabase, isSupabaseReady } from '../lib/supabase';

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
  if (isSupabaseReady()) {
    supabase.auth.signOut();
  }
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

export async function supabaseAuthInit(): Promise<void> {
  if (!isSupabaseReady()) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    const { data: profil } = await supabase
      .from('kullanicilar')
      .select('ad_soyad, rol')
      .eq('id', session.user.id)
      .single();
    if (profil && !getCurrentUser()) {
      girisYap(profil.ad_soyad, profil.rol);
    }
  }

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      const { data: profil } = await supabase
        .from('kullanicilar')
        .select('ad_soyad, rol')
        .eq('id', session.user.id)
        .single();
      if (profil) {
        girisYap(profil.ad_soyad, profil.rol);
      }
    } else if (event === 'SIGNED_OUT') {
      localStorage.removeItem(STORAGE_KEY);
    }
  });
}
