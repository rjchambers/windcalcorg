import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type FastenerInputs,
  type FastenerOutputs,
  type TAS105Inputs,
  type TAS105Outputs,
  type NOAParams,
  calculateFastener,
  calculateTAS105,
} from '@/lib/fastener-engine';
import { supabase } from '@/integrations/supabase/client';

interface FastenerStoreUpdate {
  tas105Inputs: TAS105Inputs;
  tas105Outputs: TAS105Outputs | null;
  inputs?: FastenerInputs;
  outputs?: FastenerOutputs | null;
}

interface FastenerStore {
  inputs: FastenerInputs;
  outputs: FastenerOutputs | null;
  tas105Inputs: TAS105Inputs;
  tas105Outputs: TAS105Outputs | null;
  isDirty: boolean;
  currentCalcId: string | null;
  currentProjectId: string | null;
  setInput: <K extends keyof FastenerInputs>(key: K, value: FastenerInputs[K]) => void;
  setNOA: <K extends keyof NOAParams>(key: K, value: NOAParams[K]) => void;
  setTAS105Values: (values: number[]) => void;
  setTAS105Meta: (meta: Partial<TAS105Inputs>) => void;
  recalculate: () => void;
  loadCalculation: (id: string) => Promise<void>;
  saveCalculation: (userId: string, projectName: string, address: string) => Promise<string | null>;
}

const defaultNOA: NOAParams = {
  approvalType: 'miami_dade_noa',
  approvalNumber: '',
  manufacturer: '',
  productName: '',
  systemNumber: '',
  mdp_psf: -60,
  asterisked: false,
};

const defaultInputs: FastenerInputs = {
  V: 175,
  exposureCategory: 'C',
  h: 15,
  Kzt: 1.0,
  Kd: 0.85,
  Ke: 1.0,
  enclosure: 'enclosed',
  riskCategory: 'II',
  buildingLength: 60,
  buildingWidth: 40,
  parapetHeight: 0,
  systemType: 'modified_bitumen',
  deckType: 'plywood',
  constructionType: 'reroof',
  existingLayers: 1,
  sheetWidth_in: 39.375,
  lapWidth_in: 4,
  Fy_lbf: 29.48,
  fySource: 'noa',
  initialRows: 4,
  noa: defaultNOA,
  boardLength_ft: 4,
  boardWidth_ft: 8,
  insulation_Fy_lbf: 29.48,
  county: 'miami_dade',
  isHVHZ: true,
};

export const useFastenerStore = create<FastenerStore>((set, get) => ({
  inputs: defaultInputs,
  outputs: calculateFastener(defaultInputs),
  tas105Inputs: { rawValues_lbf: [] },
  tas105Outputs: null,
  isDirty: false,
  currentCalcId: null,
  currentProjectId: null,
  setInput: (key, value) => {
    const newInputs = { ...get().inputs, [key]: value };
    set({ inputs: newInputs, outputs: calculateFastener(newInputs), isDirty: true });
  },
  setNOA: (key, value) => {
    const newNOA = { ...get().inputs.noa, [key]: value };
    const newInputs = { ...get().inputs, noa: newNOA };
    set({ inputs: newInputs, outputs: calculateFastener(newInputs), isDirty: true });
  },
  setTAS105Values: (values) => {
    const tas105Inputs = { ...get().tas105Inputs, rawValues_lbf: values };
    const tas105Outputs = values.length >= 5 ? calculateTAS105(tas105Inputs) : null;
    const updates: FastenerStoreUpdate = { tas105Inputs, tas105Outputs };
    if (tas105Outputs && tas105Outputs.pass) {
      const newInputs = { ...get().inputs, Fy_lbf: tas105Outputs.MCRF_lbf, fySource: 'tas105' as const };
      updates.inputs = newInputs;
      updates.outputs = calculateFastener(newInputs);
    }
    set({ ...updates, isDirty: true });
  },
  setTAS105Meta: (meta) => {
    set({ tas105Inputs: { ...get().tas105Inputs, ...meta } });
  },
  recalculate: () => {
    set({ outputs: calculateFastener(get().inputs) });
  },
  loadCalculation: async (id: string) => {
    const { data, error } = await supabase
      .from('fastener_calculations')
      .select('inputs_json, project_id')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return;
    const inputs = data.inputs_json as unknown as FastenerInputs;
    set({
      inputs,
      outputs: calculateFastener(inputs),
      currentCalcId: id,
      currentProjectId: data.project_id,
      isDirty: false,
    });
  },
  saveCalculation: async (userId: string, projectName: string, address: string) => {
    const { inputs, outputs, currentCalcId, currentProjectId } = get();

    if (currentCalcId && currentProjectId) {
      await supabase.from('fastener_calculations').update({
        inputs_json: inputs as any,
        results_json: outputs as any,
        name: projectName,
        system_type: inputs.systemType,
        wind_speed_mph: inputs.V,
        county: inputs.county,
        construction_type: inputs.constructionType,
        qh_asd: outputs?.qh_ASD ?? null,
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

    const { data: calc, error: calcErr } = await supabase.from('fastener_calculations').insert({
      user_id: userId,
      project_id: proj.id,
      name: projectName,
      inputs_json: inputs as any,
      results_json: outputs as any,
      system_type: inputs.systemType,
      wind_speed_mph: inputs.V,
      county: inputs.county,
      construction_type: inputs.constructionType,
      qh_asd: outputs?.qh_ASD ?? null,
    }).select('id').single();
    if (calcErr || !calc) return null;

    set({ currentCalcId: calc.id, currentProjectId: proj.id });
    return calc.id;
  },
}));
