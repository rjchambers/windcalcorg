// src/lib/tile-engine.ts
// TileCalc HVHZ — RAS 127 Calculation Engine
// FBC 8th Edition (2023) · ASCE 7-22 · RAS 127-20
// Covers: Moment-Based Systems (Method 1) and Uplift-Based Systems (Method 3)

export type RoofTypeT = 'hip' | 'gable';
export type ExposureCatT = 'C' | 'D';
export type SlopeBandT = '2to4' | '4to6' | '6to12';
export type TileMethodT = 'moment' | 'uplift';

export interface TileInputs {
  V: number;
  exposureCategory: ExposureCatT;
  riskCategory: 'II';
  h: number;
  roofType: RoofTypeT;
  pitchRise: number;
  hasOverhang: boolean;
  method: TileMethodT;
  lambda: number;
  Mg_ftlb: number;
  Mf_ftlb: number;
  tile_length_ft: number;
  tile_width_ft: number;
  tile_weight_lb: number;
  F_prime_lbf: number;
  county: string;
  isHVHZ: boolean;
  useEngineeredPressures: boolean;
  engineeredPasd1?: number;
  engineeredPasd2?: number;
  engineeredPasd3?: number;
}

export interface TileZonePressures {
  Pasd1: number;
  Pasd2: number;
  Pasd3: number;
  tableSource: string;
}

export interface MomentResult {
  zone: 'Field' | 'Perimeter' | 'Corner';
  Pasd: number;
  Mr_ftlb: number;
  Mf_ftlb: number;
  passes: boolean;
  demandRatio: number;
}

export interface UpliftResult {
  zone: 'Field' | 'Perimeter' | 'Corner';
  Pasd: number;
  Fr_lbf: number;
  F_prime_lbf: number;
  passes: boolean;
  demandRatio: number;
}

export interface TileWarning {
  level: 'error' | 'warning' | 'info';
  message: string;
  reference?: string;
}

export interface TileOutputs {
  zonePressures: TileZonePressures;
  momentResults?: MomentResult[];
  upliftResults?: UpliftResult[];
  overallPasses: boolean;
  criticalZone: string;
  criticalDemandRatio: number;
  warnings: TileWarning[];
  requiresPESeal: boolean;
  pitchDegrees: number;
  slopeBand: SlopeBandT;
}

// ─── RAS 127 Pressure Tables ───
// All values in psf (negative = uplift). Source: RAS 127-20 Tables 1–12.

type ZoneVals = { z1: number; z2: number; z3: number };

const GABLE_C: Record<SlopeBandT, Record<string, ZoneVals>> = {
  '2to4': {
    '≤15': { z1: -74, z2: -108, z3: -128 },
    '≤20': { z1: -78, z2: -114, z3: -136 },
    '≤25': { z1: -82, z2: -120, z3: -142 },
    '≤30': { z1: -85, z2: -125, z3: -148 },
    '≤35': { z1: -88, z2: -129, z3: -153 },
    '≤40': { z1: -91, z2: -132, z3: -157 },
    '≤45': { z1: -93, z2: -136, z3: -162 },
    '≤50': { z1: -95, z2: -139, z3: -165 },
    '≤55': { z1: -97, z2: -142, z3: -169 },
    '≤60': { z1: -98, z2: -144, z3: -171 },
  },
  '4to6': {
    '≤15': { z1: -57, z2: -91, z3: -128 },
    '≤20': { z1: -60, z2: -96, z3: -136 },
    '≤25': { z1: -63, z2: -101, z3: -142 },
    '≤30': { z1: -66, z2: -105, z3: -148 },
    '≤35': { z1: -68, z2: -109, z3: -153 },
    '≤40': { z1: -70, z2: -111, z3: -157 },
    '≤45': { z1: -72, z2: -115, z3: -162 },
    '≤50': { z1: -73, z2: -117, z3: -165 },
    '≤55': { z1: -75, z2: -120, z3: -169 },
    '≤60': { z1: -76, z2: -122, z3: -171 },
  },
  '6to12': {
    '≤15': { z1: -67, z2: -74, z3: -115 },
    '≤20': { z1: -71, z2: -78, z3: -120 },
    '≤25': { z1: -74, z2: -81, z3: -125 },
    '≤30': { z1: -77, z2: -84, z3: -130 },
    '≤35': { z1: -79, z2: -87, z3: -134 },
    '≤40': { z1: -81, z2: -89, z3: -137 },
    '≤45': { z1: -83, z2: -92, z3: -141 },
    '≤50': { z1: -85, z2: -93, z3: -143 },
    '≤55': { z1: -87, z2: -95, z3: -146 },
    '≤60': { z1: -88, z2: -97, z3: -148 },
  },
};

const GABLE_D: Record<SlopeBandT, Record<string, ZoneVals>> = {
  '2to4': {
    '≤15': { z1: -90, z2: -131, z3: -156 },
    '≤20': { z1: -94, z2: -137, z3: -163 },
    '≤25': { z1: -98, z2: -142, z3: -169 },
    '≤30': { z1: -101, z2: -148, z3: -175 },
    '≤35': { z1: -104, z2: -152, z3: -180 },
    '≤40': { z1: -106, z2: -155, z3: -184 },
    '≤45': { z1: -109, z2: -157, z3: -189 },
    '≤50': { z1: -111, z2: -161, z3: -192 },
    '≤55': { z1: -113, z2: -164, z3: -195 },
    '≤60': { z1: -114, z2: -167, z3: -198 },
  },
  '4to6': {
    '≤15': { z1: -69, z2: -110, z3: -156 },
    '≤20': { z1: -73, z2: -116, z3: -163 },
    '≤25': { z1: -75, z2: -120, z3: -169 },
    '≤30': { z1: -78, z2: -124, z3: -175 },
    '≤35': { z1: -80, z2: -128, z3: -180 },
    '≤40': { z1: -82, z2: -131, z3: -184 },
    '≤45': { z1: -84, z2: -134, z3: -189 },
    '≤50': { z1: -85, z2: -136, z3: -192 },
    '≤55': { z1: -87, z2: -138, z3: -195 },
    '≤60': { z1: -88, z2: -140, z3: -198 },
  },
  '6to12': {
    '≤15': { z1: -82, z2: -90, z3: -140 },
    '≤20': { z1: -86, z2: -94, z3: -146 },
    '≤25': { z1: -89, z2: -98, z3: -152 },
    '≤30': { z1: -92, z2: -101, z3: -157 },
    '≤35': { z1: -95, z2: -104, z3: -162 },
    '≤40': { z1: -97, z2: -106, z3: -166 },
    '≤45': { z1: -99, z2: -109, z3: -170 },
    '≤50': { z1: -101, z2: -111, z3: -173 },
    '≤55': { z1: -103, z2: -113, z3: -177 },
    '≤60': { z1: -104, z2: -114, z3: -179 },
  },
};

const HIP_C: Record<SlopeBandT, Record<string, ZoneVals>> = {
  '2to4': {
    '≤15': { z1: -67, z2: -88, z3: -94 },
    '≤20': { z1: -71, z2: -93, z3: -100 },
    '≤25': { z1: -75, z2: -97, z3: -104 },
    '≤30': { z1: -78, z2: -101, z3: -109 },
    '≤35': { z1: -80, z2: -105, z3: -113 },
    '≤40': { z1: -82, z2: -107, z3: -115 },
    '≤45': { z1: -85, z2: -110, z3: -119 },
    '≤50': { z1: -86, z2: -112, z3: -121 },
    '≤55': { z1: -88, z2: -115, z3: -124 },
    '≤60': { z1: -89, z2: -117, z3: -125 },
  },
  '4to6': {
    '≤15': { z1: -71, z2: -91, z3: -111 },
    '≤20': { z1: -75, z2: -97, z3: -118 },
    '≤25': { z1: -79, z2: -101, z3: -124 },
    '≤30': { z1: -82, z2: -105, z3: -129 },
    '≤35': { z1: -84, z2: -109, z3: -133 },
    '≤40': { z1: -87, z2: -112, z3: -137 },
    '≤45': { z1: -89, z2: -114, z3: -140 },
    '≤50': { z1: -91, z2: -117, z3: -143 },
    '≤55': { z1: -93, z2: -120, z3: -146 },
    '≤60': { z1: -94, z2: -122, z3: -149 },
  },
  '6to12': {
    '≤15': { z1: -57, z2: -101, z3: -128 },
    '≤20': { z1: -60, z2: -108, z3: -136 },
    '≤25': { z1: -63, z2: -113, z3: -143 },
    '≤30': { z1: -66, z2: -117, z3: -149 },
    '≤35': { z1: -67, z2: -121, z3: -153 },
    '≤40': { z1: -70, z2: -124, z3: -158 },
  },
};

const HIP_D: Record<SlopeBandT, Record<string, ZoneVals>> = {
  '2to4': {
    '≤15': { z1: -82, z2: -106, z3: -114 },
    '≤20': { z1: -86, z2: -111, z3: -120 },
    '≤25': { z1: -89, z2: -116, z3: -124 },
    '≤30': { z1: -91, z2: -120, z3: -129 },
    '≤35': { z1: -94, z2: -123, z3: -132 },
    '≤40': { z1: -97, z2: -126, z3: -136 },
    '≤45': { z1: -99, z2: -128, z3: -138 },
    '≤50': { z1: -101, z2: -131, z3: -141 },
    '≤55': { z1: -102, z2: -133, z3: -143 },
    '≤60': { z1: -104, z2: -135, z3: -146 },
  },
  '4to6': {
    '≤15': { z1: -65, z2: -90, z3: -90 },
    '≤20': { z1: -68, z2: -94, z3: -94 },
    '≤25': { z1: -71, z2: -98, z3: -98 },
    '≤30': { z1: -73, z2: -101, z3: -101 },
    '≤35': { z1: -75, z2: -104, z3: -104 },
    '≤40': { z1: -77, z2: -106, z3: -106 },
    '≤45': { z1: -79, z2: -109, z3: -109 },
    '≤50': { z1: -80, z2: -111, z3: -111 },
    '≤55': { z1: -82, z2: -112, z3: -112 },
    '≤60': { z1: -83, z2: -114, z3: -114 },
  },
  '6to12': {
    '≤15': { z1: -69, z2: -123, z3: -156 },
    '≤20': { z1: -73, z2: -129, z3: -163 },
    '≤25': { z1: -75, z2: -133, z3: -169 },
    '≤30': { z1: -78, z2: -138, z3: -175 },
    '≤35': { z1: -80, z2: -142, z3: -180 },
    '≤40': { z1: -82, z2: -145, z3: -184 },
    '≤45': { z1: -84, z2: -148, z3: -188 },
    '≤50': { z1: -85, z2: -151, z3: -192 },
    '≤55': { z1: -87, z2: -154, z3: -195 },
    '≤60': { z1: -88, z2: -156, z3: -198 },
  },
};

export function getSlopeBand(pitchRise: number): SlopeBandT {
  if (pitchRise <= 4) return '2to4';
  if (pitchRise <= 6) return '4to6';
  return '6to12';
}

export function getHeightBand(h: number): string {
  if (h <= 15) return '≤15';
  if (h <= 20) return '≤20';
  if (h <= 25) return '≤25';
  if (h <= 30) return '≤30';
  if (h <= 35) return '≤35';
  if (h <= 40) return '≤40';
  if (h <= 45) return '≤45';
  if (h <= 50) return '≤50';
  if (h <= 55) return '≤55';
  return '≤60';
}

export function getRAS127Pressures(inputs: TileInputs): TileZonePressures {
  const slopeBand = getSlopeBand(inputs.pitchRise);
  const hBand = getHeightBand(inputs.h);
  const table = inputs.roofType === 'gable'
    ? (inputs.exposureCategory === 'C' ? GABLE_C : GABLE_D)
    : (inputs.exposureCategory === 'C' ? HIP_C : HIP_D);

  const slopeData = table[slopeBand];
  const row = slopeData?.[hBand];
  if (!row) {
    // Fallback to nearest available
    const keys = Object.keys(slopeData ?? {});
    const fallbackRow = slopeData?.[keys[keys.length - 1]];
    if (fallbackRow) {
      return { Pasd1: fallbackRow.z1, Pasd2: fallbackRow.z2, Pasd3: fallbackRow.z3, tableSource: `RAS 127-20 — ${inputs.roofType}, ${inputs.pitchRise}:12, Exp ${inputs.exposureCategory} (extrapolated)` };
    }
    return { Pasd1: -100, Pasd2: -150, Pasd3: -200, tableSource: 'RAS 127-20 — Fallback values' };
  }

  const tableNum = inputs.roofType === 'gable' && inputs.exposureCategory === 'C' ? (['2to4', '4to6', '6to12'].indexOf(slopeBand) + 1)
    : inputs.roofType === 'gable' && inputs.exposureCategory === 'D' ? (['2to4', '4to6', '6to12'].indexOf(slopeBand) + 4)
    : inputs.roofType === 'hip' && inputs.exposureCategory === 'C' ? (['2to4', '4to6', '6to12'].indexOf(slopeBand) + 7)
    : (['2to4', '4to6', '6to12'].indexOf(slopeBand) + 10);

  return {
    Pasd1: row.z1,
    Pasd2: row.z2,
    Pasd3: row.z3,
    tableSource: `RAS 127-20 Table ${tableNum} — ${inputs.roofType} roof, ${inputs.pitchRise}:12 slope, Exp ${inputs.exposureCategory}, h ${hBand} ft`,
  };
}

export function calculateMoment(Pasd: number, lambda: number, Mg: number, Mf: number, zone: 'Field' | 'Perimeter' | 'Corner'): MomentResult {
  const Mr = (Math.abs(Pasd) * lambda) - Mg;
  return {
    zone,
    Pasd,
    Mr_ftlb: Math.round(Mr * 100) / 100,
    Mf_ftlb: Mf,
    passes: Mf >= Mr,
    demandRatio: Mf > 0 ? Math.round((Mr / Mf) * 1000) / 1000 : 999,
  };
}

export function calculateUplift(Pasd: number, l: number, w: number, W: number, pitchDeg: number, F_prime: number, zone: 'Field' | 'Perimeter' | 'Corner'): UpliftResult {
  const cosTheta = Math.cos(pitchDeg * Math.PI / 180);
  const Fr = (Math.abs(Pasd) * l * w - W) * cosTheta;
  return {
    zone,
    Pasd,
    Fr_lbf: Math.round(Fr * 100) / 100,
    F_prime_lbf: F_prime,
    passes: F_prime >= Fr,
    demandRatio: F_prime > 0 ? Math.round((Fr / F_prime) * 1000) / 1000 : 999,
  };
}

export function validateTileInputs(inputs: TileInputs): TileWarning[] {
  const warnings: TileWarning[] = [];
  const pitch = inputs.pitchRise;

  if (pitch < 2) {
    warnings.push({ level: 'error', message: 'RAS 127 requires roof slope ≥ 2:12. Use FastenerCalc for low-slope systems.', reference: 'RAS 127 §1' });
  }
  if (pitch > 12) {
    warnings.push({ level: 'error', message: 'RAS 127 tables limited to slope ≤ 12:12.', reference: 'RAS 127 §1' });
  }
  if (inputs.h > 60) {
    warnings.push({ level: 'error', message: 'RAS 127 tables limited to h ≤ 60 ft. Engineering analysis required.', reference: 'RAS 127 §1' });
  }
  if (inputs.V !== 175 || inputs.riskCategory !== 'II') {
    warnings.push({ level: 'warning', message: 'RAS 127 pre-tabulated pressures are for V = 175 mph, Risk Cat. II only. PE-sealed engineering required for other values.', reference: 'RAS 127 §1' });
  }
  if (inputs.isHVHZ && inputs.exposureCategory !== 'C' && inputs.exposureCategory !== 'D') {
    warnings.push({ level: 'error', message: 'HVHZ requires Exposure C or D.', reference: 'FBC §1620' });
  }
  if (inputs.roofType === 'hip' && pitch <= 5.5) {
    warnings.push({ level: 'info', message: 'Hip roof with slope ≤ 5.5:12: Pasd(3) = Pasd(2) per RAS 127 footnote.', reference: 'RAS 127 footnote' });
  }
  if (inputs.method === 'moment' && inputs.lambda <= 0) {
    warnings.push({ level: 'error', message: 'Aerodynamic multiplier λ must be > 0. Obtain from Product Approval.', reference: 'RAS 127 §2.5' });
  }
  if (!inputs.hasOverhang) {
    warnings.push({ level: 'warning', message: 'RAS 127 tables assume overhangs present. If no overhang, pressures may be conservative.', reference: 'RAS 127' });
  }
  return warnings;
}

export function calculateTile(inputs: TileInputs): TileOutputs {
  const warnings = validateTileInputs(inputs);
  const requiresPESeal = inputs.V !== 175 || inputs.riskCategory !== 'II' || inputs.useEngineeredPressures;
  const pitchDegrees = Math.atan(inputs.pitchRise / 12) * (180 / Math.PI);
  const slopeBand = getSlopeBand(inputs.pitchRise);

  let zonePressures: TileZonePressures;
  if (inputs.useEngineeredPressures && inputs.engineeredPasd1 && inputs.engineeredPasd2 && inputs.engineeredPasd3) {
    zonePressures = {
      Pasd1: inputs.engineeredPasd1,
      Pasd2: inputs.engineeredPasd2,
      Pasd3: inputs.engineeredPasd3,
      tableSource: 'Engineered Analysis (PE-Sealed Required)',
    };
  } else {
    zonePressures = getRAS127Pressures(inputs);
  }

  const zones: { label: 'Field' | 'Perimeter' | 'Corner'; Pasd: number }[] = [
    { label: 'Field', Pasd: zonePressures.Pasd1 },
    { label: 'Perimeter', Pasd: zonePressures.Pasd2 },
    { label: 'Corner', Pasd: zonePressures.Pasd3 },
  ];

  let momentResults: MomentResult[] | undefined;
  let upliftResults: UpliftResult[] | undefined;

  if (inputs.method === 'moment') {
    momentResults = zones.map(z => calculateMoment(z.Pasd, inputs.lambda, inputs.Mg_ftlb, inputs.Mf_ftlb, z.label));
  } else {
    upliftResults = zones.map(z => calculateUplift(z.Pasd, inputs.tile_length_ft, inputs.tile_width_ft, inputs.tile_weight_lb, pitchDegrees, inputs.F_prime_lbf, z.label));
  }

  const results = (momentResults ?? upliftResults)!;
  const criticalResult = results.reduce((worst, r) => r.demandRatio > worst.demandRatio ? r : worst, results[0]);
  const overallPasses = results.every(r => r.passes);

  if (!overallPasses) {
    const failedZones = results.filter(r => !r.passes).map(r => r.zone).join(', ');
    warnings.push({
      level: 'error',
      message: `Tile attachment FAILS in: ${failedZones}. Product Approval ${inputs.method === 'moment' ? 'Mf' : "F'"} must be increased.`,
      reference: `RAS 127 §${inputs.method === 'moment' ? '2.6' : '3.5'}`,
    });
  }

  if (overallPasses) {
    warnings.push({ level: 'info', message: 'All zones PASS. Tile attachment method is acceptable per RAS 127.', reference: 'RAS 127' });
  }

  return {
    zonePressures,
    momentResults,
    upliftResults,
    overallPasses,
    criticalZone: criticalResult.zone,
    criticalDemandRatio: criticalResult.demandRatio,
    warnings,
    requiresPESeal,
    pitchDegrees: Math.round(pitchDegrees * 10) / 10,
    slopeBand,
  };
}
