// src/lib/tile-engine.ts
// RAS 127-20 — Tile Roof Wind Uplift
// FBC 8th Edition Test Protocols for HVHZ

export type TileMethod = 'moment' | 'force';
export type TileAttachment = 'nail_2' | 'nail_1' | 'adhesive_single' | 'adhesive_double' | 'mortar';

export interface TileInputs {
  zone1_p_psf: number;
  zone2_p_psf: number;
  zone3_p_psf: number;
  tileLength_in: number;
  tileWidth_in: number;
  headLap_in: number;
  tileWeight_psf: number;
  pitchDegrees: number;
  method: TileMethod;
  attachment: TileAttachment;
  noaNumber: string;
  noa_Mf_ftlbs?: number;
  noa_Fprime_lbs?: number;
  isHVHZ: boolean;
}

export interface TileZoneResult {
  zone: string;
  p_psf: number;
  Fr_lbs?: number;
  Fprime_lbs?: number;
  forcePass?: boolean;
  Mr_ftlbs?: number;
  Mf_ftlbs?: number;
  momentPass?: boolean;
}

export interface TileOutputs {
  zoneResults: TileZoneResult[];
  warnings: { level: 'error' | 'warning' | 'info'; message: string; reference?: string }[];
  overallPass: boolean;
}

export function calculateTile(inputs: TileInputs): TileOutputs {
  const warnings: { level: 'error' | 'warning' | 'info'; message: string; reference?: string }[] = [];
  const zones = [
    { zone: 'Zone 1 (Field)',   p: inputs.zone1_p_psf },
    { zone: 'Zone 2 (Edge)',    p: inputs.zone2_p_psf },
    { zone: 'Zone 3 (Corner)',  p: inputs.zone3_p_psf },
  ];

  const l_ft = inputs.tileLength_in / 12;
  const w_ft = inputs.tileWidth_in / 12;
  const cosTheta = Math.cos(inputs.pitchDegrees * Math.PI / 180);

  const zoneResults: TileZoneResult[] = zones.map(({ zone, p }) => {
    if (inputs.method === 'force') {
      const Fr = ((Math.abs(p) * l_ft * w_ft) - (inputs.tileWeight_psf * l_ft * w_ft)) * cosTheta;
      const Fr_rounded = Math.round(Fr * 100) / 100;
      const pass = inputs.noa_Fprime_lbs !== undefined ? inputs.noa_Fprime_lbs >= Fr_rounded : false;
      if (!pass && inputs.noa_Fprime_lbs !== undefined) {
        warnings.push({ level: 'error', message: `${zone}: F' (${inputs.noa_Fprime_lbs} lbs) < Fr (${Fr_rounded} lbs). Select higher-rated attachment.`, reference: 'RAS 127 §5.2' });
      }
      return { zone, p_psf: p, Fr_lbs: Fr_rounded, Fprime_lbs: inputs.noa_Fprime_lbs, forcePass: pass };
    } else {
      const Mr = ((Math.abs(p) * l_ft * w_ft) - (inputs.tileWeight_psf * l_ft * w_ft)) * cosTheta * (l_ft / 2);
      const Mr_rounded = Math.round(Mr * 100) / 100;
      const pass = inputs.noa_Mf_ftlbs !== undefined ? inputs.noa_Mf_ftlbs >= Mr_rounded : false;
      if (!pass && inputs.noa_Mf_ftlbs !== undefined) {
        warnings.push({ level: 'error', message: `${zone}: Mf (${inputs.noa_Mf_ftlbs} ft-lbs) < Mr (${Mr_rounded} ft-lbs). Select higher-rated fastener/adhesive pattern.`, reference: 'RAS 127 §5.3' });
      }
      return { zone, p_psf: p, Mr_ftlbs: Mr_rounded, Mf_ftlbs: inputs.noa_Mf_ftlbs, momentPass: pass };
    }
  });

  if (inputs.isHVHZ && inputs.pitchDegrees < 2.5) {
    warnings.push({ level: 'error', message: 'Tile roof minimum slope is 2½:12 (11.9°) per FBC §1507.3.2 in HVHZ.', reference: 'FBC §1507.3.2' });
  }

  const overallPass = zoneResults.every(r =>
    inputs.method === 'force' ? r.forcePass === true : r.momentPass === true
  );

  return { zoneResults, warnings, overallPass };
}
