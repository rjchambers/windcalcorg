// Florida county wind speed lookup — ASCE 7-22 Risk Category II
// Values from ASCE 7-22 Fig. 26.5-1B, representative county centroids

export interface CountyWindData {
  V_mph: number;
  exposureSuggestion: 'B' | 'C' | 'D';
  isHVHZ: boolean;
  riskCatII_default: boolean;
  note?: string;
}

export const FLORIDA_COUNTY_WIND: Record<string, CountyWindData> = {
  'Miami-Dade':    { V_mph: 185, exposureSuggestion: 'C', isHVHZ: true,  riskCatII_default: true, note: 'HVHZ — Miami-Dade NOA required' },
  'Broward':       { V_mph: 175, exposureSuggestion: 'C', isHVHZ: true,  riskCatII_default: true, note: 'HVHZ — FL Product Approval accepted' },
  'Monroe':        { V_mph: 185, exposureSuggestion: 'D', isHVHZ: true,  riskCatII_default: true, note: 'HVHZ — Exposure D for coastal sites' },
  'Palm Beach':    { V_mph: 165, exposureSuggestion: 'C', isHVHZ: false, riskCatII_default: true },
  'Martin':        { V_mph: 160, exposureSuggestion: 'C', isHVHZ: false, riskCatII_default: true },
  'St. Lucie':     { V_mph: 160, exposureSuggestion: 'C', isHVHZ: false, riskCatII_default: true },
  'Indian River':  { V_mph: 155, exposureSuggestion: 'C', isHVHZ: false, riskCatII_default: true },
  'Brevard':       { V_mph: 150, exposureSuggestion: 'C', isHVHZ: false, riskCatII_default: true },
  'Volusia':       { V_mph: 140, exposureSuggestion: 'C', isHVHZ: false, riskCatII_default: true },
  'Collier':       { V_mph: 170, exposureSuggestion: 'C', isHVHZ: false, riskCatII_default: true },
  'Lee':           { V_mph: 165, exposureSuggestion: 'C', isHVHZ: false, riskCatII_default: true },
  'Charlotte':     { V_mph: 160, exposureSuggestion: 'C', isHVHZ: false, riskCatII_default: true },
  'Sarasota':      { V_mph: 155, exposureSuggestion: 'C', isHVHZ: false, riskCatII_default: true },
  'Manatee':       { V_mph: 150, exposureSuggestion: 'C', isHVHZ: false, riskCatII_default: true },
  'Hillsborough':  { V_mph: 145, exposureSuggestion: 'C', isHVHZ: false, riskCatII_default: true },
  'Pinellas':      { V_mph: 150, exposureSuggestion: 'C', isHVHZ: false, riskCatII_default: true },
  'Orange':        { V_mph: 130, exposureSuggestion: 'B', isHVHZ: false, riskCatII_default: true },
  'Osceola':       { V_mph: 130, exposureSuggestion: 'B', isHVHZ: false, riskCatII_default: true },
  'Seminole':      { V_mph: 130, exposureSuggestion: 'B', isHVHZ: false, riskCatII_default: true },
  'Duval':         { V_mph: 130, exposureSuggestion: 'C', isHVHZ: false, riskCatII_default: true },
  'Escambia':      { V_mph: 150, exposureSuggestion: 'C', isHVHZ: false, riskCatII_default: true },
};

export const COUNTY_NAMES = Object.keys(FLORIDA_COUNTY_WIND).sort();

export function lookupByCounty(county: string): CountyWindData | null {
  return FLORIDA_COUNTY_WIND[county] ?? null;
}
