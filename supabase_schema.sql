-- ============================================================================
-- SCRIPT SQL SUPABASE — NETTOYAGE EXPRESS (Thorigné-Fouillard & Rennes)
-- À coller dans Supabase -> SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. Table des Pôles d'Activité / Sites
CREATE TABLE IF NOT EXISTS public.ne_sites (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'garage',
  location TEXT,
  default_client TEXT
);

-- 2. Table des Salariés & Affectations
CREATE TABLE IF NOT EXISTS public.ne_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL DEFAULT '123',
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employe',
  specialty TEXT DEFAULT 'Polyvalent',
  assigned_sites JSONB DEFAULT '[1, 2, 3]'::jsonb,
  daily_site_id BIGINT DEFAULT 1,
  daily_mission_note TEXT DEFAULT ''
);

-- 3. Table des Prestations & Tarifs
CREATE TABLE IF NOT EXISTS public.ne_services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'garage',
  vehicle_type TEXT DEFAULT 'Voiture',
  color TEXT DEFAULT 'garage',
  prices JSONB DEFAULT '{}'::jsonb
);

-- 4. Table des Interventions (Lavages, Concessionnaire & Convoyages)
CREATE TABLE IF NOT EXISTS public.ne_transactions (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  employe_id TEXT,
  employe_name TEXT,
  site_id BIGINT,
  site_name TEXT,
  activity_type TEXT DEFAULT 'garage',
  service_id TEXT,
  service_name TEXT,
  vehicle_type TEXT DEFAULT 'Voiture',
  client_name TEXT,
  plate_number TEXT,
  plate_photo TEXT,
  after_photo TEXT,
  mileage_start BIGINT,
  mileage_end BIGINT,
  pickup_location TEXT,
  dropoff_location TEXT,
  status TEXT DEFAULT 'termine',
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'Facture Client',
  cancelled_tx_id TEXT,
  notes TEXT
);

-- Désactiver RLS (ou autoriser l'accès public anon comme pour Mazagan)
ALTER TABLE public.ne_sites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ne_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ne_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ne_transactions DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DONNÉES INITIALES — NETTOYAGE EXPRESS
-- ============================================================================

INSERT INTO public.ne_sites (id, name, category, location, default_client) VALUES
  (1, 'Garage Thorigné-Fouillard', 'garage', '6 Rue Antoine de Saint Exupéry, 35235 Thorigné-Fouillard', 'Atelier Thorigné'),
  (2, 'Sur Site • Concessionnaire Rennes', 'concession', 'Centre de service Concessionnaire — Rennes', 'Concessionnaire Rennes'),
  (3, 'Convoyage & Gardiennage (Super U → Rennes)', 'convoyage', 'Parc Super U → Concessionnaire Rennes', 'Concessionnaire Rennes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ne_users (id, username, password, name, role, specialty, assigned_sites, daily_site_id, daily_mission_note) VALUES
  ('u1', 'patron', '123', 'Direction Nettoyage Express', 'patron', 'Gérant', '[1, 2, 3]'::jsonb, 1, 'Supervision générale des 3 pôles'),
  ('u2', 'karim', '123', 'Karim', 'employe', 'Lavage & Esthétique', '[2]'::jsonb, 2, 'Préparation véhicules VO/VN chez le Concessionnaire Rennes'),
  ('u3', 'yassine', '123', 'Yassine', 'employe', 'Convoyeur & Préparateur', '[3]'::jsonb, 3, 'Rotation convoyage Parc Super U → Concessionnaire Rennes'),
  ('u4', 'mehdi', '123', 'Mehdi', 'employe', 'Lavage Camions & Garage', '[1]'::jsonb, 1, 'Lavage camions/utilitaires & voitures au Garage Thorigné')
ON CONFLICT (id) DO UPDATE SET
  assigned_sites = EXCLUDED.assigned_sites,
  daily_site_id = EXCLUDED.daily_site_id,
  daily_mission_note = EXCLUDED.daily_mission_note;

INSERT INTO public.ne_services (id, name, category, vehicle_type, color, prices) VALUES
  ('lavage-complet-voiture', 'Lavage Complet Voiture (Int/Ext)', 'garage', 'Voiture', 'garage', '{"1": 65, "2": 55, "3": 65}'::jsonb),
  ('lavage-ext-voiture', 'Lavage Extérieur Express', 'garage', 'Voiture', 'garage', '{"1": 30, "2": 25, "3": 30}'::jsonb),
  ('esthetique-lustrage', 'Rénovation Esthétique & Lustrage', 'garage', 'Voiture', 'garage', '{"1": 140, "2": 120, "3": 140}'::jsonb),
  ('lavage-camion-utilitaire', 'Lavage Camion / Utilitaire', 'garage', 'Camion / Utilitaire', 'camion', '{"1": 95, "2": 90, "3": 95}'::jsonb),
  ('lavage-poids-lourd', 'Lavage Poids Lourd / Extérieur', 'garage', 'Camion / Utilitaire', 'camion', '{"1": 145, "2": 145, "3": 145}'::jsonb),
  ('prepa-vn-concession', 'Préparation Véhicule Neuf (VN)', 'concession', 'Voiture', 'concession', '{"1": 45, "2": 45, "3": 45}'::jsonb),
  ('prepa-vo-concession', 'Remise à Neuf Occasion (VO)', 'concession', 'Voiture', 'concession', '{"1": 75, "2": 75, "3": 75}'::jsonb),
  ('lavage-hall-expo', 'Lavage Parc / Hall Concession', 'concession', 'Voiture', 'concession', '{"1": 25, "2": 25, "3": 25}'::jsonb),
  ('convoyage-superu-rennes', 'Convoyage Super U → Concession Rennes', 'convoyage', 'Voiture', 'convoyage', '{"1": 35, "2": 35, "3": 35}'::jsonb),
  ('gardiennage-transfert', 'Gardiennage Parc + Livraison Rennes', 'convoyage', 'Voiture', 'convoyage', '{"1": 50, "2": 50, "3": 50}'::jsonb),
  ('transfert-inter-sites', 'Transfert Véhicule Concessionnaire', 'convoyage', 'Voiture', 'convoyage', '{"1": 40, "2": 40, "3": 40}'::jsonb)
ON CONFLICT (id) DO NOTHING;

