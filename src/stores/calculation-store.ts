import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type CalculationInputs, type CalculationOutputs, calculate } from '@/lib/calculation-engine';
import { supabase } from '@/integrations/supabase/client';

interface CalculationStore {
  inputs: CalculationInputs;
  outputs: CalculationOutputs | null;
  isDirty: boolean;
  currentCalcId: string | null;
  currentProjectId: string | null;
  setInput: <K extends keyof CalculationInputs>(key: K, value: CalculationInputs[K]) => void;
  recalculate: () => void;
  loadCalculation: (id: string) => Promise<void>;
  saveCalculation: (userId: string, projectName: string, address: string) => Promise<string | null>;
}

const defaultInputs: CalculationInputs = {
  V: 170,
  exposureCategory: 'C',
  h: 14,
  Kzt: 1.0,
  Kd: 0.85,
  Ke: 1.0,
  roofType: 'hip',
  pitchDegrees: 18.43,
  buildingWidth: 26,
  buildingLength: 53.5,
  trussSpacing: 2,
  spans: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
  deadLoad: 45,
  designBasis: 'ASD',
  enclosureType: 'enclosed',
  hasOverhang: true,
  overhangWidth: 2.0,
  riskCategory: 'II',
};

export const useCalculationStore = create<CalculationStore>()(
  persist(
    (set, get) => ({
  inputs: defaultInputs,
  outputs: calculate(defaultInputs),
  isDirty: false,
  currentCalcId: null,
  currentProjectId: null,
  setInput: (key, value) => {
    const newInputs = { ...get().inputs, [key]: value };
    set({ inputs: newInputs, outputs: calculate(newInputs), isDirty: true });
  },
  recalculate: () => {
    set({ outputs: calculate(get().inputs) });
  },
  loadCalculation: async (id: string) => {
    const { data, error } = await supabase
      .from('wind_calculations')
      .select('inputs_json, project_id')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return;
    const inputs = data.inputs_json as unknown as CalculationInputs;
    set({
      inputs,
      outputs: calculate(inputs),
      currentCalcId: id,
      currentProjectId: data.project_id,
      isDirty: false,
    });
  },
  saveCalculation: async (userId: string, projectName: string, address: string) => {
    const { inputs, outputs, currentCalcId, currentProjectId } = get();

    if (currentCalcId && currentProjectId) {
      // Update existing
      await supabase.from('wind_calculations').update({
        inputs_json: inputs as any,
        results_json: outputs as any,
        name: projectName,
      }).eq('id', currentCalcId);
      if (address) {
        await supabase.from('projects').update({ address }).eq('id', currentProjectId);
      }
      return currentCalcId;
    }

    // Create new project + calc
    const { data: proj, error: projErr } = await supabase.from('projects').insert({
      user_id: userId,
      name: projectName,
      address: address || null,
    }).select('id').single();
    if (projErr || !proj) return null;

    const { data: calc, error: calcErr } = await supabase.from('wind_calculations').insert({
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
      name: 'wind-calc-draft',
      partialize: (state) => ({ inputs: state.inputs }),
      onRehydrateStorage: () => (state) => {
        if (state?.inputs) {
          state.outputs = calculate(state.inputs);
        }
      },
    }
  )
);
