// FastenerCalc HVHZ — Calculation Engine v3.0
// FBC 8th Edition (2023) · ASCE 7-22 Ch. 30 C&C · RAS 117 · 128 · 137 · TAS 105
// Low-slope (≤ 7°) mechanically attached roofing systems ONLY

// ──── Types ────

export type RoofSystemType = 'modified_bitumen' | 'single_ply' | 'adhered';

export type DeckType =
  | 'plywood' | 'structural_concrete' | 'steel_deck' | 'wood_plank' | 'lw_concrete';

export type ConstructionType = 'new' | 'reroof' | 'recover';

export type ZoneAttachmentBasis =
  | 'prescriptive'        // P ≤ MDP — use NOA pattern
  | 'rational_analysis'   // P > MDP, factor ≤ 3.0 — RAS 117 calc governs
  | 'exceeds_300pct'      // P > 3.0 × MDP — assembly change needed
  | 'asterisked_fail';    // asterisked + P > MDP — no extrapolation

export interface NOAParams {
  approvalType: 'miami_dade_noa' | 'fl_product_approval';
  approvalNumber: string;
  manufacturer?: string;
  productName?: string;
  systemNumber?: string;
  mdp_psf: number;        // stored negative, e.g. -60.0
  asterisked: boolean;     // only true for (*) marked assemblies
}

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

  // Building (low-slope only)
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
  initialRows: number;

  // NOA
  noa: NOAParams;

  // Insulation
  boardLength_ft: number;
  boardWidth_ft: number;
  insulation_Fy_lbf: number;

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

export interface NOAZoneResult {
  zone: string;
  P_psf: number;
  MDP_psf: number;
  extrapFactor: number;
  basis: ZoneAttachmentBasis;
  message: string;
  blocksCalculation: boolean;
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
  noaCheck: NOAZoneResult;
}

export interface InsulationZoneResult {
  zone: string;
  P_psf: number;
  N_required: number;
  N_prescribed: number;
  N_used: number;
  layout: string;
}

export interface TAS105Inputs {
  rawValues_lbf: number[];
  testingAgency?: string;
  testDate?: string;
  deckConditionNotes?: string;
  testLocationDescription?: string;
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
  GCpi: number;
  zonePressures: ZonePressures;
  fastenerResults: FastenerZoneResult[];
  insulationResults: InsulationZoneResult[];
  noaResults: NOAZoneResult[];
  warnings: FastenerWarning[];
  maxExtrapolationFactor: number;
  halfSheetZones: string[];
  minFS_in: number;
  overallStatus: 'ok' | 'warning' | 'fail';
}

// ──── Kh Table (ASCE 7-22 Table 26.10-1) ────

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

// ──── GCp Values (C&C, EWA = 10 ft², low-slope only) ────

const GCP_LOW_SLOPE: Record<string, number> = {
  "1'": -0.90,
  '1': -1.70,
  '2': -2.30,
  '3': -3.20,
};

export function getGCp(zone: string): number {
  return GCP_LOW_SLOPE[zone] ?? GCP_LOW_SLOPE['1'];
}

// ──── Zone Width (low-slope: 0.6h) ────

export function getZoneWidth(h: number): number {
  return 0.6 * h;
}

// ──── Zone Pressures ────

export function getZonePressures(inputs: FastenerInputs, qh_ASD: number): ZonePressures {
  const GCpi = inputs.enclosure === 'partially_enclosed' ? 0.55 :
    inputs.enclosure === 'enclosed' ? 0.18 : 0;
  
  const h_effective = inputs.h + (inputs.parapetHeight ?? 0);
  const zoneWidth = getZoneWidth(h_effective);

  const calcP = (zone: string) => {
    const GCp = getGCp(zone);
    return qh_ASD * (GCp - GCpi);
  };

  const hasZone1Prime = 
    (inputs.buildingLength > 2 * zoneWidth) &&
    (inputs.buildingWidth > 2 * zoneWidth);

  return {
    zone1prime: hasZone1Prime ? calcP("1'") : calcP('1'),
    zone1: calcP('1'),
    zone2: calcP('2'),
    zone3: calcP('3'),
    zoneWidth_ft: Math.round(zoneWidth * 100) / 100,
  };
}

// ──── NOA Compatibility Check (Corrected 3-State Logic) ────

export function checkNOACompatibility(
  zonePressures: Record<string, number>,
  mdp_psf: number,
  asterisked: boolean
): NOAZoneResult[] {
  return Object.entries(zonePressures).map(([zone, P]) => {
    const P_abs = Math.abs(P);
    const MDP_abs = Math.abs(mdp_psf);
    const factor = MDP_abs > 0 ? P_abs / MDP_abs : 999;

    if (P_abs <= MDP_abs) {
      return {
        zone, P_psf: P, MDP_psf: mdp_psf, extrapFactor: factor,
        basis: 'prescriptive' as ZoneAttachmentBasis,
        message: 'Within NOA MDP. Use prescriptive pattern.',
        blocksCalculation: false,
      };
    }
    if (asterisked) {
      return {
        zone, P_psf: P, MDP_psf: mdp_psf, extrapFactor: factor,
        basis: 'asterisked_fail' as ZoneAttachmentBasis,
        message: 'Asterisked assembly: extrapolation not permitted. MDP must meet zone pressure.',
        blocksCalculation: true,
      };
    }
    if (factor > 3.0) {
      return {
        zone, P_psf: P, MDP_psf: mdp_psf, extrapFactor: factor,
        basis: 'exceeds_300pct' as ZoneAttachmentBasis,
        message: `Zone pressure exceeds 3.0x MDP limit (${factor.toFixed(2)}x). Select higher-MDP assembly or install half-sheets.`,
        blocksCalculation: true,
      };
    }
    // Normal RAS 117 rational analysis path
    return {
      zone, P_psf: P, MDP_psf: mdp_psf, extrapFactor: factor,
      basis: 'rational_analysis' as ZoneAttachmentBasis,
      message: `RAS 117 rational analysis. Extrapolation factor: ${factor.toFixed(2)}x (limit: 3.00x).`,
      blocksCalculation: false,
    };
  });
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
  const halfNW = NW_in / 2;
  n = initialN;
  while (n <= 6) {
    RS = halfNW / (n - 1);
    FS = (Fy * 144) / (absP * RS);
    if (FS >= 6.0) {
      return { n, RS: Math.round(RS * 10) / 10, FS: Math.round(FS * 10) / 10, halfSheet: true };
    }
    n++;
  }

  RS = halfNW / (6 - 1);
  FS = (Fy * 144) / (absP * RS);
  return { n: 6, RS: Math.round(RS * 10) / 10, FS: Math.round(FS * 10) / 10, halfSheet: true };
}

function roundDownHalf(val: number): number {
  return Math.floor(val * 2) / 2;
}

// ──── Insulation Board Fasteners ────

function calcInsulation(P: number, boardArea: number, Fy: number, zone: string): InsulationZoneResult {
  const N_required = Math.ceil((Math.abs(P) * boardArea) / Fy);
  const N_prescribed = boardArea >= 28 ? 4 : 2;
  const N_used = Math.max(N_required, N_prescribed);

  let layout: string;
  if (N_used <= 4) layout = '2x2';
  else if (N_used <= 6) layout = '2x3';
  else if (N_used <= 9) layout = '3x3';
  else if (N_used <= 12) layout = '3x4';
  else layout = `${Math.ceil(Math.sqrt(N_used))}x${Math.ceil(N_used / Math.ceil(Math.sqrt(N_used)))}`;

  return {
    zone,
    P_psf: Math.round(Math.abs(P) * 100) / 100,
    N_required,
    N_prescribed,
    N_used,
    layout,
  };
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

// ──── TAS 105 Required Check ────

export function isTAS105Required(deckType: DeckType, constructionType: ConstructionType): {
  required: boolean;
  reason: string;
} {
  if (deckType === 'lw_concrete') {
    return { required: true, reason: 'LW insulating concrete always requires TAS 105 field testing.' };
  }
  if (deckType === 'structural_concrete' && (constructionType === 'reroof' || constructionType === 'recover')) {
    return { required: true, reason: 'Structural concrete reroof/recover requires TAS 105.' };
  }
  if ((deckType === 'plywood' || deckType === 'wood_plank') && constructionType === 'recover') {
    return { required: true, reason: 'Wood deck recover requires TAS 105.' };
  }
  if (deckType === 'steel_deck' && constructionType === 'recover') {
    return { required: true, reason: 'Steel deck recover requires TAS 105.' };
  }
  return { required: false, reason: '' };
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
  
  // TAS 105 warnings
  const tas105check = isTAS105Required(inputs.deckType, inputs.constructionType);
  if (tas105check.required && inputs.fySource !== 'tas105') {
    warnings.push({
      level: inputs.deckType === 'lw_concrete' ? 'error' : 'warning',
      message: tas105check.reason + ' Enter TAS 105 test results.',
      reference: 'TAS 105',
    });
  }
  if (!tas105check.required && (inputs.deckType === 'plywood' || inputs.deckType === 'wood_plank') &&
      (inputs.constructionType === 'new' || inputs.constructionType === 'reroof')) {
    warnings.push({
      level: 'info',
      message: `TAS 105 not required for ${inputs.deckType} ${inputs.constructionType}. Using NOA Fy = ${inputs.Fy_lbf} lbf.`,
      reference: 'TAS 105',
    });
  }

  // NOA warnings
  if (!inputs.noa.mdp_psf) {
    warnings.push({ level: 'error', message: 'NOA Maximum Design Pressure (MDP) is required.', reference: 'NOA' });
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

  const Kh = getKh(inputs.exposureCategory, inputs.h);
  const qh_ASD = 0.00256 * Kh * inputs.Kzt * inputs.Kd * inputs.Ke * inputs.V * inputs.V * 0.6;
  const GCpi = inputs.enclosure === 'partially_enclosed' ? 0.55 :
    inputs.enclosure === 'enclosed' ? 0.18 : 0;

  const zonePressures = getZonePressures(inputs, qh_ASD);

  // NOA Compatibility Check (corrected 3-state)
  const zonePressureMap: Record<string, number> = {
    "1'": zonePressures.zone1prime,
    '1': zonePressures.zone1,
    '2': zonePressures.zone2,
    '3': zonePressures.zone3,
  };

  const noaResults = checkNOACompatibility(
    zonePressureMap,
    inputs.noa.mdp_psf,
    inputs.noa.asterisked
  );

  // Add NOA-related warnings (only for actual problems)
  for (const nr of noaResults) {
    if (nr.basis === 'exceeds_300pct') {
      warnings.push({
        level: 'error',
        message: `Zone ${nr.zone}: pressure (${Math.abs(nr.P_psf).toFixed(1)} psf) exceeds 3.0x NOA MDP (${Math.abs(nr.MDP_psf)} psf). Install half-sheets or select higher-MDP assembly.`,
        reference: 'RAS 137 §6.1.3',
      });
    }
    if (nr.basis === 'asterisked_fail') {
      warnings.push({
        level: 'error',
        message: `Asterisked assembly: Zone ${nr.zone} pressure (${Math.abs(nr.P_psf).toFixed(1)} psf) exceeds NOA MDP (${Math.abs(nr.MDP_psf)} psf). Extrapolation not permitted.`,
        reference: 'NOA',
      });
    }
    // Near 300% info
    if (nr.basis === 'rational_analysis' && nr.extrapFactor > 2.7) {
      warnings.push({
        level: 'info',
        message: `Zone ${nr.zone} extrapolation factor is ${nr.extrapFactor.toFixed(2)}x — approaching the 3.0x limit.`,
        reference: 'RAS 137 §6.1.3',
      });
    }
  }

  // All zones prescriptive info
  if (noaResults.every(nr => nr.basis === 'prescriptive')) {
    warnings.push({
      level: 'info',
      message: 'All zones within NOA MDP. Prescriptive attachment pattern may be used throughout.',
      reference: 'NOA',
    });
  }

  // Fastener spacing per zone
  // Adhered membrane: no fastener spacing calculation
  if (inputs.systemType === 'adhered') {
    warnings.push({
      level: 'info',
      message: 'Adhered membrane: Verify NOA listed adhesive bond strength (psf) meets or exceeds all zone pressures. No row spacing calculation applies.',
      reference: 'TAS 124'
    });

    const boardArea = inputs.boardLength_ft * inputs.boardWidth_ft;
    const zoneKeys = ["1'", '1', '2', '3'] as const;
    const insulationResults: InsulationZoneResult[] = zoneKeys.map(zone =>
      calcInsulation(zonePressureMap[zone], boardArea, inputs.insulation_Fy_lbf || inputs.Fy_lbf, zone)
    );
    const maxExtrap = Math.max(...noaResults.map(r => r.extrapFactor), 0);
    const hasErrors = warnings.some(w => w.level === 'error');
    const hasWarnings_adhered = warnings.some(w => w.level === 'warning');

    return {
      qh_ASD: Math.round(qh_ASD * 100) / 100,
      Kh: Math.round(Kh * 1000) / 1000,
      GCpi,
      zonePressures,
      fastenerResults: [],
      insulationResults,
      noaResults,
      warnings,
      maxExtrapolationFactor: Math.round(maxExtrap * 100) / 100,
      halfSheetZones: [],
      minFS_in: 0,
      overallStatus: hasErrors ? 'fail' : hasWarnings_adhered ? 'warning' : 'ok',
    };
  }

  const NW = inputs.sheetWidth_in - inputs.lapWidth_in;
  const zoneKeys = ["1'", '1', '2', '3'] as const;

  const fastenerResults: FastenerZoneResult[] = [];
  const halfSheetZones: string[] = [];

  for (const zone of zoneKeys) {
    const P = zonePressureMap[zone];
    const noaResult = noaResults.find(nr => nr.zone === zone)!;
    const { n, RS, FS, halfSheet } = solveRowsAndFS(inputs.Fy_lbf, P, NW, inputs.initialRows);

    const FS_used = Math.max(Math.min(roundDownHalf(FS), 12), 4);
    const A_f = (FS_used * RS) / 144;
    const F_demand = Math.abs(P) * A_f;
    const DR = inputs.Fy_lbf > 0 ? F_demand / inputs.Fy_lbf : 0;

    if (halfSheet) halfSheetZones.push(zone);
    if (halfSheet) {
      warnings.push({ level: 'warning', message: `Half-sheet installation required in Zone ${zone}.`, reference: 'RAS 117' });
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
      noaCheck: noaResult,
    });
  }

  // Insulation
  const boardArea = inputs.boardLength_ft * inputs.boardWidth_ft;
  const insulationResults: InsulationZoneResult[] = zoneKeys.map(zone =>
    calcInsulation(zonePressureMap[zone], boardArea, inputs.insulation_Fy_lbf || inputs.Fy_lbf, zone)
  );

  const maxExtrap = Math.max(...noaResults.map(r => r.extrapFactor), 0);
  const minFS = Math.min(...fastenerResults.map(r => r.FS_used_in));
  const hasErrors = warnings.some(w => w.level === 'error');
  const hasWarnings = warnings.some(w => w.level === 'warning');

  return {
    qh_ASD: Math.round(qh_ASD * 100) / 100,
    Kh: Math.round(Kh * 1000) / 1000,
    GCpi,
    zonePressures,
    fastenerResults,
    insulationResults,
    noaResults,
    warnings,
    maxExtrapolationFactor: Math.round(maxExtrap * 100) / 100,
    halfSheetZones,
    minFS_in: minFS,
    overallStatus: hasErrors ? 'fail' : hasWarnings ? 'warning' : 'ok',
  };
}
