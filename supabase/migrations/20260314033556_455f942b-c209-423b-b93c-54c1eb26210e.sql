
-- Create tile_calculations table (mirrors fastener_calculations pattern)
CREATE TABLE public.tile_calculations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  project_id uuid REFERENCES public.projects(id),
  name text NOT NULL DEFAULT 'Untitled Tile Calc',
  inputs_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  results_json jsonb,
  notes text,
  status text DEFAULT 'draft',
  version integer DEFAULT 1,
  version_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tile_calculations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own tile calcs" ON public.tile_calculations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tile calcs" ON public.tile_calculations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tile calcs" ON public.tile_calculations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tile calcs" ON public.tile_calculations FOR DELETE USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE TRIGGER update_tile_calculations_updated_at BEFORE UPDATE ON public.tile_calculations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
