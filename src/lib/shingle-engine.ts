// src/lib/shingle-engine.ts
// RAS 128 — Asphalt Shingle Fastener Density for HVHZ
// FBC 8th Edition Test Protocols

export interface ShingleInputs {
  zone1_p_psf: number;
  zone2_p_psf: number;
  zone3_p_psf: number;
  shingleExposure_in: number;
  shingleWidth_in: number;
  fastenerResistance_lbs: number;
  noaNumber: string;
  isHVHZ: boolean;
}

export interface ShingleZoneResult {
  zone: string;
  p_psf: number;
  exposureArea_ft2: number;
  N_calculated: number;
  N_hvhz_minimum: number;
  N_required: number;
  fastenerPattern: string;
  pass: boolean;
}

const HVHZ_MIN_FASTENERS = 6;
const NON_HVHZ_MIN_FASTENERS = 4;

export function calculateShingle(inputs: ShingleInputs): {
  zoneResults: ShingleZoneResult[];
  warnings: { level: 'error' | 'warning' | 'info'; message: string; reference?: string }[];
} {
  const warnings: { level: 'error' | 'warning' | 'info'; message: string; reference?: string }[] = [];
  const hvhzMin = inputs.isHVHZ ? HVHZ_MIN_FASTENERS : NON_HVHZ_MIN_FASTENERS;

  if (inputs.isHVHZ) {
    warnings.push({ level: 'info', message: 'HVHZ: RAS 128 §3.2 requires minimum 6 fasteners per shingle in all zones.', reference: 'RAS 128 §3.2' });
  }

  const zones = [
    { zone: 'Zone 1 (Field)',   p: inputs.zone1_p_psf },
    { zone: 'Zone 2 (Edge)',    p: inputs.zone2_p_psf },
    { zone: 'Zone 3 (Corner)',  p: inputs.zone3_p_psf },
  ];

  const zoneResults: ShingleZoneResult[] = zones.map(({ zone, p }) => {
    const exposure_ft2 = (inputs.shingleExposure_in / 12) * (inputs.shingleWidth_in / 12);
    const N_calc = Math.ceil((Math.abs(p) * exposure_ft2) / inputs.fastenerResistance_lbs);
    const N_required = Math.max(N_calc, hvhzMin);
    const pass = N_required <= 6;

    let pattern = '';
    if (N_required <= 4) pattern = '4-nail standard pattern';
    else if (N_required === 5) pattern = '5-nail enhanced pattern';
    else if (N_required === 6) pattern = '6-nail HVHZ pattern (2 rows of 3)';
    else { pattern = `${N_required} nails — non-standard, verify with NOA`; }

    if (N_required > 6) {
      warnings.push({ level: 'error', message: `${zone}: ${N_required} fasteners required exceeds 6-nail HVHZ maximum. Select higher-resistance shingle or verify NOA.`, reference: 'RAS 128' });
    }

    return { zone, p_psf: p, exposureArea_ft2: Math.round(exposure_ft2 * 1000) / 1000, N_calculated: N_calc, N_hvhz_minimum: hvhzMin, N_required, fastenerPattern: pattern, pass };
  });

  return { zoneResults, warnings };
}
