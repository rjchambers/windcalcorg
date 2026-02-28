// FastenerCalc HVHZ — Calculation Engine
// FBC 8th Edition (2023) · ASCE 7-22 Ch. 30 C&C · RAS 117 · 128 · 127 · 137 · TAS 105

// ──── Types ────

export type RoofSystemType =
  | 'modified_bitumen' | 'single_ply' | 'adhered' | 'tile' | 'shingle' | 'metal';

export type DeckType =
  | 'plywood' | 'structural_concrete' | 'steel_deck' | 'wood_plank' | 'lw_concrete';

export type ConstructionType = 'new' | 'reroof' | 'recover';

export interface FastenerInputs {
  // Site
  V: number;
  exposureCategory: 'B' | 'C' | 'D';
  h: number;
  Kzt: number;
  Kd: number;
  Ke: number;
  enclosure: 'enclosed' | 'partially_enclosed' | 'open';
  riskCategory: 'I' | 'II' | 'III' | 'IV';

  // Building
  roofType: 'low_slope' | 'hip' | 'gable' | 'monoslope';
  pitchDegrees: number;
  buildingLength: number;
  buildingWidth: number;
  parapetHeight: number;

  // System
  systemType: RoofSystemType;
  deckType: DeckType;
  constructionType: ConstructionType;
  existingLayers: number;

  // RAS 117 / 137 params
  sheetWidth_in: number;
  lapWidth_in: number;
  Fy_lbf: number;
  fySource: 'noa' | 'tas105';
  noaMDP_psf: number;
  extrapolationPermitted: boolean;
  initialRows: number;

  // Insulation
  boardLength_ft: number;
  boardWidth_ft: number;
  insulation_Fy_lbf: number;

  // Tile (RAS 127)
  tileMethod?: 1 | 2 | 3;
  tileWeight_lbf?: number;
  tileExposedLength_ft?: number;
  tileWidth_ft?: number;
  tileCGHeight_ft?: number;
  Mf_NOA?: number;
  Fprime_NOA?: number;
  lambda_coefficient?: number;

  // County/HVHZ
  county: 'miami_dade' | 'broward' | 'other';
  isHVHZ: boolean;
}

export interface FastenerWarning {
  level: 'error' | 'warning' | 'info';
  message: string;
  reference?: string;
}

export interface ZonePressures {
  zone1prime: number;
  zone1: number;
  zone2: number;
  zone3: number;
  zoneWidth_ft: number;
}

export interface FastenerZoneResult {
  zone: string;
  P_psf: number;
  n_rows: number;
  RS_in: number;
  FS_calculated_in: number;
  FS_used_in: number;
  halfSheetRequired: boolean;
  demandRatio: number;
  A_fastener_ft2: number;
  F_demand_lbf: number;
  noaCheck: 'prescriptive' | 'enhanced' | 'insufficient' | 'no_extrapolation';
  extrapolationFactor: number;
}

export interface InsulationZoneResult {
  zone: string;
  P_psf: number;
  N_required: number;
  N_prescribed: number;
  N_used: number;
  layout: string;
}

export interface TileZoneResult {
  zone: string;
  P_psf: number;
  Mr_required?: number;
  Mf_NOA?: number;
  Fr_required?: number;
  Fprime_NOA?: number;
  pass: boolean;
}

export interface TAS105Inputs {
  rawValues_lbf: number[];
}

export interface TAS105Outputs {
  n: number;
  mean_lbf: number;
  stdDev_lbf: number;
  tFactor: number;
  MCRF_lbf: number;
  pass: boolean;
}

export interface FastenerOutputs {
  qh_ASD: number;
  Kh: number;
  zonePressures: ZonePressures;
  fastenerResults: FastenerZoneResult[];
  insulationResults: InsulationZoneResult[];
  tileResults?: TileZoneResult[];
  warnings: FastenerWarning[];
  maxExtrapolationFactor: number;
  halfSheetZones: string[];
  minFS_in: number;
  overallStatus: 'ok' | 'warning' | 'fail';
}

// ──── Kh Table (same as Kz, ASCE 7-22 Table 26.10-1) ────

const KH_TABLE: { z: number; B: number; C: number; D: number }[] = [
  { z: 0,  B: 0.57, C: 0.85, D: 1.03 },
  { z: 15, B: 0.57, C: 0.85, D: 1.03 },
  { z: 20, B: 0.62, C: 0.90, D: 1.08 },
  { z: 25, B: 0.66, C: 0.94, D: 1.12 },
  { z: 30, B: 0.70, C: 0.98, D: 1.16 },
  { z: 40, B: 0.76, C: 1.04, D: 1.22 },
  { z: 50, B: 0.81, C: 1.09, D: 1.27 },
  { z: 60, B: 0.85, C: 1.13, D: 1.31 },
];

export function getKh(exposure: 'B' | 'C' | 'D', h: number): number {
  const z = Math.max(0, Math.min(h, 60));
  for (let i = 0; i < KH_TABLE.length - 1; i++) {
    const lo = KH_TABLE[i];
    const hi = KH_TABLE[i + 1];
    if (z >= lo.z && z <= hi.z) {
      const frac = hi.z === lo.z ? 0 : (z - lo.z) / (hi.z - lo.z);
      return lo[exposure] + frac * (hi[exposure] - lo[exposure]);
    }
  }
  return KH_TABLE[KH_TABLE.length - 1][exposure];
}

// ──── GCp Values (C&C, EWA = 10 ft²) ────

// Low-slope (θ ≤ 7°) — ASCE 7-22 Fig. 30.3-2A
const GCP_LOW_SLOPE: Record<string, number> = {
  "1'": -0.90,
  '1': -1.70,
  '2': -2.30,
  '3': -3.20,
};

// Steep-slope hip — interpolation breakpoints [pitch, GCp]
const GCP_STEEP_HIP: Record<string, [number, number][]> = {
  '1': [[7, -1.70], [20, -1.30], [27, -1.10], [45, -0.90]],
  '2': [[7, -2.60], [20, -2.00], [27, -1.80], [45, -1.50]],
  '3': [[7, -4.00], [20, -3.00], [27, -2.50], [45, -2.00]],
};

// Steep-slope gable
const GCP_STEEP_GABLE: Record<string, [number, number][]> = {
  '1': [[7, -1.70], [20, -1.30], [27, -1.10], [45, -0.90]],
  '2': [[7, -2.60], [20, -2.10], [27, -1.80], [45, -1.50]],
  '3': [[7, -4.00], [20, -3.20], [27, -2.60], [45, -2.00]],
};

function interpTable(table: [number, number][], pitch: number): number {
  if (pitch <= table[0][0]) return table[0][1];
  if (pitch >= table[table.length - 1][0]) return table[table.length - 1][1];
  for (let i = 0; i < table.length - 1; i++) {
    if (pitch >= table[i][0] && pitch <= table[i + 1][0]) {
      const frac = (pitch - table[i][0]) / (table[i + 1][0] - table[i][0]);
      return table[i][1] + frac * (table[i + 1][1] - table[i][1]);
    }
  }
  return table[table.length - 1][1];
}

export function getGCp(roofType: string, zone: string, pitch: number): number {
  if (roofType === 'low_slope' || pitch <= 7) {
    return GCP_LOW_SLOPE[zone] ?? GCP_LOW_SLOPE['1'];
  }
  const table = roofType === 'hip' ? GCP_STEEP_HIP : GCP_STEEP_GABLE;
  // Steep slope doesn't have zone 1'
  const lookupZone = zone === "1'" ? '1' : zone;
  const data = table[lookupZone];
  if (!data) return -1.70;
  return interpTable(data, pitch);
}

// ──── Zone Width ────

export function getZoneWidth(h: number, leastDim: number, roofType: string): number {
  if (roofType === 'low_slope') {
    return 0.6 * h; // each zone width = 0.6h
  }
  // Steep slope: a = max(min(0.1·LHD, 0.4·h), max(0.04·LHD, 3))
  const a = Math.max(
    Math.min(0.1 * leastDim, 0.4 * h),
    Math.max(0.04 * leastDim, 3.0)
  );
  return 2 * a; // zone widths are 2a
}

// ──── Zone Pressures ────

export function getZonePressures(inputs: FastenerInputs, qh_ASD: number): ZonePressures {
  const GCpi = inputs.enclosure === 'partially_enclosed' ? 0.55 :
    inputs.enclosure === 'enclosed' ? 0.18 : 0;
  
  const leastDim = Math.min(inputs.buildingWidth, inputs.buildingLength);
  const zoneWidth = getZoneWidth(inputs.h, leastDim, inputs.roofType);

  const zones = inputs.roofType === 'low_slope' || inputs.pitchDegrees <= 7
    ? ["1'", '1', '2', '3']
    : ['1', '1', '2', '3']; // steep slope: no 1', zone 1 acts as field

  const calcP = (zone: string) => {
    const GCp = getGCp(inputs.roofType, zone, inputs.pitchDegrees);
    return qh_ASD * inputs.Kd * (GCp - GCpi);
  };

  // Check if Zone 1' exists (building large enough)
  const hasZone1Prime = (inputs.roofType === 'low_slope' || inputs.pitchDegrees <= 7) &&
    (inputs.buildingLength - 2 * zoneWidth > 0) &&
    (inputs.buildingWidth - 2 * zoneWidth > 0);

  return {
    zone1prime: hasZone1Prime ? calcP("1'") : calcP('1'),
    zone1: calcP('1'),
    zone2: calcP('2'),
    zone3: calcP('3'),
    zoneWidth_ft: Math.round(zoneWidth * 100) / 100,
  };
}

// ──── RAS 117 / 137 Fastener Spacing ────

export function solveFS(Fy: number, P: number, RS: number): number {
  if (P === 0 || RS === 0) return 999;
  return (Fy * 144) / (Math.abs(P) * RS);
}

export function solveRowsAndFS(
  Fy: number, P: number, NW_in: number, initialN: number
): { n: number; RS: number; FS: number; halfSheet: boolean } {
  const absP = Math.abs(P);
  if (absP === 0) return { n: initialN, RS: NW_in / (initialN - 1), FS: 12, halfSheet: false };

  let n = initialN;
  let halfSheet = false;
  let RS: number;
  let FS: number;

  while (n <= 6) {
    RS = NW_in / (n - 1);
    FS = (Fy * 144) / (absP * RS);
    if (FS >= 6.0) {
      return { n, RS: Math.round(RS * 10) / 10, FS: Math.round(FS * 10) / 10, halfSheet: false };
    }
    n++;
  }

  // Half-sheet required
  halfSheet = true;
  const halfNW = NW_in / 2;
  n = initialN;
  while (n <= 6) {
    RS = halfNW / (n - 1);
    FS = (Fy * 144) / (absP * RS);
    if (FS >= 6.0) {
      return { n, RS: Math.round(RS * 10) / 10, FS: Math.round(FS * 10) / 10, halfSheet };
    }
    n++;
  }

  // Still insufficient
  RS = halfNW / (6 - 1);
  FS = (Fy * 144) / (absP * RS);
  return { n: 6, RS: Math.round(RS * 10) / 10, FS: Math.round(FS * 10) / 10, halfSheet };
}

function roundDownHalf(val: number): number {
  return Math.floor(val * 2) / 2;
}

function checkNOA(P: number, mdp: number, extrapolationPermitted: boolean): {
  check: 'prescriptive' | 'enhanced' | 'insufficient' | 'no_extrapolation';
  factor: number;
} {
  const absP = Math.abs(P);
  if (absP <= mdp) return { check: 'prescriptive', factor: absP / mdp };
  if (!extrapolationPermitted) return { check: 'no_extrapolation', factor: absP / mdp };
  if (absP <= 3.0 * mdp) return { check: 'enhanced', factor: absP / mdp };
  return { check: 'insufficient', factor: absP / mdp };
}

// ──── Insulation Board Fasteners ────

function calcInsulation(P: number, boardArea: number, Fy: number, zone: string): InsulationZoneResult {
  const N_required = Math.ceil((Math.abs(P) * boardArea) / Fy);
  const N_prescribed = boardArea >= 28 ? 4 : 2; // 4×8=32 -> 4; 4×4=16 -> 2
  const N_used = Math.max(N_required, N_prescribed);

  // Simple layout description
  let layout: string;
  if (N_used <= 4) layout = '2×2';
  else if (N_used <= 6) layout = '2×3';
  else if (N_used <= 9) layout = '3×3';
  else if (N_used <= 12) layout = '3×4';
  else layout = `${Math.ceil(Math.sqrt(N_used))}×${Math.ceil(N_used / Math.ceil(Math.sqrt(N_used)))}`;

  return {
    zone,
    P_psf: Math.round(Math.abs(P) * 100) / 100,
    N_required,
    N_prescribed,
    N_used,
    layout,
  };
}

// ──── RAS 127 Tile — λ Lookup ────

const LAMBDA_TABLE: [number, number][] = [
  [5, 1.95], [10, 1.80], [15, 1.65], [20, 1.52], [27, 1.40], [35, 1.30], [45, 1.20],
];

export function getRAS127lambda(pitchDegrees: number): number {
  return interpTable(LAMBDA_TABLE, pitchDegrees);
}

// ──── TAS 105 MCRF ────

export function calculateTAS105(inputs: TAS105Inputs): TAS105Outputs {
  const n = inputs.rawValues_lbf.length;
  if (n === 0) {
    return { n: 0, mean_lbf: 0, stdDev_lbf: 0, tFactor: 0, MCRF_lbf: 0, pass: false };
  }

  const mean = inputs.rawValues_lbf.reduce((a, b) => a + b, 0) / n;
  const variance = inputs.rawValues_lbf.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (n - 1);
  const stdDev = Math.sqrt(variance || 0);
  const tFactor = n >= 10 ? 1.645 : 2.010;
  const MCRF = mean - tFactor * stdDev;

  return {
    n,
    mean_lbf: Math.round(mean * 10) / 10,
    stdDev_lbf: Math.round(stdDev * 10) / 10,
    tFactor,
    MCRF_lbf: Math.round(MCRF * 10) / 10,
    pass: MCRF >= 275,
  };
}

// ──── Warnings ────

export function validateFastenerInputs(inputs: FastenerInputs): FastenerWarning[] {
  const warnings: FastenerWarning[] = [];

  if (inputs.isHVHZ && inputs.exposureCategory !== 'C') {
    warnings.push({ level: 'error', message: 'HVHZ requires Exposure Category C per FBC §1620 and ASCE 7-22 §26.7.3.', reference: '§26.7.3' });
  }
  if (inputs.h > 60) {
    warnings.push({ level: 'error', message: 'Ch. 30 Envelope Procedure limited to h ≤ 60 ft.', reference: '§30.1' });
  }
  if (inputs.constructionType === 'recover' && inputs.existingLayers > 1) {
    warnings.push({ level: 'error', message: 'FBC §1521 prohibits recover over more than one existing roof layer in HVHZ.', reference: '§1521' });
  }
  if (inputs.deckType === 'lw_concrete' && inputs.fySource !== 'tas105') {
    warnings.push({ level: 'warning', message: 'Lightweight insulating concrete decks require TAS 105 field testing per FBC HVHZ §1620.', reference: '§1620' });
  }
  if (inputs.constructionType === 'reroof' && inputs.fySource !== 'tas105') {
    warnings.push({ level: 'warning', message: 'Re-roof applications require TAS 105 field withdrawal testing.', reference: 'TAS 105' });
  }
  if (inputs.enclosure === 'partially_enclosed') {
    warnings.push({ level: 'info', message: 'GCpi = ±0.55 applied. Verify opening ratios per §26.12.3.', reference: '§26.12.3' });
  }
  if (inputs.Kzt !== 1.0) {
    warnings.push({ level: 'info', message: 'Topographic amplification applied. Confirm Kzt with site survey.', reference: '§26.8' });
  }
  if (inputs.parapetHeight > 0) {
    warnings.push({ level: 'info', message: 'Parapet present. Zone 3 corners start at inside face of parapet per ASCE 7-22 §26.2.', reference: '§26.2' });
  }
  if (inputs.county === 'miami_dade') {
    warnings.push({ level: 'info', message: 'Miami-Dade HVHZ requires a Miami-Dade NOA (Notice of Acceptance).', reference: 'NOA' });
  }

  return warnings;
}

// ──── Main Calculator ────

export function calculateFastener(inputs: FastenerInputs): FastenerOutputs {
  const warnings = validateFastenerInputs(inputs);

  // qh_ASD = 0.00256 × Kh × Kzt × Ke × V² × 0.6
  const Kh = getKh(inputs.exposureCategory, inputs.h);
  const qh_ASD = 0.00256 * Kh * inputs.Kzt * inputs.Ke * inputs.V * inputs.V * 0.6;

  const zonePressures = getZonePressures(inputs, qh_ASD);

  // Fastener spacing per zone
  const NW = inputs.sheetWidth_in - inputs.lapWidth_in;
  const zoneKeys = ['1\'', '1', '2', '3'] as const;
  const zonePressureMap: Record<string, number> = {
    "1'": zonePressures.zone1prime,
    '1': zonePressures.zone1,
    '2': zonePressures.zone2,
    '3': zonePressures.zone3,
  };

  const fastenerResults: FastenerZoneResult[] = [];
  const halfSheetZones: string[] = [];

  for (const zone of zoneKeys) {
    const P = zonePressureMap[zone];
    const { n, RS, FS, halfSheet } = solveRowsAndFS(inputs.Fy_lbf, P, NW, inputs.initialRows);

    const FS_used = Math.max(Math.min(roundDownHalf(FS), 12), 4);
    const A_f = (FS_used * RS) / 144;
    const F_demand = Math.abs(P) * A_f;
    const DR = inputs.Fy_lbf > 0 ? F_demand / inputs.Fy_lbf : 0;

    const { check, factor } = checkNOA(P, inputs.noaMDP_psf, inputs.extrapolationPermitted);

    if (halfSheet) halfSheetZones.push(zone);
    if (halfSheet) {
      warnings.push({ level: 'warning', message: `Half-sheet installation required in Zone ${zone}.`, reference: 'RAS 117' });
    }
    if (check === 'insufficient') {
      warnings.push({ level: 'error', message: `Zone ${zone} pressure (${Math.abs(P).toFixed(1)} psf) exceeds 300% of NOA MDP (${inputs.noaMDP_psf} psf).`, reference: 'RAS 128' });
    }
    if (check === 'no_extrapolation') {
      warnings.push({ level: 'error', message: `NOA marked with asterisk — no extrapolation permitted. Zone ${zone} exceeds MDP.`, reference: 'NOA' });
    }
    if (n > 5) {
      warnings.push({ level: 'warning', message: `More than 5 fastener rows in Zone ${zone}. Consider higher-capacity fastener.`, reference: 'RAS 117' });
    }

    fastenerResults.push({
      zone,
      P_psf: Math.round(Math.abs(P) * 100) / 100,
      n_rows: n,
      RS_in: RS,
      FS_calculated_in: Math.round(FS * 10) / 10,
      FS_used_in: FS_used,
      halfSheetRequired: halfSheet,
      demandRatio: Math.round(DR * 1000) / 1000,
      A_fastener_ft2: Math.round(A_f * 1000) / 1000,
      F_demand_lbf: Math.round(F_demand * 10) / 10,
      noaCheck: check,
      extrapolationFactor: Math.round(factor * 100) / 100,
    });
  }

  // Insulation
  const boardArea = inputs.boardLength_ft * inputs.boardWidth_ft;
  const insulationResults: InsulationZoneResult[] = zoneKeys.map(zone =>
    calcInsulation(zonePressureMap[zone], boardArea, inputs.insulation_Fy_lbf || inputs.Fy_lbf, zone)
  );

  // Tile results (RAS 127)
  let tileResults: TileZoneResult[] | undefined;
  if (inputs.systemType === 'tile' && inputs.tileMethod) {
    const pitchRad = (inputs.pitchDegrees * Math.PI) / 180;
    tileResults = ['1', '2', '3'].map(zone => {
      const P = Math.abs(zonePressureMap[zone]);
      if (inputs.tileMethod === 1) {
        const lambda = inputs.lambda_coefficient ?? getRAS127lambda(inputs.pitchDegrees);
        const Mg = (inputs.tileWeight_lbf ?? 0) * Math.cos(pitchRad) * (inputs.tileCGHeight_ft ?? 0);
        const Mr = P * lambda - Mg;
        const Mf = inputs.Mf_NOA ?? 0;
        return { zone, P_psf: P, Mr_required: Math.round(Mr * 10) / 10, Mf_NOA: Mf, pass: Mf >= Mr };
      }
      if (inputs.tileMethod === 3) {
        const Fr = P * (inputs.tileExposedLength_ft ?? 0) * (inputs.tileWidth_ft ?? 0) -
          (inputs.tileWeight_lbf ?? 0) * Math.cos(pitchRad);
        const Fp = inputs.Fprime_NOA ?? 0;
        return { zone, P_psf: P, Fr_required: Math.round(Fr * 10) / 10, Fprime_NOA: Fp, pass: Fp >= Fr };
      }
      // Method 2 simplified — pass through
      return { zone, P_psf: P, pass: true };
    });

    tileResults.forEach(tr => {
      if (!tr.pass) {
        warnings.push({
          level: 'error',
          message: `Tile attachment insufficient in Zone ${tr.zone}. Upgrade attachment method.`,
          reference: 'RAS 127'
        });
      }
    });
  }

  const maxExtrap = Math.max(...fastenerResults.map(r => r.extrapolationFactor), 0);
  const minFS = Math.min(...fastenerResults.map(r => r.FS_used_in));
  const hasErrors = warnings.some(w => w.level === 'error');
  const hasWarnings = warnings.some(w => w.level === 'warning');

  return {
    qh_ASD: Math.round(qh_ASD * 100) / 100,
    Kh: Math.round(Kh * 1000) / 1000,
    zonePressures,
    fastenerResults,
    insulationResults,
    tileResults,
    warnings,
    maxExtrapolationFactor: Math.round(maxExtrap * 100) / 100,
    halfSheetZones,
    minFS_in: minFS,
    overallStatus: hasErrors ? 'fail' : hasWarnings ? 'warning' : 'ok',
  };
}
