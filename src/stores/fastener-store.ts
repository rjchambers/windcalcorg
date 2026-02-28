import { create } from 'zustand';
import {
  type FastenerInputs,
  type FastenerOutputs,
  type TAS105Inputs,
  type TAS105Outputs,
  type NOAParams,
  calculateFastener,
  calculateTAS105,
} from '@/lib/fastener-engine';

interface FastenerStore {
  inputs: FastenerInputs;
  outputs: FastenerOutputs | null;
  tas105Inputs: TAS105Inputs;
  tas105Outputs: TAS105Outputs | null;
  setInput: <K extends keyof FastenerInputs>(key: K, value: FastenerInputs[K]) => void;
  setNOA: <K extends keyof NOAParams>(key: K, value: NOAParams[K]) => void;
  setTAS105Values: (values: number[]) => void;
  setTAS105Meta: (meta: Partial<TAS105Inputs>) => void;
  recalculate: () => void;
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
  setInput: (key, value) => {
    const newInputs = { ...get().inputs, [key]: value };
    set({ inputs: newInputs, outputs: calculateFastener(newInputs) });
  },
  setNOA: (key, value) => {
    const newNOA = { ...get().inputs.noa, [key]: value };
    const newInputs = { ...get().inputs, noa: newNOA };
    set({ inputs: newInputs, outputs: calculateFastener(newInputs) });
  },
  setTAS105Values: (values) => {
    const tas105Inputs = { ...get().tas105Inputs, rawValues_lbf: values };
    const tas105Outputs = values.length >= 5 ? calculateTAS105(tas105Inputs) : null;
    const updates: Partial<FastenerStore> = { tas105Inputs, tas105Outputs };
    if (tas105Outputs && tas105Outputs.pass) {
      const newInputs = { ...get().inputs, Fy_lbf: tas105Outputs.MCRF_lbf, fySource: 'tas105' as const };
      updates.inputs = newInputs;
      updates.outputs = calculateFastener(newInputs);
    }
    set(updates as any);
  },
  setTAS105Meta: (meta) => {
    set({ tas105Inputs: { ...get().tas105Inputs, ...meta } });
  },
  recalculate: () => {
    set({ outputs: calculateFastener(get().inputs) });
  },
}));
