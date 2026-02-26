-- Add product_id column to usage_logs table to enable per-product filtering
ALTER TABLE public.usage_logs ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;

-- Index for fast lookups by product_id
CREATE INDEX IF NOT EXISTS idx_usage_logs_product_id ON public.usage_logs(product_id);
