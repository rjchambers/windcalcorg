import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type StrapInputs, type StrapOutputs, calculateStrap } from '@/lib/strap-engine';
import { supabase } from '@/integrations/supabase/client';

interface StrapStore {
  inputs: StrapInputs;
  outputs: StrapOutputs | null;
  currentCalcId: string | null;
  currentProjectId: string | null;
  setInput: <K extends keyof StrapInputs>(key: K, value: StrapInputs[K]) => void;
  recalculate: () => void;
  reset: () => void;
  loadCalculation: (id: string) => Promise<void>;
  saveCalculation: (userId: string, projectName: string, address: string) => Promise<string | null>;
}

const defaultInputs: StrapInputs = {
  zone1_netUplift_lbs: 800,
  zone2E_netUplift_lbs: 1400,
  zone3E_netUplift_lbs: 2100,
  trussSpacing_ft: 2,
  deadLoad_psf: 45,
  designBasis: 'ASD',
  wallType: 'wood_plate',
  strapsPerTruss: 1,
  hipGirderPresent: true,
  isHVHZ: true,
  county: 'miami_dade',
};

export const useStrapStore = create<StrapStore>()(
  persist(
    (set, get) => ({
      inputs: defaultInputs,
      outputs: calculateStrap(defaultInputs),
      currentCalcId: null,
      currentProjectId: null,
      setInput: (key, value) => {
        const newInputs = { ...get().inputs, [key]: value };
        set({ inputs: newInputs, outputs: calculateStrap(newInputs) });
      },
      recalculate: () => set({ outputs: calculateStrap(get().inputs) }),

      reset: () => set({
        inputs: defaultInputs,
        outputs: calculateStrap(defaultInputs),
        currentCalcId: null,
        currentProjectId: null,
      }),

      loadCalculation: async (id: string) => {
        const { data, error } = await supabase
          .from('strap_calculations')
          .select('inputs_json, project_id')
          .eq('id', id)
          .maybeSingle();
        if (error || !data) return;
        const inputs = data.inputs_json as unknown as StrapInputs;
        set({
          inputs,
          outputs: calculateStrap(inputs),
          currentCalcId: id,
          currentProjectId: data.project_id,
        });
      },

      saveCalculation: async (userId: string, projectName: string, address: string) => {
        const { inputs, outputs, currentCalcId, currentProjectId } = get();

        if (currentCalcId && currentProjectId) {
          const { error } = await supabase.from('strap_calculations').update({
            inputs_json: inputs as any,
            results_json: outputs as any,
            name: projectName,
          }).eq('id', currentCalcId);
          if (error) return null;
          if (address) {
            await supabase.from('projects').update({ address }).eq('id', currentProjectId);
          }
          return currentCalcId;
        }

        const { data: proj, error: projErr } = await supabase.from('projects').insert({
          user_id: userId,
          name: projectName,
          address: address || null,
        }).select('id').single();
        if (projErr || !proj) return null;

        const { data: calc, error: calcErr } = await supabase.from('strap_calculations').insert({
          user_id: userId,
          project_id: proj.id,
          name: projectName,
          inputs_json: inputs as any,
          results_json: outputs as any,
        }).select('id').single();
        if (calcErr || !calc) return null;

        set({ currentCalcId: calc.id, currentProjectId: proj.id });
        return calc.id;
      },
    }),
    {
      name: 'strap-calc-draft',
      partialize: (state) => ({ inputs: state.inputs }),
      onRehydrateStorage: () => (state) => {
        if (state?.inputs) {
          state.outputs = calculateStrap(state.inputs);
        }
      },
    }
  )
);
