import { describe, it, expect } from 'vitest';
import { calculate, getKz, getZoneA, getGCpfPos } from '../lib/calculation-engine';

describe('getKz', () => {
  it('returns 0.85 for Exposure C at h=15ft', () => {
    expect(getKz('C', 15)).toBeCloseTo(0.85, 2);
  });
  it('interpolates correctly for Exposure C at h=22ft', () => {
    const kz = getKz('C', 22);
    expect(kz).toBeGreaterThan(0.90);
    expect(kz).toBeLessThan(0.94);
  });
  it('caps at 60ft', () => {
    expect(getKz('C', 80)).toBe(getKz('C', 60));
  });
});

const baseInputs = {
  V: 175, exposureCategory: 'C' as const, h: 14, Kzt: 1.0, Kd: 0.85, Ke: 1.0,
  roofType: 'hip' as const, pitchDegrees: 18.43, buildingWidth: 26, buildingLength: 53.5,
  trussSpacing: 2, spans: [20], deadLoad: 45, designBasis: 'ASD' as const,
  enclosureType: 'enclosed' as const, hasOverhang: false, overhangWidth: 0, riskCategory: 'II' as const,
};

describe('calculate — ASCE 7-22 Kd placement (Issue 1)', () => {
  it('qh does NOT include Kd', () => {
    const result = calculate(baseInputs);
    // qh = 0.00256 * Kz * Kzt * Ke * V² (no Kd)
    const Kz = getKz('C', 14);
    const expectedQh = 0.00256 * Kz * 1.0 * 1.0 * 175 * 175;
    expect(result.qh).toBeCloseTo(expectedQh, 0);
    expect(result.Kd_applied).toBe(0.85);
  });

  it('zone pressures include Kd at pressure step', () => {
    const result = calculate(baseInputs);
    const z1 = result.zone_results.find(z => z.zone === '1')!;
    const expectedP = result.qh * 0.85 * (z1.GCpf - z1.GCpi);
    expect(z1.p_psf).toBeCloseTo(expectedP, 1);
  });
});

describe('calculate — all 6 zones (Issue 2)', () => {
  it('includes zones 3 and 3E in span results', () => {
    const result = calculate(baseInputs);
    const zones = new Set(result.span_results.map(r => r.zone));
    expect(zones.has('3')).toBe(true);
    expect(zones.has('3E')).toBe(true);
    expect(zones.size).toBe(6);
  });
  it('critical_zone and critical_span_ft populated', () => {
    const result = calculate(baseInputs);
    expect(result.critical_zone).toBeTruthy();
    expect(result.critical_span_ft).toBeGreaterThan(0);
  });
});

describe('calculate — positive pressure (Issue 6)', () => {
  it('zone_results include positive GCpf and pressure', () => {
    const result = calculate(baseInputs);
    const z1 = result.zone_results.find(z => z.zone === '1')!;
    expect(z1.GCpf_pos).toBeGreaterThan(0);
    expect(z1.p_psf_pos).toBeGreaterThan(0);
  });
});

describe('calculate — HVHZ Exposure C warning (Issue 4)', () => {
  it('warns when V >= 160 and Exposure B', () => {
    const result = calculate({ ...baseInputs, exposureCategory: 'B' as const });
    const hasWarning = result.warnings.some(w => w.message.includes('Exposure B is not permitted'));
    expect(hasWarning).toBe(true);
  });
});

describe('calculate — monoslope error (Issue 3)', () => {
  it('produces error for monoslope roof type', () => {
    const result = calculate({ ...baseInputs, roofType: 'monoslope' as const });
    const hasError = result.warnings.some(w => w.level === 'error' && w.message.includes('Monoslope'));
    expect(hasError).toBe(true);
  });
});

describe('calculate — demand_ratio (Issue 5)', () => {
  it('calculates demand_ratio when connectionCapacity_lb provided', () => {
    const result = calculate({ ...baseInputs, connectionCapacity_lb: 1000 });
    const hasRatio = result.span_results.some(r => r.demand_ratio !== null);
    expect(hasRatio).toBe(true);
  });
  it('demand_ratio is null when no capacity provided', () => {
    const result = calculate(baseInputs);
    expect(result.span_results[0].demand_ratio).toBeNull();
  });
});

describe('calculate — derivation (Issue 12)', () => {
  it('includes derivation strings', () => {
    const result = calculate(baseInputs);
    expect(result.derivation.eq_26_10_1).toContain('Eq. 26.10-1');
    expect(result.derivation.eq_28_3_1).toContain('Eq. 28.3-1');
    expect(result.derivation.zone_a_calc).toContain('§28.3.2');
  });
});

describe('getZoneA', () => {
  it('zone a is at least 3 ft', () => {
    expect(getZoneA(26, 14)).toBeGreaterThanOrEqual(3.0);
  });
});
