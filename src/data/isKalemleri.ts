export const IS_KALEMLERI = [
  'Kazı',
  'Temel',
  'Kalıp',
  'Demir',
  'Beton',
  'Tuğla Duvar',
  'Yalıtım',
  'Sıva',
  'Boya',
  'Elektrik',
  'Su Tesisatı',
  'Isıtma/Soğutma',
  'Kapı/Pencere',
  'Asansör',
  'Cephe Kaplama',
  'Çatı',
  'Merdiven',
  'İskele',
  'Çevre Düzenleme',
] as const;

export const DURUM_RENKLERI: Record<string, string> = {
  planlandi: '#f59e0b',
  devam_ediyor: '#3b82f6',
  tamamlandi: '#22c55e',
  gecikme: '#ef4444',
};

export const DURUM_LABELLARI: Record<string, string> = {
  planlandi: 'Planlandı',
  devam_ediyor: 'Devam Ediyor',
  tamamlandi: 'Tamamlandı',
  gecikme: 'Gecikme',
};

export const DURUM_SIRALAMA: Record<string, number> = {
  planlandi: 0,
  devam_ediyor: 1,
  gecikme: 2,
  tamamlandi: 3,
};
