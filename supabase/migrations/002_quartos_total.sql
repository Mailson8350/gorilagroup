-- Gorila Soft — coluna de total de unidades por quarto
-- O admin define quantas unidades/quartos idênticos existem (num_quartos).
-- Quando o número de reservas ativas (não canceladas) atinge o total,
-- o quarto fica esgotado (indisponível) até o fim do período de uma reserva.

ALTER TABLE quartos
  ADD COLUMN IF NOT EXISTS num_quartos INTEGER NOT NULL DEFAULT 1;

-- Garante valores válidos (mínimo 1)
UPDATE quartos SET num_quartos = 1 WHERE num_quartos IS NULL OR num_quartos < 1;
