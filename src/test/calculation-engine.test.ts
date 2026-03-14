import { describe, it, expect } from 'vitest';
import { calculate, getKz, getZoneA } from '../lib/calculation-engine';

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

describe('calculate — HVHZ hip roof baseline', () => {
  it('produces correct qh for V=175 Exp C h=14', () => {
    const result = calculate({
      V: 175, exposureCategory: 'C', h: 14, Kzt: 1.0, Kd: 0.85, Ke: 1.0,
      roofType: 'hip', pitchDegrees: 18.43, buildingWidth: 26, buildingLength: 53.5,
      trussSpacing: 2, spans: [20], deadLoad: 45, designBasis: 'ASD',
      enclosureType: 'enclosed', hasOverhang: false, overhangWidth: 0, riskCategory: 'II'
    });
    expect(result.qh).toBeCloseTo(56.7, 0);
  });
  it('zone a is at least 3 ft', () => {
    const result = calculate({
      V: 175, exposureCategory: 'C', h: 14, Kzt: 1.0, Kd: 0.85, Ke: 1.0,
      roofType: 'hip', pitchDegrees: 18.43, buildingWidth: 26, buildingLength: 53.5,
      trussSpacing: 2, spans: [20], deadLoad: 45, designBasis: 'ASD',
      enclosureType: 'enclosed', hasOverhang: false, overhangWidth: 0, riskCategory: 'II'
    });
    expect(result.zone_a_ft).toBeGreaterThanOrEqual(3.0);
  });
});
