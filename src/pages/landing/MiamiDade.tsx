import CountyLandingTemplate from '@/components/landing/CountyLandingTemplate';

const MiamiDade = () => (
  <CountyLandingTemplate
    county="Miami-Dade"
    state="FL"
    V_mph={185}
    isHVHZ={true}
    exposureSuggestion="C"
    heroHeadline="Miami-Dade Wind Uplift & Fastener Calculations — HVHZ Compliance"
    metaDescription="ASCE 7-22 wind uplift and RAS 117/127 fastener calculations for Miami-Dade County HVHZ. V = 185 mph, Exposure C. Permit-ready PDF reports."
    localFacts={[
      'Miami-Dade County requires NOA (Notice of Acceptance) — FL Product Approvals alone are not sufficient for the HVHZ.',
      'Permits are submitted to the BCCO (Building Code Compliance Office). All calculations must reference the FBC 8th Edition.',
      'High Velocity Hurricane Zone special requirements apply: minimum Exposure C, 185 mph design wind speed for Risk Category II.',
      'HVHZ Calc Pro auto-applies Miami-Dade wind speed and exposure settings when you select the county.',
    ]}
    faqs={[
      { q: 'What wind speed does Miami-Dade use?', a: 'Miami-Dade County uses V = 185 mph for Risk Category II per ASCE 7-22 Fig. 26.5-1B. This is the highest design wind speed in the continental US.' },
      { q: 'Do I need a Miami-Dade NOA?', a: 'Yes. Products used in the HVHZ must have a Miami-Dade NOA. FL Product Approvals are not accepted. HVHZ Calc Pro supports NOA-referenced calculations.' },
      { q: 'What is the HVHZ?', a: 'The High Velocity Hurricane Zone (HVHZ) covers Miami-Dade and Broward counties. It requires enhanced construction standards per FBC Chapter 44 and ASCE 7-22.' },
    ]}
  />
);

export default MiamiDade;
