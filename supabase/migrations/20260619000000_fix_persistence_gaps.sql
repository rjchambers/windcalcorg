-- Persistence fixes for saved calculations.

-- 1. strap_calculations was created without an updated_at trigger, so its
--    updated_at never advanced on UPDATE even though the Dashboard orders by it.
DROP TRIGGER IF EXISTS update_strap_calculations_updated_at ON public.strap_calculations;
CREATE TRIGGER update_strap_calculations_updated_at
  BEFORE UPDATE ON public.strap_calculations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. tile_calculations.project_id had no ON DELETE rule, so deleting a project
--    that owned tile calcs failed with a foreign-key violation. Match the
--    cascade behavior of wind_calculations / fastener_calculations.
ALTER TABLE public.tile_calculations
  DROP CONSTRAINT IF EXISTS tile_calculations_project_id_fkey;
ALTER TABLE public.tile_calculations
  ADD CONSTRAINT tile_calculations_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- 3. strap_calculations.project_id used ON DELETE SET NULL, which orphaned the
--    calc (invisible in the Dashboard, which groups by project). Cascade instead.
ALTER TABLE public.strap_calculations
  DROP CONSTRAINT IF EXISTS strap_calculations_project_id_fkey;
ALTER TABLE public.strap_calculations
  ADD CONSTRAINT strap_calculations_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
