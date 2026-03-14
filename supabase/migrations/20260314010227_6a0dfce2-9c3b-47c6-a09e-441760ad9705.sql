CREATE TABLE public.strap_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT 'Untitled Strap Calc',
  inputs_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  results_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.strap_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own strap calcs" ON public.strap_calculations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own strap calcs" ON public.strap_calculations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own strap calcs" ON public.strap_calculations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own strap calcs" ON public.strap_calculations FOR DELETE USING (auth.uid() = user_id);