import CountyLandingTemplate from '@/components/landing/CountyLandingTemplate';

const Broward = () => (
  <CountyLandingTemplate
    county="Broward"
    state="FL"
    V_mph={175}
    isHVHZ={true}
    exposureSuggestion="C"
    heroHeadline="Broward County Wind Uplift & Fastener Calculations — HVHZ"
    metaDescription="ASCE 7-22 wind uplift and fastener calculations for Broward County HVHZ. V = 175 mph, Exposure C. RAS 127 Simplified Method available."
    localFacts={[
      'Broward County is in the HVHZ — same zone as Miami-Dade with slightly lower wind speed (175 mph vs 185 mph).',
      'FL Product Approvals are accepted in Broward (not just NOA). This gives engineers more product options.',
      'RAS 127 Simplified Method (Method 2) is available for Broward Exposure C tile roof calculations.',
      'HVHZ Calc Pro auto-applies Broward settings and supports both NOA and FL Product Approval references.',
    ]}
    faqs={[
      { q: 'Is Broward in the HVHZ?', a: 'Yes. Broward County is part of the HVHZ along with Miami-Dade County per FBC §1620.' },
      { q: 'What wind speed for Broward permits?', a: 'Broward County uses V = 175 mph for Risk Category II per ASCE 7-22.' },
      { q: 'Can I use FL Product Approval instead of NOA?', a: 'Yes. Unlike Miami-Dade, Broward accepts FL Product Approvals in addition to Miami-Dade NOAs.' },
    ]}
  />
);

export default Broward;
