-- Adicionar coluna de variáveis na tabela products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '[]'::jsonb;
