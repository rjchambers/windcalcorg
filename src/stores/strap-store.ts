import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type StrapInputs, type StrapOutputs, calculateStrap } from '@/lib/strap-engine';

interface StrapStore {
  inputs: StrapInputs;
  outputs: StrapOutputs | null;
  setInput: <K extends keyof StrapInputs>(key: K, value: StrapInputs[K]) => void;
  recalculate: () => void;
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
      setInput: (key, value) => {
        const newInputs = { ...get().inputs, [key]: value };
        set({ inputs: newInputs, outputs: calculateStrap(newInputs) });
      },
      recalculate: () => set({ outputs: calculateStrap(get().inputs) }),
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
