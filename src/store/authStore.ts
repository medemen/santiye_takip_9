import type { Oturum } from '../types';
import { isSantiyeSefi, isProjeMuduru, getSefAdalar } from '../data/personelData';
import { blokData } from '../data/blokData';
import { getSupabase, isSupabaseReady } from '../lib/supabase';

const STORAGE_KEY = 'santiye_oturum';

type AuthListener = () => void;
const _authListeners = new Set<AuthListener>();

export function subscribeAuthChanges(listener: AuthListener): () => void {
  _authListeners.add(listener);
  return () => { _authListeners.delete(listener); };
}

function notifyAuthListeners(): void {
  _authListeners.forEach(fn => fn());
}

export function girisYap(ad_soyad: string, rol: string): Oturum {
  const pm = isProjeMuduru(ad_soyad);
  const admin = isSantiyeSefi(ad_soyad) || pm;
  const yetkiliAdalar = pm
    ? blokData.adalar.map((a) => a.ada)
    : (admin ? getSefAdalar(ad_soyad) : []);
  const oturum: Oturum = {
    ad_soyad,
    rol,
    admin,
    proje_muduru: pm,
    yetkili_adalar: yetkiliAdalar,
    giris_tarihi: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(oturum));
  notifyAuthListeners();
  return oturum;
}

export function cikisYap(): void {
  localStorage.removeItem(STORAGE_KEY);
  if (isSupabaseReady()) {
    getSupabase().auth.signOut();
  }
  notifyAuthListeners();
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

export function isProjeMuduruSession(): boolean {
  return getCurrentUser()?.proje_muduru ?? false;
}

export function isSahaPersoneli(rol: string): boolean {
  return rol === 'Saha Mühendisi' || rol === 'Saha Mimarı';
}

export async function supabaseAuthInit(): Promise<void> {
  if (!isSupabaseReady()) return;
  const { data: { session } } = await getSupabase().auth.getSession();
  if (session?.user) {
    const { data: profil } = await getSupabase()
      .from('kullanicilar')
      .select('ad_soyad, rol')
      .eq('id', session.user.id)
      .single();
    if (profil && !getCurrentUser()) {
      girisYap(profil.ad_soyad, profil.rol);
    }
  }

  getSupabase().auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      const { data: profil } = await getSupabase()
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
