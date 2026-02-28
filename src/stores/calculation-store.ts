import { create } from 'zustand';
import { type CalculationInputs, type CalculationOutputs, calculate } from '@/lib/calculation-engine';

interface CalculationStore {
  inputs: CalculationInputs;
  outputs: CalculationOutputs | null;
  setInput: <K extends keyof CalculationInputs>(key: K, value: CalculationInputs[K]) => void;
  recalculate: () => void;
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

export const useCalculationStore = create<CalculationStore>((set, get) => ({
  inputs: defaultInputs,
  outputs: calculate(defaultInputs),
  setInput: (key, value) => {
    const newInputs = { ...get().inputs, [key]: value };
    set({ inputs: newInputs, outputs: calculate(newInputs) });
  },
  recalculate: () => {
    set({ outputs: calculate(get().inputs) });
  },
}));
