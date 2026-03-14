import { describe, it, expect } from 'vitest';
import { calculateFastener, getKh, solveRowsAndFS } from '../lib/fastener-engine';

describe('getKh', () => {
  it('returns 0.85 for Exposure C at h=15ft', () => {
    expect(getKh('C', 15)).toBeCloseTo(0.85, 2);
  });
});

describe('solveRowsAndFS', () => {
  it('returns FS >= 6 inches for typical inputs', () => {
    const result = solveRowsAndFS(29.48, -45, 35.375, 4);
    expect(result.FS).toBeGreaterThanOrEqual(6.0);
  });
});

describe('calculateFastener — Kd in qh', () => {
  it('qh_ASD includes Kd=0.85 factor', () => {
    const result = calculateFastener({
      V: 175, exposureCategory: 'C', h: 15, Kzt: 1.0, Kd: 0.85, Ke: 1.0,
      enclosure: 'enclosed', riskCategory: 'II', buildingLength: 60, buildingWidth: 40,
      parapetHeight: 0, systemType: 'modified_bitumen', deckType: 'plywood',
      constructionType: 'new', existingLayers: 0, sheetWidth_in: 39.375, lapWidth_in: 4,
      Fy_lbf: 29.48, fySource: 'noa', initialRows: 4,
      noa: { approvalType: 'miami_dade_noa', approvalNumber: 'TEST', mdp_psf: -60, asterisked: false },
      boardLength_ft: 4, boardWidth_ft: 8, insulation_Fy_lbf: 29.48,
      county: 'miami_dade', isHVHZ: true,
    });
    // qh_ASD = 0.00256 * 0.85 * 1.0 * 0.85 * 1.0 * 175^2 * 0.6 ≈ 28.6 psf
    expect(result.qh_ASD).toBeCloseTo(28.6, 0);
  });
});
