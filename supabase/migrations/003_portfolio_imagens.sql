-- Gorila Soft — galeria multi-foto no portfólio
-- Adiciona a coluna `imagens` (array de URLs) à tabela portfolio.
-- Executar no SQL Editor do Supabase ou via: supabase db push

ALTER TABLE portfolio
  ADD COLUMN IF NOT EXISTS imagens JSONB NOT NULL DEFAULT '[]'::jsonb;
