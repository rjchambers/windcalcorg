import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { StrapInputs, StrapOutputs } from '@/lib/strap-engine';
import type { EngineerProfile } from '@/lib/engineer-profile';
import WatermarkOverlay from './WatermarkOverlay';

const FONT_MONO = 'Courier';

// Monochrome palette — mirrors the other HVHZ Calc Pro reports.
const c = {
  navy: '#000000',
  slate: '#000000',
  blue: '#000000',
  white: '#ffffff',
  gray: '#666666',
  grayDark: '#333333',
  red: '#000000',
  green: '#000000',
  amber: '#000000',
  orange: '#000000',
  border: '#000000',
  bgLight: '#f2f2f2',
};

const s = StyleSheet.create({
  page: {
    paddingTop: 54, paddingBottom: 72, paddingHorizontal: 54,
    fontFamily: 'Helvetica', fontSize: 9, color: c.navy, backgroundColor: c.white,
  },
  coverPage: { padding: 0, backgroundColor: c.white },
  coverContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 60 },
  coverTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: c.navy, marginBottom: 4 },
  coverSub: { fontSize: 11, color: c.orange, marginBottom: 24 },
  coverLine: { width: 80, height: 3, backgroundColor: c.orange, marginBottom: 30 },
  coverMeta: { alignItems: 'center' },
  coverMetaText: { fontSize: 10, color: c.grayDark, marginBottom: 4 },
  coverDate: { fontSize: 11, color: c.slate, marginTop: 8 },
  sealBox: {
    border: `1.5pt dashed ${c.gray}`, width: 180, height: 180,
    alignItems: 'center', justifyContent: 'center', marginTop: 30,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderBottom: `1pt solid ${c.border}`, paddingBottom: 6, marginBottom: 14,
  },
  headerTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: c.orange },
  headerRight: { fontSize: 7, color: c.grayDark },
  sectionHeader: {
    fontSize: 9, fontFamily: 'Helvetica-Bold', color: c.navy,
    backgroundColor: c.bgLight, padding: '4 6', marginBottom: 6, marginTop: 14,
    borderLeft: `3pt solid ${c.orange}`, paddingLeft: 8,
  },
  sectionSub: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: c.navy, marginBottom: 4, marginTop: 10 },
  calcLine: { fontFamily: FONT_MONO, fontSize: 8.5, color: c.slate, lineHeight: 1.6, marginLeft: 16 },
  resultLine: { fontFamily: 'Courier-Bold', fontSize: 9, color: c.navy, marginLeft: 16 },
  paramRow: { flexDirection: 'row', marginBottom: 2 },
  paramLabel: { fontSize: 8, color: c.grayDark, width: '45%' },
  paramValue: { fontSize: 8, fontFamily: FONT_MONO, color: c.navy, width: '35%' },
  paramRef: { fontSize: 7, color: c.grayDark, width: '20%', textAlign: 'right' },
  tableHeader: {
    flexDirection: 'row', backgroundColor: '#e2e8f0',
    borderBottom: `1pt solid ${c.border}`, paddingVertical: 3,
  },
  tableRow: { flexDirection: 'row', borderBottom: `0.5pt solid #e2e8f0`, paddingVertical: 2.5 },
  tableRowAlt: { flexDirection: 'row', borderBottom: `0.5pt solid #e2e8f0`, paddingVertical: 2.5, backgroundColor: '#f8fafc' },
  cell: { paddingHorizontal: 4, fontSize: 8, fontFamily: FONT_MONO },
  cellHeader: { paddingHorizontal: 4, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: c.grayDark },
  warningBox: {
    flexDirection: 'row', gap: 6, padding: 5, marginBottom: 3, borderRadius: 2,
    border: `0.5pt solid #e2e8f0`, backgroundColor: '#fffbeb',
  },
  warningText: { fontSize: 7.5, color: c.grayDark, flex: 1 },
  sigBlock: { marginTop: 40, paddingTop: 16, borderTop: `1pt solid ${c.border}` },
  sigRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  sigField: { width: '45%' },
  sigLine: { borderBottom: `1pt solid ${c.navy}`, marginBottom: 4, height: 20 },
  sigLabel: { fontSize: 7.5, color: c.grayDark },
  footer: {
    position: 'absolute', bottom: 30, left: 54, right: 54,
    flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: c.gray,
    borderTop: `0.5pt solid #e2e8f0`, paddingTop: 4,
  },
  disclaimer: { fontSize: 7, color: c.grayDark, marginTop: 16, lineHeight: 1.6 },
});

const ParamRow = ({ label, value, codeRef }: { label: string; value: string; codeRef?: string }) => (
  <View style={s.paramRow}>
    <Text style={s.paramLabel}>{label}</Text>
    <Text style={s.paramValue}>{value}</Text>
    {codeRef && <Text style={s.paramRef}>[{codeRef}]</Text>}
  </View>
);

const PageFooter = ({ firmName, projectName }: { firmName?: string; projectName?: string }) => (
  <View style={s.footer} fixed>
    <Text>{firmName || 'HVHZ Calc Pro'} · StrapCalc — {projectName || ''} · FBC §R802.11</Text>
  </View>
);

const PageHeader = ({ projectName, rightText, now, firmName, jobAddress }: {
  projectName: string; rightText: string; now: string; firmName?: string; jobAddress?: string;
}) => (
  <View style={s.header}>
    <View>
      <Text style={s.headerTitle}>{firmName || 'HVHZ Calc Pro'} · StrapCalc — {projectName}</Text>
      {jobAddress ? <Text style={{ fontSize: 7, color: c.grayDark, marginTop: 1 }}>{jobAddress}</Text> : null}
    </View>
    <Text style={s.headerRight}>{rightText} · {now}</Text>
  </View>
);

const WALL_LABEL: Record<string, string> = {
  wood_plate: 'Wood Top Plate',
  cmu: 'CMU Block',
  concrete: 'Concrete',
  steel: 'Steel',
};

const COUNTY_LABEL: Record<string, string> = {
  miami_dade: 'Miami-Dade',
  broward: 'Broward',
  other: 'Other',
};

interface Props {
  inputs: StrapInputs;
  outputs: StrapOutputs;
  projectName?: string;
  preparedBy?: string;
  jobAddress?: string;
  watermark?: boolean;
  engineer?: EngineerProfile | null;
}

const StrapCalcPdfReport = ({
  inputs, outputs,
  projectName = 'Untitled Project',
  preparedBy = '',
  jobAddress = '',
  watermark = false,
  engineer,
}: Props) => {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const firmName = engineer?.business_name || engineer?.company || '';
  const firmLine = [firmName, engineer?.business_address].filter(Boolean).join(' · ');
  const contactLine = [engineer?.business_phone, engineer?.business_email].filter(Boolean).join(' · ');
  const authorName = preparedBy || engineer?.display_name || '';
  const licenseLine = engineer?.pe_license ? `${engineer.license_state || 'FL'} ${engineer.license_type || 'PE'} #${engineer.pe_license}` : '';
  const statusLabel = outputs.overallStatus === 'ok' ? '✓ ALL CONNECTIONS PASS'
    : outputs.overallStatus === 'warning' ? '⚠ PASSES WITH WARNINGS' : '✗ CONNECTION FAILS';
  const allResults = [...outputs.zoneResults, ...(outputs.hipGirderResult ? [outputs.hipGirderResult] : [])];

  return (
    <Document title={firmName ? `${firmName} — ${projectName}` : `StrapCalc HVHZ — ${projectName}`} author={authorName || 'HVHZ Calc Pro'}>

      {/* ══════════════ COVER PAGE ══════════════ */}
      <Page size="LETTER" style={s.coverPage}>
        <View style={s.coverContent}>
          <Text style={{ fontSize: 10, color: c.gray, marginBottom: 8 }}>{firmName || 'HVHZ Calc Pro'}</Text>
          <Text style={s.coverTitle}>ROOF-TO-WALL CONNECTION CALCULATIONS</Text>
          <Text style={s.coverSub}>FBC 8th Edition (2023) · ASCE 7-22 · FBC §R802.11</Text>
          <View style={s.coverLine} />
          <View style={s.coverMeta}>
            <Text style={{ fontSize: 14, color: c.navy, fontFamily: 'Helvetica-Bold', marginBottom: 12 }}>{projectName}</Text>
            {jobAddress ? <Text style={s.coverMetaText}>Address: {jobAddress}</Text> : null}
            <Text style={s.coverMetaText}>Wall Type: {WALL_LABEL[inputs.wallType] ?? inputs.wallType} · {inputs.strapsPerTruss} strap(s)/truss</Text>
            <Text style={s.coverMetaText}>County: {COUNTY_LABEL[inputs.county] ?? inputs.county} {inputs.isHVHZ ? '(HVHZ)' : ''}</Text>
            {authorName ? <Text style={s.coverMetaText}>Prepared by: {authorName}</Text> : null}
            {licenseLine ? <Text style={s.coverMetaText}>{licenseLine}</Text> : null}
            {firmLine && <Text style={s.coverMetaText}>{firmLine}</Text>}
            {contactLine && <Text style={s.coverMetaText}>{contactLine}</Text>}
            <Text style={s.coverDate}>{now}</Text>
          </View>
          <View style={s.sealBox}>
            <Text style={{ fontSize: 8, color: c.gray }}>AFFIX ENGINEER'S SEAL HERE</Text>
            <Text style={{ fontSize: 7, color: c.gray, marginTop: 4 }}>2.5" x 2.5"</Text>
          </View>
        </View>
        <View style={{ ...s.footer, bottom: 20 }}>
          <Text style={{ color: c.gray, fontSize: 6.5 }}>{firmName || 'HVHZ Calc Pro'} — For review by licensed PE</Text>
        </View>
        <Text style={{ position: 'absolute', bottom: 50, left: 54, right: 54, fontSize: 6.5, color: c.gray, lineHeight: 1.5 }}>
          DISCLAIMER: {firmName ? `This report was prepared by ${firmName}` : 'StrapCalc HVHZ provides calculations'} as a design aid based on the Florida Building Code 8th Edition (2023), ASCE 7-22, and FBC §R802.11 (roof-to-wall connections). Connector selections are drawn from manufacturer product-approval data and must be verified against the current Florida Product Approval / Miami-Dade NOA for the as-built condition. All results must be reviewed, verified, and approved by a licensed Professional Engineer of Record.
        </Text>
        {watermark && <WatermarkOverlay />}
      </Page>

      {/* ══════════════ CRITERIA & DEMAND ══════════════ */}
      <Page size="LETTER" style={s.page}>
        <PageHeader projectName={projectName} rightText="Criteria & Uplift Demand" now={now} firmName={firmName} jobAddress={jobAddress} />

        <Text style={s.sectionHeader}>SITE INFORMATION</Text>
        <ParamRow label="Project Address:" value={jobAddress || '—'} />
        <ParamRow label="County:" value={`${COUNTY_LABEL[inputs.county] ?? inputs.county} ${inputs.isHVHZ ? '(HVHZ)' : ''}`} />
        {inputs.isHVHZ && <ParamRow label="HVHZ Requirement:" value="Exposure C min per FBC §1620" codeRef="FBC §1620" />}

        <Text style={s.sectionHeader}>CONNECTION PARAMETERS</Text>
        <ParamRow label="Wall Type:" value={WALL_LABEL[inputs.wallType] ?? inputs.wallType} codeRef="FBC §R802.11" />
        <ParamRow label="Straps Per Truss:" value={String(inputs.strapsPerTruss)} />
        <ParamRow label="Truss Spacing:" value={`${inputs.trussSpacing_ft} ft`} />
        <ParamRow label="Dead Load:" value={`${inputs.deadLoad_psf} psf`} />
        <ParamRow label="Design Basis:" value={inputs.designBasis} codeRef="ASCE 7-22 §2.4" />
        <ParamRow label="Hip Girder Present:" value={inputs.hipGirderPresent ? 'Yes' : 'No'} />

        <Text style={s.sectionHeader}>UPLIFT DEMAND (NET, PER TRUSS)</Text>
        <Text style={s.calcLine}>T_req per strap = ceil( T_net / straps per truss )</Text>
        <Text style={s.calcLine}>Governing = max( T_req , 500 lb code minimum )            [FBC §R802.11]</Text>

        <View style={{ ...s.tableHeader, marginTop: 8 }}>
          <Text style={{ ...s.cellHeader, width: '34%' }}>Zone</Text>
          <Text style={{ ...s.cellHeader, width: '22%' }}>Net Uplift</Text>
          <Text style={{ ...s.cellHeader, width: '22%' }}>T_req/strap</Text>
          <Text style={{ ...s.cellHeader, width: '22%' }}>Governing</Text>
        </View>
        {allResults.map((r, i) => (
          <View key={r.zone} style={i % 2 ? s.tableRowAlt : s.tableRow}>
            <Text style={{ ...s.cell, width: '34%', fontFamily: 'Helvetica-Bold' }}>{r.zone}</Text>
            <Text style={{ ...s.cell, width: '22%' }}>{r.T_total_lbs} lb</Text>
            <Text style={{ ...s.cell, width: '22%' }}>{r.T_required_lbs} lb</Text>
            <Text style={{ ...s.cell, width: '22%', fontFamily: 'Courier-Bold' }}>{r.governingValue_lbs} lb</Text>
          </View>
        ))}

        <PageFooter firmName={firmName} projectName={projectName} />
      </Page>

      {/* ══════════════ CONNECTOR SCHEDULE & CHECK ══════════════ */}
      <Page size="LETTER" style={s.page}>
        <PageHeader projectName={projectName} rightText="Connector Schedule" now={now} firmName={firmName} jobAddress={jobAddress} />

        <Text style={s.sectionHeader}>SELECTED CONNECTORS</Text>
        <View style={s.tableHeader}>
          <Text style={{ ...s.cellHeader, width: '24%' }}>Location</Text>
          <Text style={{ ...s.cellHeader, width: '20%' }}>Model</Text>
          <Text style={{ ...s.cellHeader, width: '14%' }}>Cap (lb)</Text>
          <Text style={{ ...s.cellHeader, width: '14%' }}>Gov (lb)</Text>
          <Text style={{ ...s.cellHeader, width: '12%' }}>Fast/end</Text>
          <Text style={{ ...s.cellHeader, width: '16%' }}>Status</Text>
        </View>
        {allResults.map((r, i) => (
          <View key={r.zone} style={i % 2 ? s.tableRowAlt : s.tableRow}>
            <Text style={{ ...s.cell, width: '24%', fontFamily: 'Helvetica-Bold' }}>{r.zone}</Text>
            <Text style={{ ...s.cell, width: '20%' }}>{r.selectedConnector?.model ?? 'SPECIFY'}</Text>
            <Text style={{ ...s.cell, width: '14%' }}>{r.selectedConnector?.upliftCapacity_lbs ?? '—'}</Text>
            <Text style={{ ...s.cell, width: '14%' }}>{r.governingValue_lbs}</Text>
            <Text style={{ ...s.cell, width: '12%' }}>{r.fastenersRequired || '—'}</Text>
            <Text style={{ ...s.cell, width: '16%', fontFamily: 'Helvetica-Bold' }}>{r.pass ? 'PASS' : 'FAIL'}</Text>
          </View>
        ))}

        <Text style={s.sectionHeader}>FL PRODUCT APPROVAL & NOTES</Text>
        {outputs.connectorSchedule.map((row, i) => (
          <View key={`${row.location}-${i}`} style={{ marginBottom: 5 }}>
            <Text style={s.sectionSub}>{row.location} — {row.connectorModel}</Text>
            <Text style={s.calcLine}>Qty: {row.quantity} · Cap: {row.upliftCapacity_lbs} lb · Fasteners/end: {row.fastenersPerEnd}</Text>
            <Text style={s.calcLine}>FL Approval: {row.flApproval}</Text>
            {row.notes ? <Text style={s.calcLine}>Notes: {row.notes}</Text> : null}
          </View>
        ))}

        {allResults.some(r => r.alternateConnectors.length > 0) && (
          <>
            <Text style={s.sectionHeader}>ALTERNATE CONNECTORS</Text>
            {allResults.filter(r => r.alternateConnectors.length > 0).map(r => (
              <View key={r.zone} style={{ marginBottom: 3 }}>
                <Text style={s.calcLine}>{r.zone}: {r.alternateConnectors.map(a => `${a.model} (${a.upliftCapacity_lbs} lb)`).join(', ')}</Text>
              </View>
            ))}
          </>
        )}

        <PageFooter firmName={firmName} projectName={projectName} />
      </Page>

      {/* ══════════════ SUMMARY & CERTIFICATION ══════════════ */}
      <Page size="LETTER" style={s.page}>
        <PageHeader projectName={projectName} rightText="Summary & Certification" now={now} firmName={firmName} jobAddress={jobAddress} />

        <Text style={s.sectionHeader}>OVERALL RESULT</Text>
        <View style={{ padding: 12, marginBottom: 8, backgroundColor: outputs.overallStatus === 'fail' ? '#fef2f2' : '#f0fdf4', border: `1pt solid ${outputs.overallStatus === 'fail' ? '#fecaca' : '#bbf7d0'}`, borderRadius: 3 }}>
          <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: c.navy, textAlign: 'center' }}>{statusLabel}</Text>
        </View>

        {outputs.warnings.length > 0 && (
          <>
            <Text style={s.sectionHeader}>WARNINGS & COMPLIANCE NOTES</Text>
            {outputs.warnings.map((w, i) => (
              <View key={i} style={s.warningBox}>
                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: c.navy }}>
                  {w.level === 'error' ? '⛔' : w.level === 'warning' ? '⚠' : 'ℹ'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.warningText}>{w.message}</Text>
                  {w.reference && <Text style={{ fontSize: 6.5, color: c.gray }}>[{w.reference}]</Text>}
                </View>
              </View>
            ))}
          </>
        )}

        <View style={s.sigBlock}>
          <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: c.navy, marginBottom: 8 }}>CERTIFICATION</Text>
          <Text style={s.disclaimer}>
            I hereby certify that these calculations were prepared by me or under my direct supervision and that they comply with the applicable provisions of the Florida Building Code 8th Edition (2023), ASCE 7-22, and FBC §R802.11. Connector capacities are subject to verification against the governing Florida Product Approval / Miami-Dade NOA.
          </Text>
          <View style={s.sigRow}>
            <View style={s.sigField}>
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>Engineer of Record / Signature</Text>
            </View>
            <View style={s.sigField}>
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>Date</Text>
            </View>
          </View>
          <View style={s.sigRow}>
            <View style={s.sigField}>
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>PE License Number / State</Text>
            </View>
            <View style={s.sigField}>
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>Firm Name</Text>
            </View>
          </View>
        </View>

        <PageFooter firmName={firmName} projectName={projectName} />
      </Page>
    </Document>
  );
};

export default StrapCalcPdfReport;
