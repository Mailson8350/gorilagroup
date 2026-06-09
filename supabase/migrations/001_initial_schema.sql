-- Gorila Soft — schema PostgreSQL (Supabase)
-- Execute no SQL Editor do Supabase ou via: supabase db push

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorias (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS produtos (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DOUBLE PRECISION,
  imagem TEXT,
  categoria_id BIGINT REFERENCES categorias(id)
);

CREATE TABLE IF NOT EXISTS quartos (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco_noite DOUBLE PRECISION,
  imagem TEXT,
  disponivel BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS reservas (
  id BIGSERIAL PRIMARY KEY,
  quarto_id BIGINT REFERENCES quartos(id),
  nome_cliente TEXT,
  email_cliente TEXT,
  data_inicio DATE,
  data_fim DATE,
  status TEXT NOT NULL DEFAULT 'pendente',
  num_pessoas INTEGER NOT NULL DEFAULT 1,
  taxa_turismo DOUBLE PRECISION NOT NULL DEFAULT 0,
  valor_alojamento DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipamentos (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco_aluguer DOUBLE PRECISION,
  imagem TEXT
);

CREATE TABLE IF NOT EXISTS pacotes_eventos (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DOUBLE PRECISION,
  imagem TEXT
);

CREATE TABLE IF NOT EXISTS portfolio (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  imagem TEXT,
  data DATE,
  tipo_evento TEXT
);

CREATE TABLE IF NOT EXISTS equipa (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  cargo TEXT,
  foto TEXT,
  bio TEXT,
  redes_sociais TEXT
);

CREATE TABLE IF NOT EXISTS mensagens (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT,
  email TEXT,
  assunto TEXT,
  mensagem TEXT,
  data TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedidos (
  id BIGSERIAL PRIMARY KEY,
  nome_cliente TEXT NOT NULL,
  email_cliente TEXT,
  telefone TEXT,
  itens TEXT NOT NULL,
  total DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  data TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS configuracoes_site (
  chave TEXT PRIMARY KEY,
  valor TEXT
);

CREATE TABLE IF NOT EXISTS servicos (
  id TEXT PRIMARY KEY,
  nome_pt TEXT NOT NULL,
  nome_en TEXT,
  nome_fr TEXT,
  nome_es TEXT,
  descricao_pt TEXT,
  descricao_en TEXT,
  descricao_fr TEXT,
  descricao_es TEXT,
  cor_paleta TEXT DEFAULT '#FFC107',
  cor_secundaria TEXT DEFAULT '#000000',
  logo_url TEXT,
  banner_url TEXT,
  path TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS opcoes_servico (
  id BIGSERIAL PRIMARY KEY,
  servico_id TEXT NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DOUBLE PRECISION DEFAULT 0,
  imagem TEXT,
  disponivel BOOLEAN NOT NULL DEFAULT TRUE,
  ordem INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS solicitacoes_servico (
  id BIGSERIAL PRIMARY KEY,
  servico_id TEXT NOT NULL REFERENCES servicos(id),
  opcao_id BIGINT REFERENCES opcoes_servico(id),
  nome_cliente TEXT NOT NULL,
  email_cliente TEXT,
  telefone TEXT,
  mensagem TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  data TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservas_quarto_dates ON reservas(quarto_id, data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_opcoes_servico ON opcoes_servico(servico_id);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria_id);

-- Bucket de imagens (público para leitura no site)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gorila-uploads', 'gorila-uploads', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Imagens públicas" ON storage.objects;
CREATE POLICY "Imagens públicas" ON storage.objects
  FOR SELECT USING (bucket_id = 'gorila-uploads');
