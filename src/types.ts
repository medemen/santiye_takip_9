export interface Personel {
  ad_soyad: string;
  rol: string;
}

export interface AdaPersonel {
  ada: string;
  santiye_sefi: string;
  personel: Personel[];
}

export interface PersonelData {
  aciklama: string;
  proje: string;
  tarih: string;
  adalar: AdaPersonel[];
}

export interface Blok {
  blok_no: number;
  tip: string;
  daire_sayisi: number;
  yapi_konfigurasyonu: string;
  kat_sayisi: number;
}

export interface AdaBlok {
  ada: string;
  blok_sayisi: number;
  toplam_daire: number;
  toplam_kat: number;
  bloklar: Blok[];
}

export interface BlokData {
  aciklama: string;
  proje: string;
  adalar: AdaBlok[];
  pdf_referans_toplamlari: Record<string, { blok: number; daire: number; kat: number }>;
  not: string;
}

export interface Oturum {
  ad_soyad: string;
  rol: string;
  giris_tarihi: string;
}

export interface BlokAtamasi {
  [ada: string]: number[];
}

export interface KullaniciAtamalari {
  [ad_soyad: string]: BlokAtamasi;
}

export type IsDurumu =
  | 'planlandi'
  | 'devam_ediyor'
  | 'tamamlandi'
  | 'gecikme';

export interface Rapor {
  id: string;
  tarih: string;
  raporlayan: string;
  ada: string;
  blok_no: number;
  is_kalemi: string;
  durum: IsDurumu;
  ilerleme_yuzde: number;
  aciklama: string;
  olusturma_tarihi: string;
}

export interface BlokProgress {
  blok_no: number;
  is_kalemleri: Record<string, Rapor | null>;
  genel_ilerleme: number;
}
