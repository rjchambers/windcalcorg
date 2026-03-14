import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type TileInputs, type TileOutputs, calculateTile } from '@/lib/tile-engine';

interface TileStore {
  inputs: TileInputs;
  outputs: TileOutputs | null;
  setInput: <K extends keyof TileInputs>(key: K, value: TileInputs[K]) => void;
  recalculate: () => void;
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
      setInput: (key, value) => {
        const newInputs = { ...get().inputs, [key]: value };
        set({ inputs: newInputs, outputs: calculateTile(newInputs) });
      },
      recalculate: () => set({ outputs: calculateTile(get().inputs) }),
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
