import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { FastenerInputs, FastenerOutputs, TAS105Outputs, NOAZoneResult } from '@/lib/fastener-engine';
import type { EngineerProfile } from '@/lib/engineer-profile';
import WatermarkOverlay from './WatermarkOverlay';

const c = {
  navy: '#0f172a',
  slate: '#1e293b',
  blue: '#2563eb',
  blueLight: '#93c5fd',
  white: '#ffffff',
  gray: '#94a3b8',
  grayLight: '#cbd5e1',
  grayDark: '#475569',
  red: '#dc2626',
  green: '#16a34a',
  amber: '#d97706',
  orange: '#ea580c',
  border: '#cbd5e1',
  bgLight: '#f1f5f9',
};

const s = StyleSheet.create({
  page: {
    paddingTop: 54, paddingBottom: 72, paddingHorizontal: 54,
    fontFamily: 'Helvetica', fontSize: 9, color: c.navy, backgroundColor: c.white,
  },
  coverPage: { padding: 0, backgroundColor: c.navy },
  coverContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 60 },
  coverTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: c.white, marginBottom: 4 },
  coverSub: { fontSize: 11, color: c.blueLight, marginBottom: 24 },
  coverLine: { width: 80, height: 3, backgroundColor: c.blue, marginBottom: 30 },
  coverMeta: { alignItems: 'center' },
  coverMetaText: { fontSize: 10, color: c.gray, marginBottom: 4 },
  coverDate: { fontSize: 11, color: c.grayLight, marginTop: 8 },
  sealBox: {
    border: `1.5pt dashed ${c.gray}`, width: 180, height: 180,
    alignItems: 'center', justifyContent: 'center', marginTop: 30,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderBottom: `1pt solid ${c.border}`, paddingBottom: 6, marginBottom: 14,
  },
  headerTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: c.blue },
  headerRight: { fontSize: 7, color: c.grayDark },
  sectionHeader: {
    fontSize: 9, fontFamily: 'Helvetica-Bold', color: c.navy,
    backgroundColor: c.bgLight, padding: '4 6', marginBottom: 6, marginTop: 14,
    borderLeft: `3pt solid ${c.blue}`, paddingLeft: 8,
  },
  sectionSub: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: c.navy, marginBottom: 4, marginTop: 10 },
  calcLine: { fontFamily: 'Courier', fontSize: 8.5, color: c.slate, lineHeight: 1.6, marginLeft: 16 },
  resultLine: { fontFamily: 'Courier-Bold', fontSize: 9, color: c.navy, marginLeft: 16 },
  codeRef: { fontSize: 7.5, color: c.grayDark },
  paramRow: { flexDirection: 'row', marginBottom: 2 },
  paramLabel: { fontSize: 8, color: c.grayDark, width: '45%' },
  paramValue: { fontSize: 8, fontFamily: 'Courier', color: c.navy, width: '35%' },
  paramRef: { fontSize: 7, color: c.grayDark, width: '20%', textAlign: 'right' },
  tableHeader: {
    flexDirection: 'row', backgroundColor: '#e2e8f0',
    borderBottom: `1pt solid ${c.border}`, paddingVertical: 3,
  },
  tableRow: { flexDirection: 'row', borderBottom: `0.5pt solid #e2e8f0`, paddingVertical: 2.5 },
  tableRowAlt: { flexDirection: 'row', borderBottom: `0.5pt solid #e2e8f0`, paddingVertical: 2.5, backgroundColor: '#f8fafc' },
  cell: { paddingHorizontal: 4, fontSize: 8, fontFamily: 'Courier' },
  cellHeader: { paddingHorizontal: 4, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: c.grayDark },
  passLabel: { color: c.green, fontFamily: 'Helvetica-Bold', fontSize: 8 },
  failLabel: { color: c.red, fontFamily: 'Helvetica-Bold', fontSize: 8 },
  warnLabel: { color: c.amber, fontFamily: 'Helvetica-Bold', fontSize: 8 },
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

const SYSTEM_LABELS: Record<string, string> = {
  modified_bitumen: 'Modified Bitumen / BUR',
  single_ply: 'Single-Ply (TPO/EPDM/PVC)',
  adhered: 'Adhered Membrane',
};

const DECK_LABELS: Record<string, string> = {
  plywood: 'Plywood',
  structural_concrete: 'Structural Concrete',
  steel_deck: 'Steel Deck',
  wood_plank: 'Wood Plank',
  lw_concrete: 'LW Insulating Concrete',
};

const ParamRow = ({ label, value, ref: codeRef }: { label: string; value: string; ref?: string }) => (
  <View style={s.paramRow}>
    <Text style={s.paramLabel}>{label}</Text>
    <Text style={s.paramValue}>{value}</Text>
    {codeRef && <Text style={s.paramRef}>[{codeRef}]</Text>}
  </View>
);

const PageFooter = ({ rasRef, firmName }: { rasRef: string; firmName?: string }) => (
  <View style={s.footer} fixed>
    <Text>{firmName || 'HVHZ Calc Pro'} · {rasRef} · ASCE 7-22 · FBC 8th Ed.</Text>
    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
  </View>
);

const PageHeader = ({ projectName, rightText, now, firmName, jobAddress }: { projectName: string; rightText: string; now: string; firmName?: string; jobAddress?: string }) => (
  <View style={s.header}>
    <View>
      <Text style={s.headerTitle}>{firmName || 'HVHZ Calc Pro'} · FastenerCalc — {projectName}</Text>
      {jobAddress ? <Text style={{ fontSize: 7, color: c.grayDark, marginTop: 1 }}>{jobAddress}</Text> : null}
    </View>
    <Text style={s.headerRight}>{rightText} · {now}</Text>
  </View>
);

// ──── Basis helpers ────

function basisLabel(basis: string): string {
  switch (basis) {
    case 'prescriptive': return 'NOA Prescriptive';
    case 'rational_analysis': return 'RAS 117 Rational';
    case 'exceeds_300pct': return 'Exceeds 300%';
    case 'asterisked_fail': return 'Asterisked Fail';
    default: return basis;
  }
}

function basisColor(basis: string): string {
  switch (basis) {
    case 'prescriptive': return c.blue;
    case 'rational_analysis': return c.amber;
    case 'exceeds_300pct': return c.orange;
    case 'asterisked_fail': return c.red;
    default: return c.grayDark;
  }
}

// ──── Main Component ────

interface Props {
  inputs: FastenerInputs;
  outputs: FastenerOutputs;
  tas105Outputs?: TAS105Outputs | null;
  projectName?: string;
  preparedBy?: string;
  jobAddress?: string;
  peNumber?: string;
  watermark?: boolean;
  engineer?: EngineerProfile | null;
}

const FastenerCalcPdfReport = ({
  inputs,
  outputs,
  tas105Outputs,
  projectName = 'Untitled Project',
  preparedBy = '',
  jobAddress = '',
  peNumber = '',
  watermark = false,
  engineer,
}: Props) => {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const rasRef = inputs.systemType === 'single_ply' ? 'RAS 137-20' : 'RAS 117-20';
  const NW = inputs.sheetWidth_in - inputs.lapWidth_in;
  const mdpAbs = Math.abs(inputs.noa.mdp_psf);
  const maxFactor = outputs.maxExtrapolationFactor;
  const countyLabel = inputs.county === 'miami_dade' ? 'Miami-Dade County — HVHZ' : inputs.county === 'broward' ? 'Broward County — HVHZ' : 'Non-HVHZ';
  const firmName = engineer?.business_name || engineer?.company || '';
  const firmLine = [firmName, engineer?.business_address].filter(Boolean).join(' · ');
  const contactLine = [engineer?.business_phone, engineer?.business_email].filter(Boolean).join(' · ');
  const authorName = preparedBy || engineer?.display_name || '';
  const licNum = peNumber || (engineer?.pe_license ? `${engineer.license_state || 'FL'} ${engineer.license_type || 'PE'} #${engineer.pe_license}` : '');

  return (
    <Document title={firmName ? `${firmName} — ${projectName}` : `FastenerCalc HVHZ — ${projectName}`} author={authorName || 'HVHZ Calc Pro'}>

      {/* ══════════════ PAGE 1: COVER ══════════════ */}
      <Page size="LETTER" style={s.coverPage}>
        <View style={s.coverContent}>
          <Text style={{ fontSize: 10, color: c.gray, marginBottom: 8 }}>{firmName || 'HVHZ Calc Pro'}</Text>
          <Text style={s.coverTitle}>ROOF COVERING ATTACHMENT CALCULATIONS</Text>
          <Text style={s.coverSub}>FBC 8th Edition (2023) · ASCE 7-22 · {rasRef} · TAS 105</Text>
          <View style={s.coverLine} />
          <View style={s.coverMeta}>
            <Text style={{ fontSize: 14, color: c.white, fontFamily: 'Helvetica-Bold', marginBottom: 12 }}>{projectName}</Text>
            {jobAddress ? <Text style={s.coverMetaText}>Address: {jobAddress}</Text> : null}
            <Text style={s.coverMetaText}>County: {countyLabel}</Text>
            <Text style={s.coverMetaText}>Construction: {inputs.constructionType}</Text>
            {authorName ? <Text style={s.coverMetaText}>Prepared by: {authorName}</Text> : null}
            {licNum ? <Text style={s.coverMetaText}>{licNum}</Text> : null}
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
          DISCLAIMER: {firmName ? `This report was prepared by ${firmName}` : 'FastenerCalc HVHZ provides calculations'} as a design aid based on the Florida Building Code 8th Edition (2023), ASCE 7-22, and the Florida Test Protocols for High-Velocity Hurricane Zones (RAS 117, RAS 128, TAS 105). All results must be reviewed, verified, and approved by a licensed Professional Engineer or Registered Architect responsible for the project. These calculations must be signed and sealed by a qualified design professional prior to permit submission in Miami-Dade and Broward Counties. The Engineer of Record is solely responsible for verifying the applicability of all referenced standards to specific project conditions.
        </Text>
        {watermark && <WatermarkOverlay />}
      </Page>

      {/* ══════════════ PAGE 2: PROJECT CRITERIA ══════════════ */}
      <Page size="LETTER" style={s.page}>
        <PageHeader projectName={projectName} rightText="Project Criteria" now={now} firmName={firmName} jobAddress={jobAddress} />

        <Text style={s.sectionHeader}>SITE INFORMATION</Text>
        <ParamRow label="Location:" value={`${jobAddress || '—'} (${countyLabel})`} />
        <ParamRow label="Construction Type:" value={inputs.constructionType} />
        <ParamRow label="Risk Category:" value={inputs.riskCategory} ref="Table 1.5-1" />

        <Text style={s.sectionHeader}>WIND PARAMETERS</Text>
        <ParamRow label="Basic Wind Speed:" value={`${inputs.V} mph`} ref="Fig. 26.5-1A" />
        <ParamRow label="Exposure Category:" value={inputs.exposureCategory} ref="§26.7.3" />
        <ParamRow label="Enclosure Class:" value={inputs.enclosure} ref="§26.2" />
        <ParamRow label="Building Height:" value={`h = ${inputs.h} ft (mean roof)`} />
        <ParamRow label="Slope:" value="≤ 7° (low-slope)" />

        <Text style={s.sectionHeader}>WIND COEFFICIENTS</Text>
        <ParamRow label="Kh:" value={`${outputs.Kh}`} ref="Table 26.10-1" />
        <ParamRow label="Kzt:" value={`${inputs.Kzt}`} ref="§26.8" />
        <ParamRow label="Kd:" value={`${inputs.Kd}`} ref="Table 26.6-1" />
        <ParamRow label="Ke:" value={`${inputs.Ke}`} ref="Table 26.9-1" />
        <ParamRow label="GCpi:" value={`+${outputs.GCpi}`} ref="Table 26.13-1" />

        <Text style={s.sectionHeader}>VELOCITY PRESSURE (ASD)</Text>
        <Text style={s.calcLine}>qh = 0.00256 x Kh x Kzt x Ke x V^2 x 0.6</Text>
        <Text style={s.calcLine}>   = 0.00256 x {outputs.Kh} x {inputs.Kzt} x {inputs.Ke} x {inputs.V}^2 x 0.6</Text>
        <Text style={s.resultLine}>qh = {outputs.qh_ASD.toFixed(2)} psf</Text>

        <Text style={s.sectionHeader}>PRODUCT APPROVAL</Text>
        <ParamRow label="Approval Type:" value={inputs.noa.approvalType === 'miami_dade_noa' ? 'Miami-Dade NOA' : 'FL Product Approval'} />
        <ParamRow label="Approval Number:" value={inputs.noa.approvalNumber || '—'} />
        <ParamRow label="Manufacturer:" value={inputs.noa.manufacturer || '—'} />
        <ParamRow label="Product/System:" value={`${inputs.noa.productName || '—'} / ${inputs.noa.systemNumber || '—'}`} />
        <ParamRow label="Max Design Pressure:" value={`${mdpAbs} psf (from NOA)`} />
        <ParamRow label="Extrapolation:" value={inputs.noa.asterisked ? 'Not Permitted (Asterisked)' : 'Permitted'} />

        <Text style={s.sectionHeader}>FASTENER DATA</Text>
        <ParamRow label="Fy (Design):" value={`${inputs.Fy_lbf.toFixed(2)} lbf [${inputs.fySource === 'tas105' ? 'TAS 105 Field Test' : 'NOA'}]`} />
        <ParamRow label="Sheet Width (SW):" value={`${inputs.sheetWidth_in}"`} />
        <ParamRow label="Lap Width (LW):" value={`${inputs.lapWidth_in}"`} />
        <ParamRow label="Net Width (NW):" value={`${NW.toFixed(3)}"`} />

        <Text style={s.sectionHeader}>DECK</Text>
        <ParamRow label="Deck Type:" value={DECK_LABELS[inputs.deckType] || inputs.deckType} />

        <PageFooter rasRef={rasRef} firmName={firmName} />
      </Page>

      {/* ══════════════ PAGE 3: DESIGN PRESSURE DERIVATION ══════════════ */}
      <Page size="LETTER" style={s.page}>
        <PageHeader projectName={projectName} rightText="Design Pressures" now={now} firmName={firmName} jobAddress={jobAddress} />

        <Text style={s.sectionHeader}>DESIGN WIND PRESSURES — LOW-SLOPE ROOF</Text>
        <Text style={{ fontSize: 8, color: c.grayDark, marginBottom: 6, marginLeft: 8 }}>
          Per ASCE 7-22 §30.3 (C&C, h ≤ 60 ft, θ ≤ 7°) · EWA = 10 ft²
        </Text>
        <Text style={s.calcLine}>p = qh x Kd x (GCp - GCpi)</Text>

        {outputs.fastenerResults.map(r => {
          const GCp = r.zone === "1'" ? -0.90 : r.zone === '1' ? -1.70 : r.zone === '2' ? -2.30 : -3.20;
          const zoneLabel = r.zone === "1'" ? "Zone 1' (Field)" : `Zone ${r.zone}`;
          const figRef = `Fig. 30.3-2A, Zone ${r.zone}`;
          return (
            <View key={r.zone} style={{ marginBottom: 6 }}>
              <Text style={s.sectionSub}>{zoneLabel}</Text>
              <Text style={s.calcLine}>GCp = {GCp.toFixed(2)}  [{figRef}]</Text>
              <Text style={s.calcLine}>p = {outputs.qh_ASD.toFixed(2)} x {inputs.Kd} x ({GCp.toFixed(2)} - (+{outputs.GCpi}))</Text>
              <Text style={s.calcLine}>  = {outputs.qh_ASD.toFixed(2)} x {inputs.Kd} x {(GCp - outputs.GCpi).toFixed(2)}</Text>
              <Text style={s.resultLine}>p = {r.P_psf.toFixed(2)} psf</Text>
            </View>
          );
        })}

        <Text style={s.sectionHeader}>ZONE BOUNDARY DIMENSIONS</Text>
        <Text style={s.calcLine}>Zone width = 0.6 x h = 0.6 x {inputs.h} = {outputs.zonePressures.zoneWidth_ft.toFixed(2)} ft  [Fig. 30.3-2A]</Text>

        <Text style={s.sectionHeader}>NOA / PRODUCT APPROVAL COMPATIBILITY</Text>
        <Text style={s.calcLine}>Assembly: {inputs.noa.productName || '—'} ({inputs.noa.approvalNumber || '—'})</Text>
        <Text style={s.calcLine}>NOA MDP: {mdpAbs} psf — Zone 1 prescriptive attachment capacity</Text>
        <Text style={{ ...s.calcLine, marginTop: 4 }}> </Text>
        {outputs.noaResults.map(nr => (
          <Text key={nr.zone} style={{ ...s.calcLine, color: basisColor(nr.basis) }}>
            Zone {nr.zone}: {Math.abs(nr.P_psf).toFixed(1)} psf / {mdpAbs} psf = {nr.extrapFactor.toFixed(2)}x → {basisLabel(nr.basis).toUpperCase()}
          </Text>
        ))}
        <Text style={{ ...s.calcLine, marginTop: 4 }}>
          Max factor applied: {maxFactor.toFixed(2)}x (limit: 3.00x per RAS 137 §6.1.3)
        </Text>

        <PageFooter rasRef={rasRef} firmName={firmName} />
      </Page>

      {/* ══════════════ PAGE 4: ZONE DIAGRAM ══════════════ */}
      <Page size="LETTER" style={s.page}>
        <PageHeader projectName={projectName} rightText="Zone Layout" now={now} firmName={firmName} jobAddress={jobAddress} />

        <Text style={s.sectionHeader}>FIGURE 1 — ROOF ZONE LAYOUT</Text>
        <Text style={{ fontSize: 7.5, color: c.grayDark, marginBottom: 8, marginLeft: 8 }}>
          Per ASCE 7-22 Fig. 30.3-2A · Low-slope (θ ≤ 7°)
        </Text>

        <ZoneDiagramPdf
          length={inputs.buildingLength}
          width={inputs.buildingWidth}
          zoneWidth={outputs.zonePressures.zoneWidth_ft}
          pressures={outputs.zonePressures}
          mdp={mdpAbs}
          fastenerResults={outputs.fastenerResults}
        />

        <PageFooter rasRef={rasRef} firmName={firmName} />
      </Page>

      {/* ══════════════ PAGE 5: RAS 117 DERIVATION ══════════════ */}
      <Page size="LETTER" style={s.page}>
        <PageHeader projectName={projectName} rightText="Fastener Derivation" now={now} firmName={firmName} jobAddress={jobAddress} />

        <Text style={s.sectionHeader}>BASE SHEET ATTACHMENT — FASTENER SPACING CALCULATIONS</Text>
        <Text style={{ fontSize: 8, color: c.grayDark, marginBottom: 4, marginLeft: 8 }}>
          Per {rasRef} · {inputs.noa.productName || 'Assembly'} · Fy = {inputs.Fy_lbf} lbf ({inputs.fySource === 'tas105' ? 'TAS 105' : 'NOA'})
        </Text>

        <Text style={s.sectionSub}>Sheet Geometry</Text>
        <Text style={s.calcLine}>SW = {inputs.sheetWidth_in}"  LW = {inputs.lapWidth_in}"</Text>
        <Text style={s.calcLine}>NW = SW - LW = {inputs.sheetWidth_in} - {inputs.lapWidth_in} = {NW.toFixed(3)}" = {(NW / 12).toFixed(4)} ft</Text>
        <Text style={{ ...s.calcLine, marginTop: 2 }}>FS = (Fy x 144) / (P x RS)  where RS = NW / (n - 1)</Text>

        {outputs.fastenerResults.map(r => {
          const noaBasis = r.noaCheck.basis;
          const header = noaBasis === 'prescriptive'
            ? `Zone ${r.zone} — NOA PRESCRIPTIVE`
            : `Zone ${r.zone} — RAS 117 RATIONAL ANALYSIS`;
          const subtext = noaBasis === 'rational_analysis'
            ? `Pressure ${r.P_psf.toFixed(1)} psf exceeds NOA MDP ${mdpAbs} psf (factor: ${r.noaCheck.extrapFactor.toFixed(2)}x). Within 3.0x limit per RAS 137 §6.1.3.`
            : noaBasis === 'prescriptive'
            ? `Pressure ${r.P_psf.toFixed(1)} psf within NOA MDP ${mdpAbs} psf. Prescriptive pattern applies.`
            : '';
          const effNW = r.halfSheetRequired ? NW / 2 : NW;
          return (
            <View key={`deriv-${r.zone}`} style={{ marginBottom: 8 }}>
              <Text style={{ ...s.sectionSub, borderBottom: `0.5pt solid ${c.border}`, paddingBottom: 2 }}>{header}</Text>
              {subtext ? <Text style={{ fontSize: 7, color: c.grayDark, marginBottom: 2, marginLeft: 16 }}>{subtext}</Text> : null}
              <Text style={s.calcLine}>P = {r.P_psf.toFixed(1)} psf</Text>
              <Text style={s.calcLine}>n = {r.n_rows} rows → RS = {effNW.toFixed(3)} / ({r.n_rows} - 1) = {r.RS_in}"</Text>
              <Text style={s.calcLine}>FS = ({inputs.Fy_lbf} x 144) / ({r.P_psf.toFixed(1)} x {r.RS_in}) = {r.FS_calculated_in}"</Text>
              <Text style={s.calcLine}>FS used = {r.FS_used_in}" (rounded 1/2" down, min 4", max 12")</Text>
              <Text style={s.calcLine}>A = ({r.FS_used_in} x {r.RS_in}) / 144 = {r.A_fastener_ft2} ft²</Text>
              <Text style={s.calcLine}>F_demand = {r.P_psf.toFixed(1)} x {r.A_fastener_ft2} = {r.F_demand_lbf} lbf</Text>
              <Text style={s.resultLine}>D/R = {r.F_demand_lbf} / {inputs.Fy_lbf} = {(r.demandRatio * 100).toFixed(0)}%{r.halfSheetRequired ? '  [HALF SHEET]' : ''}</Text>
            </View>
          );
        })}

        <PageFooter rasRef={rasRef} firmName={firmName} />
      </Page>

      {/* ══════════════ PAGE 6: PATTERN SUMMARY ══════════════ */}
      <Page size="LETTER" style={s.page}>
        <PageHeader projectName={projectName} rightText="Pattern Summary" now={now} firmName={firmName} jobAddress={jobAddress} />

        <Text style={s.sectionHeader}>FASTENER PATTERN SUMMARY</Text>
        <Text style={{ fontSize: 8, color: c.grayDark, marginBottom: 2, marginLeft: 8 }}>
          Base Sheet: {inputs.noa.productName || SYSTEM_LABELS[inputs.systemType]}
        </Text>
        <Text style={{ fontSize: 8, color: c.grayDark, marginBottom: 6, marginLeft: 8 }}>
          Per {rasRef} | NOA: {inputs.noa.approvalNumber || '—'} | MDP: {mdpAbs} psf
        </Text>

        {/* Results table */}
        <View style={s.tableHeader}>
          <Text style={{ ...s.cellHeader, width: '10%' }}>Zone</Text>
          <Text style={{ ...s.cellHeader, width: '12%' }}>P (psf)</Text>
          <Text style={{ ...s.cellHeader, width: '14%' }}>Basis</Text>
          <Text style={{ ...s.cellHeader, width: '10%' }}>n Rows</Text>
          <Text style={{ ...s.cellHeader, width: '12%' }}>FS Calc</Text>
          <Text style={{ ...s.cellHeader, width: '12%' }}>FS Used</Text>
          <Text style={{ ...s.cellHeader, width: '10%' }}>D/R</Text>
          <Text style={{ ...s.cellHeader, width: '10%' }}>Extrap</Text>
          <Text style={{ ...s.cellHeader, width: '10%' }}>1/2 Sht</Text>
        </View>
        {outputs.fastenerResults.map((r, i) => (
          <View key={r.zone} style={i % 2 ? s.tableRowAlt : s.tableRow}>
            <Text style={{ ...s.cell, width: '10%', fontFamily: 'Helvetica-Bold' }}>{r.zone}</Text>
            <Text style={{ ...s.cell, width: '12%' }}>{r.P_psf.toFixed(1)}</Text>
            <Text style={{ ...s.cell, width: '14%', color: basisColor(r.noaCheck.basis), fontSize: 7 }}>
              {r.noaCheck.basis === 'prescriptive' ? 'NOA' : 'RAS 117'}
            </Text>
            <Text style={{ ...s.cell, width: '10%' }}>{r.n_rows}</Text>
            <Text style={{ ...s.cell, width: '12%' }}>{r.FS_calculated_in}"</Text>
            <Text style={{ ...s.cell, width: '12%', fontFamily: 'Courier-Bold' }}>{r.FS_used_in}"</Text>
            <Text style={{ ...s.cell, width: '10%', color: r.demandRatio > 0.95 ? c.red : r.demandRatio > 0.75 ? c.amber : c.green }}>
              {(r.demandRatio * 100).toFixed(0)}%
            </Text>
            <Text style={{ ...s.cell, width: '10%' }}>{r.noaCheck.extrapFactor.toFixed(2)}x</Text>
            <Text style={{ ...s.cell, width: '10%' }}>{r.halfSheetRequired ? 'YES' : '—'}</Text>
          </View>
        ))}

        {/* Permit-ready text block */}
        <View style={{ marginTop: 12, padding: 8, border: `1pt solid ${c.border}`, borderRadius: 3 }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8, marginBottom: 4 }}>Fastener Spacing for Base Sheet Attachment:</Text>
          {outputs.fastenerResults.map(r => {
            const basis = r.noaCheck.basis === 'prescriptive' ? '(NOA)' : '(RAS 117)';
            return (
              <Text key={r.zone} style={{ fontFamily: 'Courier', fontSize: 8, lineHeight: 1.5 }}>
                Zone {r.zone}: {r.FS_used_in}" o.c. at {inputs.lapWidth_in}" lap + {r.FS_used_in}" o.c. at {r.n_rows - 1} rows {basis}{r.halfSheetRequired ? ' [HALF SHEET]' : ''}
              </Text>
            );
          })}
        </View>

        {/* Insulation */}
        <Text style={s.sectionHeader}>INSULATION BOARD FASTENERS (RAS 117 §8)</Text>
        <Text style={{ fontSize: 8, color: c.grayDark, marginBottom: 4, marginLeft: 8 }}>
          Board: {inputs.boardLength_ft}' x {inputs.boardWidth_ft}' = {inputs.boardLength_ft * inputs.boardWidth_ft} ft² · Fy = {inputs.insulation_Fy_lbf || inputs.Fy_lbf} lbf
        </Text>
        <View style={s.tableHeader}>
          <Text style={{ ...s.cellHeader, width: '20%' }}>Zone</Text>
          <Text style={{ ...s.cellHeader, width: '20%' }}>P (psf)</Text>
          <Text style={{ ...s.cellHeader, width: '20%' }}>N Req'd</Text>
          <Text style={{ ...s.cellHeader, width: '20%' }}>N Used</Text>
          <Text style={{ ...s.cellHeader, width: '20%' }}>Layout</Text>
        </View>
        {outputs.insulationResults.map((r, i) => (
          <View key={r.zone} style={i % 2 ? s.tableRowAlt : s.tableRow}>
            <Text style={{ ...s.cell, width: '20%', fontFamily: 'Helvetica-Bold' }}>{r.zone}</Text>
            <Text style={{ ...s.cell, width: '20%' }}>{r.P_psf}</Text>
            <Text style={{ ...s.cell, width: '20%' }}>{r.N_required}</Text>
            <Text style={{ ...s.cell, width: '20%', fontFamily: 'Courier-Bold' }}>{r.N_used}</Text>
            <Text style={{ ...s.cell, width: '20%' }}>{r.layout}</Text>
          </View>
        ))}

        <PageFooter rasRef={rasRef} firmName={firmName} />
      </Page>

      {/* ══════════════ PAGE 7: TAS 105 (conditional) ══════════════ */}
      {tas105Outputs && (
        <Page size="LETTER" style={s.page}>
          <PageHeader projectName={projectName} rightText="TAS 105 Results" now={now} firmName={firmName} jobAddress={jobAddress} />

          <Text style={s.sectionHeader}>FASTENER WITHDRAWAL RESISTANCE TEST RESULTS</Text>
          <Text style={{ fontSize: 8, color: c.grayDark, marginBottom: 6, marginLeft: 8 }}>
            Per Testing Application Standard TAS 105 — FBC HVHZ Test Protocols (2023)
          </Text>

          <ParamRow label="Deck Type:" value={DECK_LABELS[inputs.deckType] || inputs.deckType} />

          <Text style={s.sectionSub}>Statistical Analysis (TAS 105 Method)</Text>
          <Text style={s.calcLine}>n = {tas105Outputs.n} samples</Text>
          <Text style={s.calcLine}>Mean (X) = {tas105Outputs.mean_lbf} lbf</Text>
          <Text style={s.calcLine}>Std Dev = {tas105Outputs.stdDev_lbf} lbf</Text>
          <Text style={s.calcLine}>t-factor = {tas105Outputs.tFactor} ({tas105Outputs.n >= 10 ? 'n >= 10, one-sided 95% bound' : 'n < 10, conservative factor'})</Text>
          <Text style={{ ...s.calcLine, marginTop: 4 }}>MCRF = X - (t x sigma)</Text>
          <Text style={s.calcLine}>     = {tas105Outputs.mean_lbf} - ({tas105Outputs.tFactor} x {tas105Outputs.stdDev_lbf})</Text>
          <Text style={s.calcLine}>     = {tas105Outputs.mean_lbf} - {(tas105Outputs.tFactor * tas105Outputs.stdDev_lbf).toFixed(2)}</Text>
          <Text style={s.resultLine}>MCRF = {tas105Outputs.MCRF_lbf} lbf</Text>

          <Text style={{ ...s.calcLine, marginTop: 6 }}>Minimum Threshold: 275 lbf [FBC HVHZ §1620 / RAS 117-20]</Text>
          <Text style={tas105Outputs.pass ? s.passLabel : s.failLabel}>
            RESULT: {tas105Outputs.MCRF_lbf} lbf {tas105Outputs.pass ? '>=' : '<'} 275 lbf — {tas105Outputs.pass ? 'PASS' : 'FAIL'}
          </Text>
          {tas105Outputs.pass && (
            <Text style={{ ...s.calcLine, marginTop: 4 }}>Design Fy used: {tas105Outputs.MCRF_lbf} lbf (from TAS 105 field test)</Text>
          )}

          <PageFooter rasRef={rasRef} firmName={firmName} />
        </Page>
      )}

      {/* ══════════════ PAGE 8: WARNINGS ══════════════ */}
      <Page size="LETTER" style={s.page}>
        <PageHeader projectName={projectName} rightText="Notes & Assumptions" now={now} firmName={firmName} jobAddress={jobAddress} />

        <Text style={s.sectionHeader}>NOTES AND ASSUMPTIONS</Text>
        <Text style={s.calcLine}>1. All calculations based on FBC 8th Edition (2023) and ASCE 7-22 using ASD (0.6 factor).</Text>
        <Text style={s.calcLine}>2. Design pressures for enclosed building per ASCE 7-22 §26.12. GCpi = +{outputs.GCpi}.</Text>
        <Text style={s.calcLine}>3. Exposure {inputs.exposureCategory} per §26.7.3. HVHZ requires Exposure C per FBC §1620.</Text>
        <Text style={s.calcLine}>4. EWA = 10 ft² per RAS 128 for membrane systems.</Text>
        <Text style={s.calcLine}>5. Zone boundaries per Fig. 30.3-2A: width = 0.6h = {outputs.zonePressures.zoneWidth_ft.toFixed(2)} ft.</Text>
        <Text style={s.calcLine}>6. FS rounded down to nearest 0.5". No spacing less than 6" per RAS 137 §4.</Text>
        <Text style={s.calcLine}>7. NOA MDP {mdpAbs} psf is Zone 1' tested condition ({inputs.noa.approvalNumber || '—'}).</Text>
        <Text style={s.calcLine}>   Enhanced attachment per {rasRef} rational analysis applied where P {'>'} MDP,</Text>
        <Text style={s.calcLine}>   up to 300% limit per RAS 137 §6.1.3. Max factor: {maxFactor.toFixed(2)}x.</Text>
        {tas105Outputs ? (
          <Text style={s.calcLine}>8. Fy = {tas105Outputs.MCRF_lbf} lbf from TAS 105 field test ({tas105Outputs.pass ? 'PASS' : 'FAIL'}).</Text>
        ) : (
          <Text style={s.calcLine}>8. TAS 105 not required. NOA Fy = {inputs.Fy_lbf.toFixed(2)} lbf used directly.</Text>
        )}
        {outputs.halfSheetZones.length > 0 && (
          <Text style={s.calcLine}>9. Half-sheet required in Zone(s) {outputs.halfSheetZones.join(', ')}.</Text>
        )}

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

        <PageFooter rasRef={rasRef} firmName={firmName} />
      </Page>

      {/* ══════════════ PAGE 9: SIGNATURE ══════════════ */}
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
            {licNum ? <Text style={{ fontSize: 9, color: c.navy, marginBottom: 2 }}>{licNum}</Text> : null}
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
            "I hereby certify that these calculations have been prepared by me or under my direct supervision, and that I am a duly licensed Professional Engineer under the laws of the State of {engineer?.license_state || 'Florida'}. These calculations conform to the requirements of the Florida Building Code, 8th Edition (2023) and ASCE 7-22 to the best of my knowledge and professional judgment."
          </Text>
          <View style={{ ...s.sigRow, marginTop: 24 }}>
            <View style={s.sigField}><View style={s.sigLine} /><Text style={s.sigLabel}>Signature</Text></View>
            <View style={s.sigField}><View style={s.sigLine} /><Text style={s.sigLabel}>Date</Text></View>
          </View>
          <View style={{ ...s.sigRow, marginTop: 16 }}>
            <View style={s.sigField}>
              {licNum ? <Text style={{ fontSize: 9, color: c.navy, marginBottom: 2 }}>{licNum}</Text> : null}
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>{engineer?.license_state || 'FL'} {engineer?.license_type || 'P.E.'} License No.</Text>
            </View>
            <View style={{ width: '45%' }} />
          </View>
        </View>

        {watermark && <WatermarkOverlay />}
        <PageFooter rasRef={rasRef} firmName={firmName} />
      </Page>
    </Document>
  );
};

// ──── Zone Diagram for PDF (View-based layout) ────

const zd = StyleSheet.create({
  label: { position: 'absolute', fontSize: 7, fontFamily: 'Helvetica-Bold' },
  labelMono: { position: 'absolute', fontSize: 6.5, fontFamily: 'Courier' },
  dimText: { position: 'absolute', fontSize: 7, fontFamily: 'Courier', color: '#334155', textAlign: 'center' },
  legendTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#e2e8f0', marginBottom: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  legendSwatch: { width: 8, height: 8, borderRadius: 1, marginRight: 4 },
  legendText: { fontSize: 6.5, fontFamily: 'Courier' },
});

const ZoneDiagramPdf = ({ length, width, zoneWidth, pressures, mdp, fastenerResults }: {
  length: number; width: number; zoneWidth: number; pressures: any; mdp: number;
  fastenerResults?: any[];
}) => {
  const containerH = 320;
  const ox = 50;
  const oy = 36;
  const bW = 430;
  const bH = containerH - oy - 30;

  const scX = bW / length;
  const scY = bH / width;

  const zwX = Math.min(zoneWidth, length / 2) * scX;
  const zwY = Math.min(zoneWidth, width / 2) * scY;
  const zw2X = Math.min(2 * zoneWidth, length / 2) * scX;
  const zw2Y = Math.min(2 * zoneWidth, width / 2) * scY;
  const zone1primeExists = (length > 4 * zoneWidth) && (width > 4 * zoneWidth);

  const zc = {
    '3': { bg: '#dc262624', border: '#dc2626', text: '#dc2626' },
    '2': { bg: '#d9770620', border: '#d97706', text: '#d97706' },
    '1': { bg: '#eab30818', border: '#a16207', text: '#a16207' },
    '1p': { bg: '#2563eb10', border: '#2563eb', text: '#2563eb' },
  };

  const zr = (l: number, t: number, w: number, h: number, clr: typeof zc['3'], dashed?: boolean) => (
    w > 0 && h > 0 ? (
      <View style={{
        position: 'absolute', left: l, top: t, width: w, height: h,
        backgroundColor: clr.bg, borderWidth: 0.5, borderColor: clr.border,
        ...(dashed ? { borderStyle: 'dashed' as const } : {}),
      }} />
    ) : null
  );

  return (
    <View style={{ width: '100%', height: containerH, position: 'relative', marginBottom: 8 }}>
      {/* Building outline */}
      <View style={{ position: 'absolute', left: ox, top: oy, width: bW, height: bH, borderWidth: 1.5, borderColor: '#2563eb' }} />

      {/* Zone 1' */}
      {zone1primeExists && zr(ox + zw2X, oy + zw2Y, bW - 2 * zw2X, bH - 2 * zw2Y, zc['1p'], true)}

      {/* Zone 1 strips */}
      {zr(ox + zwX, oy + zwY, bW - 2 * zwX, zw2Y - zwY, zc['1'])}
      {zr(ox + zwX, oy + bH - zw2Y, bW - 2 * zwX, zw2Y - zwY, zc['1'])}
      {zr(ox + zwX, oy + zw2Y, zw2X - zwX, bH - 2 * zw2Y, zc['1'])}
      {zr(ox + bW - zw2X, oy + zw2Y, zw2X - zwX, bH - 2 * zw2Y, zc['1'])}

      {/* Zone 2 strips */}
      {zr(ox + zwX, oy, bW - 2 * zwX, zwY, zc['2'])}
      {zr(ox + zwX, oy + bH - zwY, bW - 2 * zwX, zwY, zc['2'])}
      {zr(ox, oy + zwY, zwX, bH - 2 * zwY, zc['2'])}
      {zr(ox + bW - zwX, oy + zwY, zwX, bH - 2 * zwY, zc['2'])}

      {/* Zone 3 corners */}
      {zr(ox, oy, zwX, zwY, zc['3'])}
      {zr(ox + bW - zwX, oy, zwX, zwY, zc['3'])}
      {zr(ox, oy + bH - zwY, zwX, zwY, zc['3'])}
      {zr(ox + bW - zwX, oy + bH - zwY, zwX, zwY, zc['3'])}

      {/* Zone 3 corner labels */}
      <Text style={{ ...zd.label, left: ox + zwX / 2 - 4, top: oy + zwY / 2 - 4, color: zc['3'].text }}>3</Text>
      <Text style={{ ...zd.label, left: ox + bW - zwX / 2 - 4, top: oy + zwY / 2 - 4, color: zc['3'].text }}>3</Text>
      <Text style={{ ...zd.label, left: ox + zwX / 2 - 4, top: oy + bH - zwY / 2 - 4, color: zc['3'].text }}>3</Text>
      <Text style={{ ...zd.label, left: ox + bW - zwX / 2 - 4, top: oy + bH - zwY / 2 - 4, color: zc['3'].text }}>3</Text>

      {/* Zone 2 label */}
      <Text style={{ ...zd.label, left: ox + bW / 2 - 16, top: oy + zwY / 2 - 4, color: zc['2'].text }}>Zone 2</Text>
      {/* Zone 1 label */}
      <Text style={{ ...zd.label, left: ox + bW / 2 - 16, top: oy + zwY + (zw2Y - zwY) / 2 - 4, color: zc['1'].text }}>Zone 1</Text>
      {/* Zone 1' / interior */}
      {zone1primeExists ? (
        <Text style={{ ...zd.label, fontSize: 8, left: ox + bW / 2 - 20, top: oy + bH / 2 - 5, color: zc['1p'].text }}>1' (Field)</Text>
      ) : (
        <Text style={{ ...zd.label, fontSize: 6, left: ox + bW / 2 - 55, top: oy + bH / 2 - 4, color: zc['1'].text, fontStyle: 'italic' }}>No Zone 1' — entire interior is Zone 1</Text>
      )}

      {/* Dimension: 0.6h bracket */}
      <View style={{ position: 'absolute', left: ox, top: oy - 16, width: zwX, borderBottomWidth: 0.8, borderBottomColor: zc['2'].border }} />
      <View style={{ position: 'absolute', left: ox, top: oy - 20, width: 0.5, height: 8, backgroundColor: zc['2'].border }} />
      <View style={{ position: 'absolute', left: ox + zwX, top: oy - 20, width: 0.5, height: 8, backgroundColor: zc['2'].border }} />
      <Text style={{ ...zd.labelMono, left: ox, top: oy - 30, width: zwX, textAlign: 'center', color: zc['2'].text }}>{zoneWidth.toFixed(1)}' (0.6h)</Text>

      {/* Dimension: second 0.6h bracket */}
      <View style={{ position: 'absolute', left: ox + zwX, top: oy - 16, width: zw2X - zwX, borderBottomWidth: 0.8, borderBottomColor: zc['1'].border }} />
      <View style={{ position: 'absolute', left: ox + zw2X, top: oy - 20, width: 0.5, height: 8, backgroundColor: zc['1'].border }} />
      <Text style={{ ...zd.labelMono, left: ox + zwX, top: oy - 30, width: zw2X - zwX, textAlign: 'center', color: zc['1'].text }}>{zoneWidth.toFixed(1)}' (0.6h)</Text>

      {/* Building length dimension */}
      <View style={{ position: 'absolute', left: ox, bottom: 8, width: bW, borderBottomWidth: 0.5, borderBottomColor: '#64748b' }} />
      <Text style={{ ...zd.dimText, left: ox, bottom: 0, width: bW }}>{length}' Length</Text>

      {/* Building width dimension */}
      <View style={{ position: 'absolute', left: 18, top: oy, width: 0.5, height: bH, backgroundColor: '#64748b' }} />
      <Text style={{ ...zd.dimText, left: 2, top: oy + bH / 2 - 5, width: 30, fontSize: 6 }}>{width}' W</Text>

      {/* Pressure legend */}
      <View style={{ position: 'absolute', right: 8, top: 8, width: 150, backgroundColor: '#0f172a', borderRadius: 3, padding: 6, borderWidth: 0.5, borderColor: '#2563eb40' }}>
        <Text style={zd.legendTitle}>Pressure Legend (psf)</Text>
        {[
          { key: '3', label: `Zone 3: ${Math.abs(pressures.zone3).toFixed(1)} psf`, clr: zc['3'] },
          { key: '2', label: `Zone 2: ${Math.abs(pressures.zone2).toFixed(1)} psf`, clr: zc['2'] },
          { key: '1', label: `Zone 1: ${Math.abs(pressures.zone1).toFixed(1)} psf`, clr: zc['1'] },
          { key: '1p', label: `Zone 1': ${Math.abs(pressures.zone1prime).toFixed(1)} psf`, clr: zc['1p'] },
        ].map(item => (
          <View key={item.key} style={zd.legendRow}>
            <View style={{ ...zd.legendSwatch, backgroundColor: item.clr.bg, borderWidth: 0.5, borderColor: item.clr.border }} />
            <Text style={{ ...zd.legendText, color: item.clr.text }}>{item.label}</Text>
          </View>
        ))}
        <Text style={{ fontSize: 5.5, color: '#94a3b8', marginTop: 2, fontFamily: 'Helvetica' }}>
          h = {(zoneWidth / 0.6).toFixed(1)}' · zone width = 0.6h = {zoneWidth.toFixed(1)}'
        </Text>

        {fastenerResults && fastenerResults.length > 0 && (
          <View style={{ marginTop: 6, paddingTop: 4, borderTopWidth: 0.5, borderTopColor: '#2563eb40' }}>
            <Text style={{ ...zd.legendTitle, marginBottom: 2 }}>Fastener Spacing</Text>
            {fastenerResults.map((fr: any, i: number) => (
              <Text key={`fs_${i}`} style={{ fontSize: 6, fontFamily: 'Courier', color: '#94a3b8', marginBottom: 1 }}>
                Zone {fr.zone}: {fr.FS_used_in}" o.c. × {fr.n_rows} rows
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default FastenerCalcPdfReport;
