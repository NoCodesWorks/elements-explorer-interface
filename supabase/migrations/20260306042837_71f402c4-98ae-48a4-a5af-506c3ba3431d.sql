CREATE TABLE public.element_properties_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  element_number integer NOT NULL,
  source text NOT NULL,
  property_type text NOT NULL,
  data jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(element_number, source, property_type)
);

ALTER TABLE public.element_properties_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read"
  ON public.element_properties_cache FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow service insert/update"
  ON public.element_properties_cache FOR ALL
  TO service_role
  USING (true);