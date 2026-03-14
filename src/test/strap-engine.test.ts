import { describe, it, expect } from 'vitest';
import { calculateStrap } from '../lib/strap-engine';

describe('calculateStrap', () => {
  it('selects a connector for standard wood plate HVHZ', () => {
    const result = calculateStrap({
      zone1_netUplift_lbs: 900, zone2E_netUplift_lbs: 1500, zone3E_netUplift_lbs: 2200,
      trussSpacing_ft: 2, deadLoad_psf: 45, designBasis: 'ASD',
      wallType: 'wood_plate', strapsPerTruss: 1, hipGirderPresent: false,
      isHVHZ: true, county: 'miami_dade',
    });
    expect(result.zoneResults[2].selectedConnector).not.toBeNull();
    expect(result.zoneResults[2].selectedConnector!.upliftCapacity_lbs).toBeGreaterThanOrEqual(2200);
  });
  it('enforces FBC 500-lb minimum even on low-uplift zones', () => {
    const result = calculateStrap({
      zone1_netUplift_lbs: 200, zone2E_netUplift_lbs: 300, zone3E_netUplift_lbs: 400,
      trussSpacing_ft: 2, deadLoad_psf: 45, designBasis: 'ASD',
      wallType: 'wood_plate', strapsPerTruss: 1, hipGirderPresent: false,
      isHVHZ: true, county: 'miami_dade',
    });
    result.zoneResults.forEach(r => {
      expect(r.governingValue_lbs).toBeGreaterThanOrEqual(500);
    });
  });
});
