export interface Sablon {
  id: string;
  ad: string;
  aciklama: string;
  is_kalemleri: string[];
  varsayilan_durum: string;
}

export const SABLONLAR: Sablon[] = [
  {
    id: 'temel-insaat',
    ad: 'Temel İnşaat',
    aciklama: 'Kazı, temel, kalıp, demir ve beton işleri',
    is_kalemleri: ['Kazı', 'Temel', 'Kalıp', 'Demir', 'Beton'],
    varsayilan_durum: 'devam_ediyor',
  },
  {
    id: 'kaba-insaat',
    ad: 'Kaba İnşaat',
    aciklama: 'Duvar, yalıtım, sıva ve iskele işleri',
    is_kalemleri: ['Tuğla Duvar', 'Yalıtım', 'Sıva', 'İskele'],
    varsayilan_durum: 'planlandi',
  },
  {
    id: 'ince-insaat',
    ad: 'İnce İnşaat',
    aciklama: 'Boya, kapı/pencere, merdiven ve çevre düzenleme',
    is_kalemleri: ['Boya', 'Kapı/Pencere', 'Merdiven', 'Çevre Düzenleme'],
    varsayilan_durum: 'planlandi',
  },
  {
    id: 'mekanik-elektrik',
    ad: 'Mekanik & Elektrik',
    aciklama: 'Elektrik, su tesisatı, ısıtma/soğutma ve asansör',
    is_kalemleri: ['Elektrik', 'Su Tesisatı', 'Isıtma/Soğutma', 'Asansör'],
    varsayilan_durum: 'planlandi',
  },
  {
    id: 'cephe-cati',
    ad: 'Cephe & Çatı',
    aciklama: 'Cephe kaplama ve çatı işleri',
    is_kalemleri: ['Cephe Kaplama', 'Çatı'],
    varsayilan_durum: 'planlandi',
  },
];

export function getSablonById(id: string): Sablon | undefined {
  return SABLONLAR.find((s) => s.id === id);
}
