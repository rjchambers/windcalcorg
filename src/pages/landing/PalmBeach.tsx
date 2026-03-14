import CountyLandingTemplate from '@/components/landing/CountyLandingTemplate';

const PalmBeach = () => (
  <CountyLandingTemplate
    county="Palm Beach"
    state="FL"
    V_mph={165}
    isHVHZ={false}
    exposureSuggestion="C"
    heroHeadline="Palm Beach County Wind Uplift Calculations"
    metaDescription="ASCE 7-22 wind uplift calculations for Palm Beach County. V = 165 mph, Exposure C. Verify D for coastal locations."
    localFacts={[
      'Palm Beach County is NOT in the HVHZ but has high wind speeds (165 mph for Risk Cat. II).',
      'Standard FL Product Approvals are accepted — no Miami-Dade NOA required.',
      'FBC Chapter 16 applies. Coastal strip may require Exposure D — verify with site survey.',
      'HVHZ Calc Pro provides instant calculations with Palm Beach wind speed presets.',
    ]}
    faqs={[
      { q: 'What wind speed for Palm Beach?', a: 'Palm Beach County uses V = 165 mph for Risk Category II per ASCE 7-22. Coastal areas may be higher.' },
      { q: 'Is Palm Beach HVHZ?', a: 'No. Palm Beach County is not in the HVHZ. Standard FBC requirements apply with FL Product Approvals.' },
    ]}
  />
);

export default PalmBeach;
