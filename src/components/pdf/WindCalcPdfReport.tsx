import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Rect,
  Line as SvgLine,
  Polygon,
} from '@react-pdf/renderer';
import type { CalculationInputs, CalculationOutputs } from '@/lib/calculation-engine';
import type { EngineerProfile } from '@/lib/engineer-profile';
import WatermarkOverlay from './WatermarkOverlay';

const FONT_SANS = 'Helvetica';
const FONT_MONO = 'Courier';

const c = {
  navy: '#0f172a',
  slate: '#1e293b',
  blue: '#2563eb',
  blueLight: '#93c5fd',
  orange: '#f97316',
  white: '#ffffff',
  gray: '#94a3b8',
  grayLight: '#cbd5e1',
  grayDark: '#475569',
  red: '#dc2626',
  green: '#16a34a',
  amber: '#d97706',
  border: '#cbd5e1',
  bgLight: '#f1f5f9',
};

const s = StyleSheet.create({
  page: {
    paddingTop: 54, paddingBottom: 72, paddingHorizontal: 54,
    fontFamily: FONT_SANS, fontSize: 9, color: c.navy, backgroundColor: c.white,
  },
  coverPage: { padding: 0, backgroundColor: c.white },
  coverContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 60 },
  coverTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: c.navy, marginBottom: 4 },
  coverSub: { fontSize: 11, color: c.blue, marginBottom: 24 },
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
  headerAddress: { fontSize: 7, color: c.grayDark, marginTop: 1 },
  sectionHeader: {
    fontSize: 9, fontFamily: 'Helvetica-Bold', color: c.navy,
    backgroundColor: c.bgLight, padding: '4 6', marginBottom: 6, marginTop: 14,
    borderLeft: `3pt solid ${c.orange}`, paddingLeft: 8,
  },
  sectionSub: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: c.navy, marginBottom: 4, marginTop: 10 },
  calcLine: { fontFamily: FONT_MONO, fontSize: 8.5, color: c.slate, lineHeight: 1.6, marginLeft: 16 },
  resultLine: { fontFamily: 'Courier-Bold', fontSize: 9, color: c.navy, marginLeft: 16 },
  codeRef: { fontSize: 7.5, color: c.grayDark },
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

// ──── Helpers ────

const ParamRow = ({ label, value, codeRef }: { label: string; value: string; codeRef?: string }) => (
  <View style={s.paramRow}>
    <Text style={s.paramLabel}>{label}</Text>
    <Text style={s.paramValue}>{value}</Text>
    {codeRef && <Text style={s.paramRef}>[{codeRef}]</Text>}
  </View>
);

const PageFooter = ({ firmName, projectName }: { firmName?: string; projectName?: string }) => (
  <View style={s.footer} fixed>
    <Text>{firmName || 'HVHZ Calc Pro'} · Wind Uplift — {projectName || ''} · ASCE 7-22 Ch. 28</Text>
    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
  </View>
);

const PageHeader = ({ projectName, rightText, now, firmName, jobAddress }: {
  projectName: string; rightText: string; now: string; firmName?: string; jobAddress?: string;
}) => (
  <View style={s.header}>
    <View>
      <Text style={s.headerTitle}>{firmName || 'HVHZ Calc Pro'} · Wind Uplift — {projectName}</Text>
      {jobAddress ? <Text style={s.headerAddress}>{jobAddress}</Text> : null}
    </View>
    <Text style={s.headerRight}>{rightText} · {now}</Text>
  </View>
);

// ──── Main Component ────

interface Props {
  inputs: CalculationInputs;
  outputs: CalculationOutputs;
  projectName?: string;
  preparedBy?: string;
  jobAddress?: string;
  watermark?: boolean;
  engineer?: EngineerProfile | null;
}

const WindCalcPdfReport = ({
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
  const docTitle = firmName ? `${firmName} — ${projectName}` : projectName;

  return (
    <Document title={docTitle} author={authorName || 'HVHZ Calc Pro'}>

      {/* ══════════════ PAGE 1: COVER ══════════════ */}
      <Page size="LETTER" style={s.coverPage}>
        <View style={s.coverContent}>
          <Text style={{ fontSize: 10, color: c.gray, marginBottom: 8 }}>{firmName || 'HVHZ Calc Pro'}</Text>
          <Text style={s.coverTitle}>WIND UPLIFT ROOF TO WALL STRAP CALCULATIONS PER TRUSS</Text>
          <Text style={s.coverSub}>FBC 8th Edition (2023) · ASCE 7-22 Ch. 28 · MWFRS Envelope Procedure</Text>
          <View style={s.coverLine} />
          <View style={s.coverMeta}>
            <Text style={{ fontSize: 14, color: c.white, fontFamily: 'Helvetica-Bold', marginBottom: 12 }}>{projectName}</Text>
            {jobAddress ? <Text style={s.coverMetaText}>Address: {jobAddress}</Text> : null}
            <Text style={s.coverMetaText}>Design Basis: {inputs.designBasis}</Text>
            <Text style={s.coverMetaText}>Risk Category: {inputs.riskCategory}</Text>
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
          DISCLAIMER: {firmName ? `This report was prepared by ${firmName}` : 'HVHZ Calc Pro provides calculations'} as a design aid based on the Florida Building Code 8th Edition (2023) and ASCE 7-22 Chapter 28 Envelope Procedure. All results must be reviewed, verified, and approved by a licensed Professional Engineer. The Engineer of Record is solely responsible for verifying the applicability of all referenced standards to specific project conditions.
        </Text>
        {watermark && <WatermarkOverlay />}
      </Page>

      {/* ══════════════ PAGE 2: PROJECT CRITERIA ══════════════ */}
      <Page size="LETTER" style={s.page}>
        <PageHeader projectName={projectName} rightText="Project Criteria" now={now} firmName={firmName} jobAddress={jobAddress} />

        <Text style={s.sectionHeader}>SITE INFORMATION</Text>
        <ParamRow label="Project Address:" value={jobAddress || '—'} />
        <ParamRow label="Risk Category:" value={`${inputs.riskCategory}`} ref="Table 1.5-1" />

        <Text style={s.sectionHeader}>WIND PARAMETERS</Text>
        <ParamRow label="Basic Wind Speed:" value={`V = ${inputs.V} mph`} ref="Fig. 26.5-1A" />
        <ParamRow label="Exposure Category:" value={inputs.exposureCategory} ref="§26.7.3" />
        <ParamRow label="Enclosure Class:" value={inputs.enclosureType} ref="§26.12" />
        <ParamRow label="HVHZ Requirement:" value="Exposure C min per FBC §1609.1.1" />

        <Text style={s.sectionHeader}>BUILDING GEOMETRY</Text>
        <ParamRow label="Length (L):" value={`${inputs.buildingLength} ft`} />
        <ParamRow label="Width (W):" value={`${inputs.buildingWidth} ft`} />
        <ParamRow label="Mean Roof Height (h):" value={`${inputs.h} ft`} ref="§26.2" />
        <ParamRow label="Roof Type:" value={inputs.roofType.charAt(0).toUpperCase() + inputs.roofType.slice(1)} />
        <ParamRow label="Roof Slope:" value={`${inputs.pitchDegrees}°`} />
        <ParamRow label="h/L min ratio:" value={`${(inputs.h / Math.min(inputs.buildingLength, inputs.buildingWidth)).toFixed(3)}`} ref="§28.1.2" />

        <Text style={s.sectionHeader}>MWFRS METHOD</Text>
        <ParamRow label="Procedure:" value="Envelope, Low-Rise (§28.3)" ref="§28.3" />
        <ParamRow label="Applicability:" value={`h = ${inputs.h} ft ${inputs.h <= 60 ? '≤ 60 ft ✓' : '> 60 ft ⚠'}`} />

        <Text style={s.sectionHeader}>WIND COEFFICIENTS</Text>
        <ParamRow label="Kz:" value={`${outputs.Kz}`} ref="Table 26.10-1" />
        <ParamRow label="Kzt:" value={`${inputs.Kzt}`} ref="§26.8" />
        <ParamRow label="Kd:" value={`${inputs.Kd}`} ref="Table 26.6-1" />
        <ParamRow label="Ke:" value={`${inputs.Ke}`} ref="Table 26.9-1" />

        <Text style={s.sectionHeader}>TRUSS PARAMETERS</Text>
        <ParamRow label="Truss Spacing:" value={`${inputs.trussSpacing} ft o.c.`} />
        <ParamRow label="Dead Load:" value={`${inputs.deadLoad} psf`} />
        {inputs.hasOverhang && <ParamRow label="Overhang:" value={`${inputs.overhangWidth} ft`} />}

        <PageFooter firmName={firmName} projectName={projectName} />
      </Page>

      {/* ══════════════ PAGE 3: VELOCITY PRESSURE DERIVATION ══════════════ */}
      <Page size="LETTER" style={s.page}>
        <PageHeader projectName={projectName} rightText="Velocity Pressure" now={now} firmName={firmName} jobAddress={jobAddress} />

        <Text style={s.sectionHeader}>VELOCITY PRESSURE EXPOSURE COEFFICIENT — Kz</Text>
        <Text style={s.calcLine}>Method: Linear interpolation, Table 26.10-1                [ASCE 7-22, Table 26.10-1]</Text>
        <Text style={s.calcLine}>Height: z = h = {inputs.h} ft (evaluated at mean roof height)</Text>
        <Text style={s.calcLine}>Exposure: Category {inputs.exposureCategory}</Text>
        <Text style={s.resultLine}>Kz = {outputs.Kz}</Text>

        <Text style={s.sectionHeader}>VELOCITY PRESSURE — qh</Text>
        <Text style={{ fontSize: 8, color: c.grayDark, marginBottom: 4, marginLeft: 16 }}>
          Per ASCE 7-22 Eq. 26.10-1{inputs.designBasis === 'ASD' ? '' : ' (LRFD)'}
        </Text>
        <Text style={s.calcLine}>qh = 0.00256 × Kz × Kzt × Kd × Ke × V²</Text>
        <Text style={s.calcLine}>   = 0.00256 × {outputs.Kz} × {inputs.Kzt} × {inputs.Kd} × {inputs.Ke} × {inputs.V}²</Text>
        <Text style={s.resultLine}>qh = {outputs.qh.toFixed(2)} psf</Text>

        <Text style={s.sectionHeader}>MWFRS ZONE DIMENSION (a)</Text>
        <Text style={s.calcLine}>a = max(min(0.1·L_min, 0.4·h), max(0.04·L_min, 3 ft))     [ASCE 7-22, §28.3.1]</Text>
        <Text style={s.resultLine}>a = {outputs.zone_a_ft} ft    2a = {outputs.zone_2a_width_ft} ft</Text>

        <PageFooter firmName={firmName} projectName={projectName} />
      </Page>

      {/* ══════════════ PAGE 4: ZONE PRESSURES ══════════════ */}
      <Page size="LETTER" style={s.page}>
        <PageHeader projectName={projectName} rightText="Zone Pressures" now={now} firmName={firmName} jobAddress={jobAddress} />

        <Text style={s.sectionHeader}>MWFRS DESIGN PRESSURES — Ch. 28 Envelope</Text>
        <Text style={{ fontSize: 8, color: c.grayDark, marginBottom: 4, marginLeft: 8 }}>
          {inputs.roofType.charAt(0).toUpperCase() + inputs.roofType.slice(1)} roof · θ = {inputs.pitchDegrees}° · {inputs.designBasis}
        </Text>
        <Text style={s.calcLine}>p = qh × (GCpf − GCpi)                                     [ASCE 7-22, §28.3]</Text>

        {outputs.zone_results.map(z => (
          <View key={z.zone} style={{ marginBottom: 4 }}>
            <Text style={s.sectionSub}>Zone {z.zone}</Text>
            <Text style={s.calcLine}>GCpf = {z.GCpf.toFixed(3)}   GCpi = {z.GCpi.toFixed(2)}    [Fig. 28.3-1, Zone {z.zone}]</Text>
            <Text style={s.calcLine}>p = {outputs.qh.toFixed(2)} × ({z.GCpf.toFixed(3)} − {z.GCpi.toFixed(2)}) = {outputs.qh.toFixed(2)} × {(z.GCpf - z.GCpi).toFixed(3)}</Text>
            <Text style={{ ...s.resultLine, color: z.p_psf < 0 ? c.red : c.green }}>p = {z.p_psf.toFixed(2)} psf</Text>
          </View>
        ))}

        <Text style={s.sectionHeader}>ZONE PRESSURE SUMMARY</Text>
        <View style={s.tableHeader}>
          <Text style={{ ...s.cellHeader, width: '15%' }}>Zone</Text>
          <Text style={{ ...s.cellHeader, width: '20%' }}>GCpf</Text>
          <Text style={{ ...s.cellHeader, width: '20%' }}>GCpi</Text>
          <Text style={{ ...s.cellHeader, width: '25%' }}>p (psf)</Text>
          <Text style={{ ...s.cellHeader, width: '20%' }}>Direction</Text>
        </View>
        {outputs.zone_results.map((z, i) => (
          <View key={z.zone} style={i % 2 ? s.tableRowAlt : s.tableRow}>
            <Text style={{ ...s.cell, width: '15%', fontFamily: 'Helvetica-Bold', color: z.zone.includes('E') ? c.amber : c.blue }}>{z.zone}</Text>
            <Text style={{ ...s.cell, width: '20%' }}>{z.GCpf.toFixed(3)}</Text>
            <Text style={{ ...s.cell, width: '20%' }}>{z.GCpi.toFixed(2)}</Text>
            <Text style={{ ...s.cell, width: '25%', color: z.p_psf < 0 ? c.red : c.green }}>{z.p_psf.toFixed(2)}</Text>
            <Text style={{ ...s.cell, width: '20%' }}>{z.p_psf < 0 ? 'Uplift' : 'Downward'}</Text>
          </View>
        ))}

        {/* Overhang */}
        {outputs.overhang && (
          <>
            <Text style={s.sectionHeader}>OVERHANG BREAKDOWN — §28.3.3</Text>
            <Text style={s.calcLine}>p_top = qh × (GCpf_2E − GCpi) = {outputs.overhang.p_top_psf} psf</Text>
            <Text style={s.calcLine}>p_soffit = −0.8 × qh = {outputs.overhang.p_soffit_psf} psf</Text>
            <Text style={s.resultLine}>p_net = {outputs.overhang.p_net_psf} psf</Text>
            <Text style={{ ...s.calcLine, marginTop: 4 }}>A_oh = {outputs.overhang.area_ft2} ft²   F_wind = {outputs.overhang.F_oh_wind_lb} lb   F_DL = {outputs.overhang.F_oh_DL_lb} lb</Text>
            <Text style={s.resultLine}>Net OH = {outputs.overhang.net_OH_lb} lb</Text>
          </>
        )}

        <PageFooter firmName={firmName} projectName={projectName} />
      </Page>

      {/* ══════════════ PAGE 5: BUILDING DIAGRAM ══════════════ */}
      <Page size="LETTER" style={s.page}>
        <PageHeader projectName={projectName} rightText="Building Diagram" now={now} firmName={firmName} jobAddress={jobAddress} />

        <Text style={s.sectionHeader}>FIGURE 1 — BUILDING CROSS-SECTION & MWFRS ZONES</Text>
        <Text style={{ fontSize: 7.5, color: c.grayDark, marginBottom: 8, marginLeft: 8 }}>
          Per ASCE 7-22 Fig. 28.3-1 — {inputs.roofType.charAt(0).toUpperCase() + inputs.roofType.slice(1)} Roof, θ = {inputs.pitchDegrees}°
        </Text>

        <BuildingDiagramSvg inputs={inputs} outputs={outputs} />

        <PageFooter firmName={firmName} projectName={projectName} />
      </Page>

      {/* ══════════════ PAGE 6: SPAN RESULTS ══════════════ */}
      <Page size="LETTER" style={s.page}>
        <PageHeader projectName={projectName} rightText="Span Results" now={now} firmName={firmName} jobAddress={jobAddress} />

        <Text style={s.sectionHeader}>UPLIFT FORCE PER TRUSS — {inputs.designBasis}</Text>
        <Text style={{ fontSize: 8, color: c.grayDark, marginBottom: 6, marginLeft: 8 }}>
          Truss spacing: {inputs.trussSpacing} ft o.c. · Dead Load: {inputs.deadLoad} psf
        </Text>

        <View style={s.tableHeader}>
          <Text style={{ ...s.cellHeader, width: '10%' }}>Span</Text>
          <Text style={{ ...s.cellHeader, width: '10%' }}>Zone</Text>
          <Text style={{ ...s.cellHeader, width: '12%' }}>Trib ft²</Text>
          <Text style={{ ...s.cellHeader, width: '12%' }}>p psf</Text>
          <Text style={{ ...s.cellHeader, width: '14%' }}>Wind lb</Text>
          {outputs.overhang && <Text style={{ ...s.cellHeader, width: '12%' }}>OH lb</Text>}
          <Text style={{ ...s.cellHeader, width: '14%' }}>DL lb</Text>
          <Text style={{ ...s.cellHeader, width: '16%' }}>Net lb</Text>
        </View>
        {outputs.span_results.map((r, i) => (
          <View key={`${r.zone}-${r.span_ft}`} style={i % 2 ? s.tableRowAlt : s.tableRow}>
            <Text style={{ ...s.cell, width: '10%' }}>{r.span_ft}</Text>
            <Text style={{ ...s.cell, width: '10%', color: r.zone === '2E' ? c.amber : c.blue }}>{r.zone}</Text>
            <Text style={{ ...s.cell, width: '12%' }}>{r.trib_area_ft2.toFixed(1)}</Text>
            <Text style={{ ...s.cell, width: '12%', color: c.red }}>{r.p_psf.toFixed(2)}</Text>
            <Text style={{ ...s.cell, width: '14%', color: c.red }}>{r.main_wind_force_lb}</Text>
            {outputs.overhang && <Text style={{ ...s.cell, width: '12%', color: c.red }}>{r.oh_wind_force_lb}</Text>}
            <Text style={{ ...s.cell, width: '14%', color: c.green }}>{r.total_dl_lb}</Text>
            <Text style={{ ...s.cell, width: '16%', fontFamily: 'Courier-Bold', color: r.net_uplift_lb < 0 ? c.red : c.green }}>{r.net_uplift_lb}</Text>
          </View>
        ))}

        {/* Summary */}
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
          <View style={{ borderRadius: 4, border: `0.5pt solid #e2e8f0`, padding: 8, paddingHorizontal: 12 }}>
            <Text style={{ fontSize: 7, color: c.grayDark, marginBottom: 2 }}>Max Uplift (Critical)</Text>
            <Text style={{ fontSize: 11, fontFamily: 'Courier-Bold', color: c.red }}>{outputs.max_net_uplift_lb} lb</Text>
          </View>
          <View style={{ borderRadius: 4, border: `0.5pt solid #e2e8f0`, padding: 8, paddingHorizontal: 12 }}>
            <Text style={{ fontSize: 7, color: c.grayDark, marginBottom: 2 }}>Min Uplift</Text>
            <Text style={{ fontSize: 11, fontFamily: 'Courier-Bold', color: outputs.min_net_uplift_lb < 0 ? c.red : c.green }}>{outputs.min_net_uplift_lb} lb</Text>
          </View>
        </View>

        <PageFooter firmName={firmName} projectName={projectName} />
      </Page>

      {/* ══════════════ PAGE 7: NOTES & ASSUMPTIONS ══════════════ */}
      <Page size="LETTER" style={s.page}>
        <PageHeader projectName={projectName} rightText="Notes & Assumptions" now={now} firmName={firmName} jobAddress={jobAddress} />

        <Text style={s.sectionHeader}>NOTES AND ASSUMPTIONS</Text>
        <Text style={s.calcLine}>1. All calculations based on FBC 8th Edition (2023) and ASCE 7-22</Text>
        <Text style={s.calcLine}>   using {inputs.designBasis} per ASCE 7-22 §26.10.2.</Text>
        <Text style={s.calcLine}> </Text>
        <Text style={s.calcLine}>2. Wind pressures determined using MWFRS Envelope Procedure for</Text>
        <Text style={s.calcLine}>   Low-Rise Buildings per ASCE 7-22 §28.3. Applicability confirmed:</Text>
        <Text style={s.calcLine}>   h = {inputs.h} ft {inputs.h <= 60 ? '≤ 60 ft ✓' : '> 60 ft ⚠'}.</Text>
        <Text style={s.calcLine}> </Text>
        <Text style={s.calcLine}>3. Exposure Category {inputs.exposureCategory} per §26.7.3. HVHZ requires</Text>
        <Text style={s.calcLine}>   minimum Exposure C per FBC §1609.1.1.</Text>
        <Text style={s.calcLine}> </Text>
        <Text style={s.calcLine}>4. Building classified as {inputs.enclosureType} per §26.12.</Text>
        <Text style={s.calcLine}>   GCpi applied per Table 26.13-1.</Text>
        <Text style={s.calcLine}> </Text>
        <Text style={s.calcLine}>5. GCpf values from Fig. 28.3-1 for {inputs.roofType} roof,</Text>
        <Text style={s.calcLine}>   θ = {inputs.pitchDegrees}°. Linear interpolation between tabulated</Text>
        <Text style={s.calcLine}>   slope breakpoints where applicable.</Text>
        <Text style={s.calcLine}> </Text>
        <Text style={s.calcLine}>6. Truss tributary area calculated using center-to-center spacing</Text>
        <Text style={s.calcLine}>   ({inputs.trussSpacing} ft) × half-span per bearing wall.</Text>
        <Text style={s.calcLine}> </Text>
        <Text style={s.calcLine}>7. Dead load of {inputs.deadLoad} psf applied with {inputs.designBasis === 'ASD' ? '0.6' : '0.9'} factor</Text>
        <Text style={s.calcLine}>   per {inputs.designBasis === 'ASD' ? '0.6D + W (ASD)' : '0.9D + 1.0W (LRFD)'} load combination.</Text>
        {inputs.hasOverhang && (
          <>
            <Text style={s.calcLine}> </Text>
            <Text style={s.calcLine}>8. Overhang uplift per §28.3.3 applied. Overhang depth = {inputs.overhangWidth} ft.</Text>
          </>
        )}
        <Text style={s.calcLine}> </Text>
        <Text style={s.calcLine}>{inputs.hasOverhang ? '9' : '8'}. These calculations address wind uplift on truss-to-wall connections</Text>
        <Text style={s.calcLine}>   only. Chord forces, web member design, ridge and hip/valley</Text>
        <Text style={s.calcLine}>   connections are not within scope and must be addressed separately.</Text>
        <Text style={s.calcLine}> </Text>
        <Text style={s.calcLine}>{inputs.hasOverhang ? '10' : '9'}. The Engineer of Record is responsible for verifying truss geometry,</Text>
        <Text style={s.calcLine}>   bearing conditions, and installation per applicable FBC requirements.</Text>

        {outputs.warnings.length > 0 && (
          <>
            <Text style={s.sectionHeader}>ACTIVE WARNINGS</Text>
            {outputs.warnings.map((w, i) => (
              <View key={i} style={s.warningBox}>
                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: w.level === 'error' ? c.red : w.level === 'warning' ? c.amber : c.blue }}>
                  {w.level === 'error' ? 'ERR' : w.level === 'warning' ? 'WRN' : 'INF'}
                </Text>
                <Text style={s.warningText}>{w.message}{w.reference ? ` [${w.reference}]` : ''}</Text>
              </View>
            ))}
          </>
        )}

        <PageFooter firmName={firmName} projectName={projectName} />
      </Page>

      {/* ══════════════ PAGE 8: SIGNATURE ══════════════ */}
      <Page size="LETTER" style={s.page}>
        <PageHeader projectName={projectName} rightText="Certification" now={now} firmName={firmName} jobAddress={jobAddress} />

        <Text style={s.sectionHeader}>CALCULATIONS PREPARED BY</Text>

        <View style={s.sigRow}>
          <View style={s.sigField}>
            {authorName ? <Text style={{ fontSize: 9, color: c.navy, marginBottom: 2 }}>{authorName}</Text> : null}
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Name</Text>
          </View>
          <View style={s.sigField}>
            {firmName ? <Text style={{ fontSize: 9, color: c.navy, marginBottom: 2 }}>{firmName}</Text> : null}
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Firm</Text>
          </View>
        </View>
        <View style={s.sigRow}>
          <View style={s.sigField}>
            {licenseLine ? <Text style={{ fontSize: 9, color: c.navy, marginBottom: 2 }}>{licenseLine}</Text> : null}
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>{engineer?.license_state || 'FL'} {engineer?.license_type || 'P.E.'} License No.</Text>
          </View>
          <View style={s.sigField}><View style={s.sigLine} /><Text style={s.sigLabel}>Title</Text></View>
        </View>
        <View style={s.sigRow}>
          <View style={s.sigField}><View style={s.sigLine} /><Text style={s.sigLabel}>Date</Text></View>
          <View style={s.sigField}><View style={s.sigLine} /><Text style={s.sigLabel}>Signature</Text></View>
        </View>

        <View style={{ ...s.sealBox, marginTop: 30 }}>
          <Text style={{ fontSize: 8, color: c.gray }}>ENGINEER'S SEAL</Text>
          <Text style={{ fontSize: 7, color: c.gray, marginTop: 2 }}>(Affix Here)</Text>
        </View>

        <View style={{ marginTop: 30 }}>
          <Text style={s.sectionHeader}>REVIEWER CERTIFICATION</Text>
          <Text style={{ fontSize: 8, color: c.slate, lineHeight: 1.6, marginLeft: 8 }}>
            "I hereby certify that these wind uplift calculations have been prepared by me or under my direct supervision, and that I am a duly licensed Professional Engineer under the laws of the State of {engineer?.license_state || 'Florida'}. These calculations conform to the requirements of the Florida Building Code, 8th Edition (2023) and ASCE 7-22 to the best of my knowledge and professional judgment."
          </Text>
          <View style={{ ...s.sigRow, marginTop: 24 }}>
            <View style={s.sigField}><View style={s.sigLine} /><Text style={s.sigLabel}>Signature</Text></View>
            <View style={s.sigField}><View style={s.sigLine} /><Text style={s.sigLabel}>Date</Text></View>
          </View>
          <View style={{ ...s.sigRow, marginTop: 16 }}>
            <View style={s.sigField}>
              {licenseLine ? <Text style={{ fontSize: 9, color: c.navy, marginBottom: 2 }}>{licenseLine}</Text> : null}
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>{engineer?.license_state || 'FL'} {engineer?.license_type || 'P.E.'} License No.</Text>
            </View>
            <View style={{ width: '45%' }} />
          </View>
        </View>

        {watermark && <WatermarkOverlay />}
        <PageFooter firmName={firmName} projectName={projectName} />
      </Page>
    </Document>
  );
};

// ──── Building Cross-Section SVG for PDF ────

const BuildingDiagramSvg = ({ inputs, outputs }: { inputs: CalculationInputs; outputs: CalculationOutputs }) => {
  const svgW = 510;
  const svgH = 300;
  const groundY = 250;
  const marginL = 60;
  const marginR = 60;

  const maxBuildingPx = svgW - marginL - marginR;
  const longestDim = Math.max(inputs.buildingWidth, 30);
  const scale = Math.min(maxBuildingPx / longestDim, 12);

  const bldgPxW = inputs.buildingWidth * scale;
  const bldgLeft = (svgW - bldgPxW) / 2;
  const bldgRight = bldgLeft + bldgPxW;

  const wallH = Math.max(30, Math.min(inputs.h * scale * 0.6, 120));
  const eaveY = groundY - wallH;

  const pitchRad = (inputs.pitchDegrees * Math.PI) / 180;
  const roofRise = Math.min((bldgPxW / 2) * Math.tan(pitchRad), 100);
  const ridgeY = eaveY - roofRise;
  const ridgeX = svgW / 2;

  const zoneAPx = outputs.zone_a_ft * scale;
  const zone2aPx = zoneAPx * 2;

  const ohPx = inputs.hasOverhang ? inputs.overhangWidth * scale : 0;

  // Truss positions
  const trusses: number[] = [];
  const spacingPx = inputs.trussSpacing * scale;
  if (spacingPx >= 4) {
    let x = bldgLeft + spacingPx;
    while (x < bldgRight - 2) {
      trusses.push(x);
      x += spacingPx;
    }
  }

  const roofYAt = (x: number) => {
    if (x <= ridgeX) {
      const t = (x - (bldgLeft - ohPx)) / (ridgeX - (bldgLeft - ohPx));
      return eaveY - t * roofRise;
    }
    const t = (x - ridgeX) / ((bldgRight + ohPx) - ridgeX);
    return ridgeY + t * roofRise;
  };

  return (
    <Svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`}>
      {/* Ground */}
      <SvgLine x1={30} y1={groundY} x2={svgW - 30} y2={groundY} stroke="#334155" strokeWidth={1.5} />

      {/* Building walls */}
      <Rect x={bldgLeft} y={eaveY} width={bldgPxW} height={wallH} fill="#1e293b" stroke="#2563eb" strokeWidth={1} strokeOpacity={0.4} />

      {/* Roof */}
      <Polygon
        points={`${bldgLeft - ohPx},${eaveY} ${ridgeX},${ridgeY} ${bldgRight + ohPx},${eaveY}`}
        fill="#1e293b" stroke="#2563eb" strokeWidth={1} strokeOpacity={0.5}
      />

      {/* Zone 2E bands */}
      {zone2aPx > 0 && (
        <>
          <Polygon
            points={`${bldgLeft - ohPx},${eaveY} ${bldgLeft - ohPx + zone2aPx},${roofYAt(bldgLeft - ohPx + zone2aPx)} ${bldgLeft - ohPx + zone2aPx},${eaveY}`}
            fill="#d97706" fillOpacity={0.15} stroke="#d97706" strokeWidth={0.5} strokeOpacity={0.4}
          />
          <Polygon
            points={`${bldgRight + ohPx},${eaveY} ${bldgRight + ohPx - zone2aPx},${roofYAt(bldgRight + ohPx - zone2aPx)} ${bldgRight + ohPx - zone2aPx},${eaveY}`}
            fill="#d97706" fillOpacity={0.15} stroke="#d97706" strokeWidth={0.5} strokeOpacity={0.4}
          />
        </>
      )}

      {/* Zone labels */}
      {zone2aPx > 8 && (
        <>
          <SvgLine x1={bldgLeft - ohPx} y1={eaveY - roofRise - 16} x2={bldgLeft - ohPx + zone2aPx} y2={eaveY - roofRise - 16} stroke="#d97706" strokeWidth={0.6} strokeOpacity={0.6} />
          {/* Zone 2E left label */}
        </>
      )}

      {/* Truss lines */}
      {trusses.map((x, i) => (
        <SvgLine key={i} x1={x} y1={eaveY} x2={x} y2={groundY} stroke="#2563eb" strokeWidth={0.4} strokeOpacity={0.25} />
      ))}

      {/* Wind arrows */}
      {[0, 1, 2].map(i => {
        const y = eaveY - roofRise * 0.2 + i * (wallH * 0.35);
        return <SvgLine key={i} x1={18} y1={y} x2={bldgLeft - ohPx - 8} y2={y} stroke="#dc2626" strokeWidth={1.5} />;
      })}

      {/* Uplift arrows */}
      {[-0.3, 0, 0.3].map((offset, i) => {
        const x = ridgeX + offset * bldgPxW * 0.4;
        const yBase = roofYAt(x);
        return <SvgLine key={i} x1={x} y1={yBase - 2} x2={x} y2={yBase - 18} stroke="#dc2626" strokeWidth={1} />;
      })}

      {/* Legend box */}
      <Rect x={svgW - 140} y={8} width={130} height={60} rx={4} fill="#0f172a" stroke="#2563eb" strokeWidth={0.5} strokeOpacity={0.3} />
      {/* qh */}
      {/* Dimension labels are rendered as simple positioned text */}
    </Svg>
  );
};

export default WindCalcPdfReport;
