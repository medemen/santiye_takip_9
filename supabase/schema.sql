-- Santiye Takip Database Schema for Supabase

-- Kullanicilar (synced with auth.users)
create table if not exists public.kullanicilar (
  id uuid references auth.users on delete cascade primary key,
  ad_soyad text not null,
  rol text not null default 'Personel',
  admin boolean not null default false,
  yetkili_adalar text[] default '{}',
  atanan_ada text,
  created_at timestamptz default now()
);
alter table public.kullanicilar enable row level security;

-- Adalar
create table if not exists public.adalar (
  ada text primary key,
  blok_sayisi int not null,
  toplam_daire int not null,
  toplam_kat int not null,
  created_at timestamptz default now()
);

-- Bloklar
create table if not exists public.bloklar (
  id serial primary key,
  ada text references public.adalar(ada) on delete cascade,
  blok_no int not null,
  tip text not null,
  daire_sayisi int not null,
  yapi_konfigurasyonu text not null,
  kat_sayisi int not null,
  unique(ada, blok_no)
);

-- Raporlar
create table if not exists public.raporlar (
  id text primary key,
  tarih date not null,
  raporlayan text not null,
  ada text not null,
  blok_no int not null,
  is_kalemi text not null,
  durum text not null check (durum in ('planlandi','devam_ediyor','tamamlandi','gecikme')),
  ilerleme_yuzde int not null default 0,
  aciklama text default '',
  fotograflar text[] default '{}',
  olusturma_tarihi timestamptz default now(),
  created_at timestamptz default now()
);
alter table public.raporlar enable row level security;

-- Kullanici Ada Atamalari
create table if not exists public.kullanici_ada_atamalari (
  ad_soyad text primary key,
  ada text,
  updated_at timestamptz default now()
);

-- Kullanici Blok Atamalari
create table if not exists public.kullanici_blok_atamalari (
  id serial primary key,
  ad_soyad text not null,
  ada text not null,
  blok_nos int[] not null default '{}',
  unique(ad_soyad, ada)
);

-- Is Kalemleri Hedef Tarihleri
create table if not exists public.is_kalemi_hedefleri (
  id serial primary key,
  ada text not null,
  blok_no int not null,
  is_kalemi text not null,
  hedef_tarih date,
  unique(ada, blok_no, is_kalemi)
);

-- RLS Policies
create policy "Kullanicilar herkes gorur" on public.kullanicilar for select using (true);
create policy "Kullanicilar kendini gunceller" on public.kullanicilar for update using (auth.uid() = id);

create policy "Raporlar herkes gorur" on public.raporlar for select using (true);
create policy "Raporlar herkes ekler" on public.raporlar for insert with check (true);
create policy "Raporlar sahibi gunceller" on public.raporlar for update using (raporlayan = (select ad_soyad from public.kullanicilar where id = auth.uid()));
create policy "Raporlar admin siler" on public.raporlar for delete using (
  (select admin from public.kullanicilar where id = auth.uid()) = true
);

-- Indexes
create index if not exists idx_raporlar_ada on public.raporlar(ada);
create index if not exists idx_raporlar_raporlayan on public.raporlar(raporlayan);
create index if not exists idx_raporlar_durum on public.raporlar(durum);
