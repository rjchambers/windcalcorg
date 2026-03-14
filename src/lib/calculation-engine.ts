// HVHZ Calc Pro — ASCE 7-22 Chapter 28 Calculation Engine
// Pure TypeScript, no dependencies
// Equation references: ASCE 7-22 Eq. 26.10-1, Eq. 28.3-1

export interface CalculationInputs {
  V: number;
  exposureCategory: 'B' | 'C' | 'D';
  h: number;
  Kzt: number;
  Kd: number;
  Ke: number;
  roofType: 'hip' | 'gable' | 'flat' | 'monoslope';
  pitchDegrees: number;
  buildingWidth: number;
  buildingLength: number;
  trussSpacing: number;
  spans: number[];
  deadLoad: number;
  designBasis: 'ASD' | 'LRFD';
  enclosureType: 'enclosed' | 'partially_enclosed' | 'open';
  hasOverhang: boolean;
  overhangWidth: number;
  riskCategory: 'I' | 'II' | 'III' | 'IV';
  connectionCapacity_lb?: number; // optional: rated uplift capacity of connection (lbs)
}

export interface Warning {
  level: 'error' | 'warning' | 'info';
  message: string;
  reference?: string;
}

export interface ZoneResult {
  zone: string;
  GCpf: number;
  GCpf_pos: number;
  GCpi: number;
  p_psf: number;
  p_psf_pos: number;
}

export interface SpanResult {
  span_ft: number;
  trib_area_ft2: number;
  zone: string;
  p_psf: number;
  main_wind_force_lb: number;
  oh_wind_force_lb: number;
  total_wind_force_lb: number;
  total_dl_lb: number;
  net_uplift_lb: number;
  is_critical: boolean;
  demand_ratio: number | null;
}

export interface OverhangResult {
  p_top_psf: number;
  p_soffit_psf: number;
  p_net_psf: number;
  area_ft2: number;
  F_oh_wind_lb: number;
  F_oh_DL_lb: number;
  net_OH_lb: number;
}

export interface Derivation {
  eq_26_10_1: string;
  eq_28_3_1: string;
  zone_a_calc: string;
}

export interface CalculationOutputs {
  Kz: number;
  qh: number;
  Kd_applied: number;
  zone_a_ft: number;
  zone_2a_width_ft: number;
  zone_results: ZoneResult[];
  span_results: SpanResult[];
  overhang: OverhangResult | null;
  warnings: Warning[];
  max_net_uplift_lb: number;
  min_net_uplift_lb: number;
  critical_zone: string;
  critical_span_ft: number;
  derivation: Derivation;
}

// Kz Table — ASCE 7-22 Table 26.10-1
const KZ_TABLE: { z: number; B: number; C: number; D: number }[] = [
  { z: 0,  B: 0.57, C: 0.85, D: 1.03 },
  { z: 15, B: 0.57, C: 0.85, D: 1.03 },
  { z: 20, B: 0.62, C: 0.90, D: 1.08 },
  { z: 25, B: 0.66, C: 0.94, D: 1.12 },
  { z: 30, B: 0.70, C: 0.98, D: 1.16 },
  { z: 40, B: 0.76, C: 1.04, D: 1.22 },
  { z: 50, B: 0.81, C: 1.09, D: 1.27 },
  { z: 60, B: 0.85, C: 1.13, D: 1.31 },
];

export function getKz(exposure: 'B' | 'C' | 'D', h: number): number {
  const z = Math.max(0, Math.min(h, 60));
  for (let i = 0; i < KZ_TABLE.length - 1; i++) {
    const lo = KZ_TABLE[i];
    const hi = KZ_TABLE[i + 1];
    if (z >= lo.z && z <= hi.z) {
      const frac = hi.z === lo.z ? 0 : (z - lo.z) / (hi.z - lo.z);
      return lo[exposure] + frac * (hi[exposure] - lo[exposure]);
    }
  }
  return KZ_TABLE[KZ_TABLE.length - 1][exposure];
}

// GCpf Tables — ASCE 7-22 Figure 28.3-1 (Negative/Uplift)
const GCPF_GABLE: Record<string, [number, number][]> = {
  '1':  [[0, -0.69], [5, -0.69], [10, -0.45], [20, -0.30], [27, -0.30], [45, -0.20]],
  '1E': [[0, -1.07], [5, -1.07], [10, -0.69], [20, -0.43], [27, -0.41], [45, -0.30]],
  '2':  [[0, -0.69], [5, -0.69], [10, -0.69], [20, -0.50], [27, -0.45], [45, -0.30]],
  '2E': [[0, -1.07], [5, -1.07], [10, -1.07], [20, -0.77], [27, -0.68], [45, -0.50]],
  '3':  [[0, -0.47], [5, -0.47], [10, -0.47], [20, -0.47], [27, -0.47], [45, -0.30]],
  '3E': [[0, -0.61], [5, -0.61], [10, -0.61], [20, -0.61], [27, -0.61], [45, -0.40]],
};

const GCPF_HIP: Record<string, [number, number][]> = {
  '1':  [[0, -0.69], [7, -0.69], [10, -0.55], [27, -0.45], [45, -0.30]],
  '1E': [[0, -1.07], [7, -1.07], [10, -0.80], [27, -0.68], [45, -0.50]],
  '2':  [[0, -0.69], [7, -0.69], [10, -0.69], [27, -0.50], [45, -0.35]],
  '2E': [[0, -1.07], [7, -1.07], [10, -1.07], [27, -0.68], [45, -0.50]],
  '3':  [[0, -0.47], [7, -0.47], [10, -0.47], [27, -0.47], [45, -0.30]],
  '3E': [[0, -0.61], [7, -0.61], [10, -0.61], [27, -0.61], [45, -0.40]],
};

const GCPF_FLAT: Record<string, [number, number][]> = {
  '1':  [[0, -0.69], [5, -0.69]],
  '1E': [[0, -1.07], [5, -1.07]],
  '2':  [[0, -0.69], [5, -0.69]],
  '2E': [[0, -1.07], [5, -1.07]],
  '3':  [[0, -0.47], [5, -0.47]],
  '3E': [[0, -0.61], [5, -0.61]],
};

// GCpf Positive (Inward) Tables — ASCE 7-22 Figure 28.3-1
const GCPF_GABLE_POS: Record<string, [number, number][]> = {
  '1':  [[0, 0.40], [5, 0.40], [10, 0.53], [20, 0.74], [27, 0.78], [45, 0.80]],
  '1E': [[0, 0.61], [5, 0.61], [10, 0.81], [20, 1.13], [27, 1.19], [45, 1.21]],
  '2':  [[0, 0.40], [5, 0.40], [10, 0.40], [20, 0.40], [27, 0.40], [45, 0.40]],
  '2E': [[0, 0.61], [5, 0.61], [10, 0.61], [20, 0.61], [27, 0.61], [45, 0.61]],
  '3':  [[0, 0.40], [5, 0.40], [10, 0.40], [20, 0.40], [27, 0.40], [45, 0.40]],
  '3E': [[0, 0.61], [5, 0.61], [10, 0.61], [20, 0.61], [27, 0.61], [45, 0.61]],
};

const GCPF_HIP_POS: Record<string, [number, number][]> = {
  '1':  [[0, 0.40], [7, 0.40], [10, 0.53], [27, 0.78], [45, 0.80]],
  '1E': [[0, 0.61], [7, 0.61], [10, 0.81], [27, 1.19], [45, 1.21]],
  '2':  [[0, 0.40], [7, 0.40], [10, 0.40], [27, 0.40], [45, 0.40]],
  '2E': [[0, 0.61], [7, 0.61], [10, 0.61], [27, 0.61], [45, 0.61]],
  '3':  [[0, 0.40], [7, 0.40], [10, 0.40], [27, 0.40], [45, 0.40]],
  '3E': [[0, 0.61], [7, 0.61], [10, 0.61], [27, 0.61], [45, 0.61]],
};

const GCPF_FLAT_POS: Record<string, [number, number][]> = {
  '1':  [[0, 0.40], [5, 0.40]],
  '1E': [[0, 0.61], [5, 0.61]],
  '2':  [[0, 0.40], [5, 0.40]],
  '2E': [[0, 0.61], [5, 0.61]],
  '3':  [[0, 0.40], [5, 0.40]],
  '3E': [[0, 0.61], [5, 0.61]],
};

function interpolateGCpf(table: [number, number][], pitch: number): number {
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

export function getGCpf(roofType: string, pitch: number, zone: string): number {
  let table: Record<string, [number, number][]>;
  if (roofType === 'hip') table = GCPF_HIP;
  else if (roofType === 'flat') {
    table = GCPF_FLAT;
    pitch = Math.min(pitch, 5); // cap flat roof pitch
  } else if (roofType === 'monoslope') {
    table = GCPF_FLAT; // monoslope not in Ch.28 — use flat as fallback
    pitch = Math.min(pitch, 5);
  } else table = GCPF_GABLE;
  const data = table[zone];
  if (!data) return -0.69;
  return interpolateGCpf(data, pitch);
}

export function getGCpfPos(roofType: string, pitch: number, zone: string): number {
  let table: Record<string, [number, number][]>;
  if (roofType === 'hip') table = GCPF_HIP_POS;
  else if (roofType === 'flat' || roofType === 'monoslope') {
    table = GCPF_FLAT_POS;
    pitch = Math.min(pitch, 5);
  } else table = GCPF_GABLE_POS;
  const data = table[zone];
  if (!data) return 0.40;
  return interpolateGCpf(data, pitch);
}

export function getZoneA(leastDim: number, h: number): number {
  return Math.max(
    Math.min(0.1 * leastDim, 0.4 * h),
    Math.max(0.04 * leastDim, 3.0)
  );
}

function getGCpi(enclosure: string): number {
  if (enclosure === 'partially_enclosed') return 0.55;
  if (enclosure === 'enclosed') return 0.18;
  return 0;
}

export function validateInputs(inputs: CalculationInputs): Warning[] {
  const warnings: Warning[] = [];
  if (inputs.h > 60) {
    warnings.push({ level: 'error', message: 'Ch. 28 Envelope Procedure limited to h ≤ 60 ft per §28.1.2.', reference: '§28.1.2' });
  }
  if (inputs.pitchDegrees > 45) {
    warnings.push({ level: 'error', message: 'θ > 45° exceeds Ch. 28 Envelope Procedure limits.', reference: '§28.1.2' });
  }
  if (inputs.pitchDegrees < 7 && inputs.roofType === 'hip') {
    warnings.push({ level: 'warning', message: 'Hip roof with θ < 7° is outside Ch. 28 hip range. Using gable/flat table.', reference: 'Fig. 28.3-1' });
  }
  // Issue 3: Monoslope not covered by Ch.28
  if (inputs.roofType === 'monoslope') {
    warnings.push({ level: 'error', message: 'Monoslope roofs are not covered by ASCE 7-22 Ch. 28 Envelope Procedure. Use Ch. 27 Directional Procedure.', reference: '§28.1.2' });
  }
  if (inputs.roofType === 'flat' && inputs.pitchDegrees > 5) {
    warnings.push({ level: 'warning', message: 'Flat roof type selected with pitch > 5°. Using gable GCpf capped at θ = 5°.', reference: 'Fig. 28.3-1' });
  }
  const ratio = Math.max(inputs.buildingLength, inputs.buildingWidth) / Math.min(inputs.buildingLength, inputs.buildingWidth);
  if (ratio > 5) {
    warnings.push({ level: 'warning', message: 'Building aspect ratio > 5. Verify applicability per §28.1.2.', reference: '§28.1.2' });
  }
  if (inputs.enclosureType === 'partially_enclosed') {
    warnings.push({ level: 'info', message: 'GCpi = ±0.55 applied. Verify opening ratios per §26.12.3.', reference: '§26.12.3' });
  }
  if (inputs.Kzt !== 1.0) {
    warnings.push({ level: 'info', message: 'Topographic amplification applied. Confirm K_zt with site survey.', reference: '§26.8' });
  }
  // Issue 4: HVHZ Exposure C enforcement (inferred from wind speed)
  if (inputs.V >= 160 && inputs.exposureCategory === 'B') {
    warnings.push({ level: 'error', message: 'Wind speed ≥ 160 mph suggests HVHZ. Exposure B is not permitted — use Exposure C per FBC §1620.1 / ASCE 7-22 §26.7.3.', reference: '§26.7.3' });
  }
  if (inputs.V >= 160 && inputs.exposureCategory === 'D') {
    warnings.push({ level: 'warning', message: 'Exposure D with V ≥ 160 mph. Confirm site is within 600 ft of open water per §26.7.3.', reference: '§26.7.3' });
  }
  // Issue 11: Minimum qh check
  const qh_check = 0.00256 * getKz(inputs.exposureCategory, inputs.h) * inputs.Kzt * inputs.Ke * inputs.V * inputs.V;
  if (qh_check < 10) {
    warnings.push({ level: 'warning', message: `Computed qh = ${qh_check.toFixed(2)} psf is very low. Verify wind speed input. Minimum design pressure per §26.1.4 may govern.`, reference: '§26.1.4' });
  }
  return warnings;
}

export function calculate(inputs: CalculationInputs): CalculationOutputs {
  const warnings = validateInputs(inputs);
  const Kz = getKz(inputs.exposureCategory, inputs.h);
  // Issue 1: ASCE 7-22 Eq. 26.10-1 — Kd removed from qh
  const qh = 0.00256 * Kz * inputs.Kzt * inputs.Ke * inputs.V * inputs.V;
  const leastDim = Math.min(inputs.buildingWidth, inputs.buildingLength);
  const zone_a = getZoneA(leastDim, inputs.h);

  const GCpi = getGCpi(inputs.enclosureType);
  const zones = ['1', '1E', '2', '2E', '3', '3E'];

  // Issue 6: Compute both uplift (negative) and inward (positive) pressures
  const zone_results: ZoneResult[] = zones.map(zone => {
    const GCpf = getGCpf(inputs.roofType, inputs.pitchDegrees, zone);
    const GCpf_pos = getGCpfPos(inputs.roofType, inputs.pitchDegrees, zone);
    // Issue 1: Kd applied at pressure step per ASCE 7-22 Eq. 28.3-1
    const p = qh * inputs.Kd * (GCpf - GCpi);
    const p_pos = qh * inputs.Kd * (GCpf_pos + GCpi);
    return { zone, GCpf, GCpf_pos, GCpi, p_psf: p, p_psf_pos: p_pos };
  });

  // Issue 2: All 6 zones for span results
  const span_results: SpanResult[] = [];
  const activeZones = ['1', '1E', '2', '2E', '3', '3E'];
  const capacity = inputs.connectionCapacity_lb ?? null;

  for (const zone of activeZones) {
    const GCpf = getGCpf(inputs.roofType, inputs.pitchDegrees, zone);
    const p = qh * inputs.Kd * (GCpf - GCpi);

    for (const span of inputs.spans) {
      const trib = inputs.trussSpacing * (span / 2);
      const windForce = p * trib;
      let ohWindForce = 0;

      // Overhang
      if (inputs.hasOverhang && inputs.overhangWidth > 0) {
        const pSoffit = -0.8 * qh * inputs.Kd;
        const pOhNet = p + pSoffit;
        const aOh = inputs.overhangWidth * inputs.trussSpacing;
        ohWindForce = pOhNet * aOh;
      }

      const totalWind = windForce + ohWindForce;
      const totalDl = inputs.designBasis === 'ASD'
        ? inputs.deadLoad * (trib + (inputs.hasOverhang ? inputs.overhangWidth * inputs.trussSpacing : 0)) * 0.6
        : inputs.deadLoad * (trib + (inputs.hasOverhang ? inputs.overhangWidth * inputs.trussSpacing : 0)) * 0.9;
      const totalNet = totalWind + totalDl;

      // Issue 5: demand_ratio based on connection capacity
      const dr = capacity ? Math.abs(totalNet) / capacity : null;

      span_results.push({
        span_ft: span,
        trib_area_ft2: trib,
        zone,
        p_psf: p,
        main_wind_force_lb: Math.round(windForce),
        oh_wind_force_lb: Math.round(ohWindForce),
        total_wind_force_lb: Math.round(totalWind),
        total_dl_lb: Math.round(totalDl),
        net_uplift_lb: Math.round(totalNet),
        is_critical: totalNet < -(capacity ?? 500),
        demand_ratio: dr ? Math.round(dr * 1000) / 1000 : null,
      });
    }
  }

  let overhang: OverhangResult | null = null;
  if (inputs.hasOverhang && inputs.overhangWidth > 0) {
    const GCpf_adj = getGCpf(inputs.roofType, inputs.pitchDegrees, '2E');
    const pTop = qh * inputs.Kd * (GCpf_adj - GCpi);
    const pSoffit = -0.8 * qh * inputs.Kd;
    const pNet = pTop + pSoffit;
    const area = inputs.overhangWidth * inputs.trussSpacing;
    const fOhWind = pNet * area;
    const fOhDl = inputs.designBasis === 'ASD' ? inputs.deadLoad * area * 0.6 : inputs.deadLoad * area * 0.9;
    overhang = {
      p_top_psf: Math.round(pTop * 100) / 100,
      p_soffit_psf: Math.round(pSoffit * 100) / 100,
      p_net_psf: Math.round(pNet * 100) / 100,
      area_ft2: Math.round(area * 100) / 100,
      F_oh_wind_lb: Math.round(fOhWind),
      F_oh_DL_lb: Math.round(fOhDl),
      net_OH_lb: Math.round(fOhWind + fOhDl),
    };
  }

  const uplifts = span_results.map(r => r.net_uplift_lb);
  const worstUplift = Math.min(...uplifts);
  const criticalResult = span_results.find(r => r.net_uplift_lb === worstUplift);

  // Issue 12: Derivation chain
  const derivation: Derivation = {
    eq_26_10_1: `qh = 0.00256 × Kz × Kzt × Ke × V² = 0.00256 × ${Kz.toFixed(3)} × ${inputs.Kzt} × ${inputs.Ke} × ${inputs.V}² = ${qh.toFixed(2)} psf [ASCE 7-22 Eq. 26.10-1]`,
    eq_28_3_1: `p = qh × Kd × (GCpf − GCpi) = ${qh.toFixed(2)} × ${inputs.Kd} × (GCpf − ${GCpi.toFixed(2)}) [ASCE 7-22 Eq. 28.3-1]`,
    zone_a_calc: `a = min(0.1×${leastDim}, 0.4×${inputs.h}) but ≥ max(0.04×${leastDim}, 3.0) = ${zone_a.toFixed(2)} ft [ASCE 7-22 §28.3.2]`,
  };

  return {
    Kz: Math.round(Kz * 1000) / 1000,
    qh: Math.round(qh * 100) / 100,
    Kd_applied: inputs.Kd,
    zone_a_ft: Math.round(zone_a * 100) / 100,
    zone_2a_width_ft: Math.round(zone_a * 2 * 100) / 100,
    zone_results,
    span_results,
    overhang,
    warnings,
    max_net_uplift_lb: worstUplift,
    min_net_uplift_lb: Math.max(...uplifts),
    critical_zone: criticalResult?.zone ?? '1',
    critical_span_ft: criticalResult?.span_ft ?? 0,
    derivation,
  };
}
