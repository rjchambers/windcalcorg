import { describe, it, expect } from 'vitest';
import { calculateFastener, getKh, solveRowsAndFS, getGCpByArea, calculateTAS105 } from '../lib/fastener-engine';

describe('getKh', () => {
  it('returns 0.85 for Exposure C at h=15ft', () => {
    expect(getKh('C', 15)).toBeCloseTo(0.85, 2);
  });
});

describe('getGCpByArea (Issue 7)', () => {
  it('returns -1.70 for zone 1 at EWA=10', () => {
    expect(getGCpByArea('1', 10)).toBeCloseTo(-1.70, 2);
  });
  it('returns less negative value at EWA=32 (4x8 board)', () => {
    const gcp32 = getGCpByArea('1', 32);
    expect(gcp32).toBeGreaterThan(-1.70);
    expect(gcp32).toBeLessThan(-0.90);
  });
  it('zone 1-prime is flat at -0.90 regardless of EWA', () => {
    expect(getGCpByArea("1'", 10)).toBeCloseTo(-0.90, 2);
    expect(getGCpByArea("1'", 200)).toBeCloseTo(-0.90, 2);
  });
});

describe('solveRowsAndFS', () => {
  it('returns FS >= 6 inches for typical inputs', () => {
    const result = solveRowsAndFS(29.48, -45, 35.375, 4);
    expect(result.FS).toBeGreaterThanOrEqual(6.0);
  });
});

describe('calculateTAS105 — t-factor table (Issue 10)', () => {
  it('uses correct t-factor for n=5', () => {
    const result = calculateTAS105({ rawValues_lbf: [300, 310, 320, 330, 340] });
    expect(result.tFactor).toBeCloseTo(2.132, 2);
  });
  it('uses correct t-factor for n=10', () => {
    const values = Array.from({ length: 10 }, (_, i) => 300 + i * 5);
    const result = calculateTAS105({ rawValues_lbf: values });
    expect(result.tFactor).toBeCloseTo(1.833, 2);
  });
});

const defaultInputs = {
  V: 175, exposureCategory: 'C' as const, h: 15, Kzt: 1.0, Kd: 0.85, Ke: 1.0,
  enclosure: 'enclosed' as const, riskCategory: 'II' as const,
  buildingLength: 60, buildingWidth: 40, parapetHeight: 0,
  systemType: 'modified_bitumen' as const, deckType: 'plywood' as const,
  constructionType: 'new' as const, existingLayers: 0,
  sheetWidth_in: 39.375, lapWidth_in: 4, Fy_lbf: 29.48, fySource: 'noa' as const, initialRows: 4,
  noa: { approvalType: 'miami_dade_noa' as const, approvalNumber: 'TEST', mdp_psf: -60, asterisked: false },
  boardLength_ft: 4, boardWidth_ft: 8, insulation_Fy_lbf: 29.48,
  county: 'miami_dade' as const, isHVHZ: true,
};

describe('calculateFastener — qh_ASD includes Kd', () => {
  it('qh_ASD = 0.00256 * Kh * Kzt * Kd * Ke * V² * 0.6', () => {
    const result = calculateFastener(defaultInputs);
    const Kh = getKh('C', 15);
    const expected = 0.00256 * Kh * 1.0 * 0.85 * 1.0 * 175 * 175 * 0.6;
    expect(result.qh_ASD).toBeCloseTo(expected, 0);
  });
});

describe('calculateFastener — Zone 3 L-shape (Issue 8)', () => {
  it('zone pressures include zone3_depth_ft and zone3_length_ft', () => {
    const result = calculateFastener(defaultInputs);
    expect(result.zonePressures.zone3_depth_ft).toBeCloseTo(0.2 * 15, 1);
    expect(result.zonePressures.zone3_length_ft).toBeCloseTo(0.6 * 15, 1);
  });
});

describe('calculateFastener — EWA output (Issue 7)', () => {
  it('outputs ewa values', () => {
    const result = calculateFastener(defaultInputs);
    expect(result.ewa_membrane_ft2).toBe(10);
    expect(result.ewa_insulation_ft2).toBe(32);
  });
});

describe('calculateFastener — derivation (Issue 12)', () => {
  it('includes derivation strings', () => {
    const result = calculateFastener(defaultInputs);
    expect(result.derivation.eq_26_10_1).toContain('Eq. 26.10-1');
    expect(result.derivation.qh_asd).toContain('ASD');
    expect(result.derivation.ras117_fs).toContain('RAS 117');
  });
});

describe('calculateFastener — HVHZ min wind speed (Issue 11)', () => {
  it('errors when V < 150 in HVHZ', () => {
    const result = calculateFastener({ ...defaultInputs, V: 120 });
    const hasError = result.warnings.some(w => w.level === 'error' && w.message.includes('below the HVHZ minimum'));
    expect(hasError).toBe(true);
  });
});

describe('calculateFastener — MDP high-value warning (Issue 9)', () => {
  it('warns when MDP > 200 psf', () => {
    const result = calculateFastener({ ...defaultInputs, noa: { ...defaultInputs.noa, mdp_psf: -250 } });
    const hasWarning = result.warnings.some(w => w.message.includes('unusually high'));
    expect(hasWarning).toBe(true);
  });
});
