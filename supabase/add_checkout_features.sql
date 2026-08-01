-- Tabela para as configurações gerais do checkout
CREATE TABLE IF NOT EXISTS checkout_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  marquee_text text DEFAULT '🔥 OFERTA POR TEMPO LIMITADO! GARANTA O SEU AGORA COM DESCONTO.',
  marquee_active boolean DEFAULT false,
  sales_notification_active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Inserir um registro padrão
INSERT INTO checkout_settings (marquee_active)
SELECT false
WHERE NOT EXISTS (SELECT 1 FROM checkout_settings);

-- Tabela para os reviews (avaliações) mostradas no checkout
CREATE TABLE IF NOT EXISTS checkout_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  rating integer DEFAULT 5,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Dados de exemplo
INSERT INTO checkout_reviews (description, rating, is_active)
SELECT 'Atendimento rápido e produto como descrito', 5, true
WHERE NOT EXISTS (SELECT 1 FROM checkout_reviews);

-- ==========================================
-- SOLUÇÃO PARA O ERRO "violates row-level security policy":
-- ==========================================

-- 1. Desabilitar RLS nas tabelas (método mais simples caso sua base use autenticação própria na aplicação)
ALTER TABLE checkout_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_reviews DISABLE ROW LEVEL SECURITY;

-- 2. Garantir que as tabelas aceitem comandos públicos caso o RLS seja forçado de volta
DROP POLICY IF EXISTS "Acesso total as configuracoes" ON checkout_settings;
CREATE POLICY "Acesso total as configuracoes" ON checkout_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total aos reviews" ON checkout_reviews;
CREATE POLICY "Acesso total aos reviews" ON checkout_reviews FOR ALL USING (true) WITH CHECK (true);

-- 3. Forçar permissões de leitura/escrita para a API
GRANT ALL ON TABLE checkout_settings TO anon, authenticated;
GRANT ALL ON TABLE checkout_reviews TO anon, authenticated;

-- ==========================================
-- ATUALIZAÇÃO: Novas Funcionalidades
-- ==========================================
ALTER TABLE checkout_settings ADD COLUMN IF NOT EXISTS marquee_bg_color text DEFAULT '#dc2626';
ALTER TABLE checkout_settings ADD COLUMN IF NOT EXISTS marquee_text_color text DEFAULT '#ffffff';

ALTER TABLE checkout_reviews ADD COLUMN IF NOT EXISTS image_url text;
