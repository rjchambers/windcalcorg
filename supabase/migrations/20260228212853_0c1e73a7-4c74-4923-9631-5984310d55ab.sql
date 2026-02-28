-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  company TEXT,
  pe_license TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Project',
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fastener Calculations
CREATE TABLE public.fastener_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Calculation',
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft',
  inputs_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  results_json JSONB,
  county TEXT,
  system_type TEXT,
  construction_type TEXT,
  wind_speed_mph FLOAT,
  qh_asd FLOAT,
  warnings_json JSONB,
  engineer_of_record TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fastener_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fastener calcs" ON public.fastener_calculations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own fastener calcs" ON public.fastener_calculations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fastener calcs" ON public.fastener_calculations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fastener calcs" ON public.fastener_calculations FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_fastener_calcs_updated_at BEFORE UPDATE ON public.fastener_calculations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TAS 105 Test Records
CREATE TABLE public.tas105_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fastener_calculation_id UUID REFERENCES public.fastener_calculations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_date DATE,
  testing_agency TEXT,
  deck_type TEXT,
  deck_condition TEXT,
  test_location_description TEXT,
  raw_values_lbf FLOAT[],
  n_samples INTEGER,
  mean_lbf FLOAT,
  std_dev_lbf FLOAT,
  t_factor FLOAT,
  mcrf_lbf FLOAT,
  pass_275 BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tas105_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own TAS105 tests" ON public.tas105_tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own TAS105 tests" ON public.tas105_tests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own TAS105 tests" ON public.tas105_tests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own TAS105 tests" ON public.tas105_tests FOR DELETE USING (auth.uid() = user_id);

-- Product Approvals (shared read-only reference)
CREATE TABLE public.product_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  approval_type TEXT,
  approval_number TEXT UNIQUE,
  manufacturer TEXT,
  product_name TEXT,
  system_type TEXT,
  mdp_zone1_psf FLOAT,
  extrapolation_permitted BOOLEAN DEFAULT true,
  deck_types TEXT[],
  fastener_specs_json JSONB,
  sheet_width_in FLOAT,
  lap_width_in FLOAT,
  valid_from DATE,
  valid_to DATE,
  notes TEXT
);

ALTER TABLE public.product_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product approvals are publicly readable" ON public.product_approvals FOR SELECT USING (true);

-- Wind uplift calculations
CREATE TABLE public.wind_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Calculation',
  inputs_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  results_json JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wind_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wind calcs" ON public.wind_calculations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own wind calcs" ON public.wind_calculations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wind calcs" ON public.wind_calculations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wind calcs" ON public.wind_calculations FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_wind_calcs_updated_at BEFORE UPDATE ON public.wind_calculations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();