import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type TileInputs, type TileOutputs, calculateTile } from '@/lib/tile-engine';
import { supabase } from '@/integrations/supabase/client';

interface TileStore {
  inputs: TileInputs;
  outputs: TileOutputs | null;
  isDirty: boolean;
  currentCalcId: string | null;
  currentProjectId: string | null;
  setInput: <K extends keyof TileInputs>(key: K, value: TileInputs[K]) => void;
  recalculate: () => void;
  loadCalculation: (id: string) => Promise<void>;
  saveCalculation: (userId: string, projectName: string, address: string) => Promise<string | null>;
}

const defaultInputs: TileInputs = {
  V: 175,
  exposureCategory: 'C',
  riskCategory: 'II',
  h: 20,
  roofType: 'hip',
  pitchRise: 5,
  hasOverhang: true,
  method: 'moment',
  lambda: 1.05,
  Mg_ftlb: 4.5,
  Mf_ftlb: 28.0,
  tile_length_ft: 1.25,
  tile_width_ft: 0.83,
  tile_weight_lb: 9.5,
  F_prime_lbf: 30,
  county: 'Miami-Dade',
  isHVHZ: true,
  useEngineeredPressures: false,
};

export const useTileStore = create<TileStore>()(
  persist(
    (set, get) => ({
      inputs: defaultInputs,
      outputs: calculateTile(defaultInputs),
      isDirty: false,
      currentCalcId: null,
      currentProjectId: null,
      setInput: (key, value) => {
        const newInputs = { ...get().inputs, [key]: value };
        set({ inputs: newInputs, outputs: calculateTile(newInputs), isDirty: true });
      },
      recalculate: () => set({ outputs: calculateTile(get().inputs) }),

      loadCalculation: async (id: string) => {
        const { data, error } = await supabase
          .from('tile_calculations')
          .select('inputs_json, project_id')
          .eq('id', id)
          .maybeSingle();
        if (error || !data) return;
        const inputs = data.inputs_json as unknown as TileInputs;
        set({
          inputs,
          outputs: calculateTile(inputs),
          currentCalcId: id,
          currentProjectId: data.project_id,
          isDirty: false,
        });
      },

      saveCalculation: async (userId: string, projectName: string, address: string) => {
        const { inputs, outputs, currentCalcId, currentProjectId } = get();

        if (currentCalcId && currentProjectId) {
          await supabase.from('tile_calculations').update({
            inputs_json: inputs as any,
            results_json: outputs as any,
            name: projectName,
          }).eq('id', currentCalcId);
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

        const { data: calc, error: calcErr } = await supabase.from('tile_calculations').insert({
          user_id: userId,
          project_id: proj.id,
          name: projectName,
          inputs_json: inputs as any,
          results_json: outputs as any,
        }).select('id').single();
        if (calcErr || !calc) return null;

        set({ currentCalcId: calc.id, currentProjectId: proj.id, isDirty: false });
        return calc.id;
      },
    }),
    {
      name: 'tile-calc-draft',
      partialize: (state) => ({ inputs: state.inputs }),
      onRehydrateStorage: () => (state) => {
        if (state?.inputs) {
          state.outputs = calculateTile(state.inputs);
        }
      },
    }
  )
);
