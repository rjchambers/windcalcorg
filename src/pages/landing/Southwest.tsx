import CountyLandingTemplate from '@/components/landing/CountyLandingTemplate';

const Southwest = () => (
  <CountyLandingTemplate
    county="Southwest Florida"
    state="FL"
    V_mph={165}
    isHVHZ={false}
    exposureSuggestion="C"
    heroHeadline="Southwest Florida Wind Calculations — Lee, Collier, Charlotte Counties"
    metaDescription="ASCE 7-22 wind uplift calculations for Lee, Collier, and Charlotte counties. Post-Hurricane Ian compliance. V = 160–170 mph."
    localFacts={[
      'Hurricane Ian (2022) devastated Southwest Florida and highlighted the importance of proper wind uplift calculations.',
      'Lee County: V = 165 mph. Collier County: V = 170 mph. Charlotte County: V = 160 mph. All Risk Cat. II.',
      'Standard FL Product Approvals accepted. County-specific AHJ requirements may apply.',
      'HVHZ Calc Pro supports all Southwest Florida counties with auto-applied wind speed settings.',
    ]}
    faqs={[
      { q: 'What wind speed for Lee County?', a: 'Lee County uses V = 165 mph for Risk Category II per ASCE 7-22.' },
      { q: 'Are Southwest Florida counties in the HVHZ?', a: 'No. Lee, Collier, and Charlotte counties are not in the HVHZ. Standard FBC requirements apply.' },
    ]}
  />
);

export default Southwest;
