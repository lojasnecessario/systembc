-- Adiciona a coluna cnpj na tabela store_settings
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS cnpj text;
