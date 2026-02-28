import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { CalculationInputs, CalculationOutputs } from '@/lib/calculation-engine';
import type { EngineerProfile } from '@/lib/engineer-profile';
import WatermarkOverlay from './WatermarkOverlay';

// Use built-in PDF fonts to avoid external font loading issues
const FONT_SANS = 'Helvetica';
const FONT_MONO = 'Courier';

const colors = {
  navy: '#0f1724',
  navyLight: '#1a2332',
  blue: '#2563eb',
  blueLight: '#3b82f6',
  white: '#ffffff',
  gray: '#94a3b8',
  grayLight: '#cbd5e1',
  grayDark: '#475569',
  red: '#dc2626',
  green: '#16a34a',
  amber: '#ca8a04',
  border: '#334155',
};

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: FONT_SANS, fontSize: 9, color: colors.navy },
  // Cover
  coverPage: { padding: 0, backgroundColor: colors.navy },
  coverContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 60 },
  coverTitle: { fontSize: 32, fontWeight: 700, color: colors.white, marginBottom: 6 },
  coverSub: { fontSize: 14, color: colors.blueLight, marginBottom: 40 },
  coverLine: { width: 80, height: 3, backgroundColor: colors.blue, marginBottom: 40 },
  coverMeta: { alignItems: 'center' },
  coverMetaText: { fontSize: 10, color: colors.gray, marginBottom: 4 },
  coverDate: { fontSize: 11, color: colors.grayLight, marginTop: 8 },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: `1px solid ${colors.border}`, paddingBottom: 8, marginBottom: 16 },
  headerTitle: { fontSize: 10, fontWeight: 600, color: colors.blue },
  headerRight: { fontSize: 7, color: colors.grayDark },
  // Section
  sectionTitle: { fontSize: 12, fontWeight: 700, color: colors.navy, marginBottom: 8, marginTop: 16 },
  sectionSub: { fontSize: 10, fontWeight: 600, color: colors.navy, marginBottom: 6, marginTop: 10 },
  // Table
  tableHeader: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderBottom: `1px solid ${colors.border}`, paddingVertical: 4 },
  tableRow: { flexDirection: 'row', borderBottom: `0.5px solid #e2e8f0`, paddingVertical: 3 },
  tableRowAlt: { flexDirection: 'row', borderBottom: `0.5px solid #e2e8f0`, paddingVertical: 3, backgroundColor: '#f8fafc' },
  cell: { paddingHorizontal: 4, fontSize: 8, fontFamily: FONT_MONO },
  cellHeader: { paddingHorizontal: 4, fontSize: 7, fontWeight: 600, color: colors.grayDark },
  // Derivation
  derivation: { fontFamily: FONT_MONO, fontSize: 8, color: colors.grayDark, lineHeight: 1.8, marginBottom: 4 },
  derivationResult: { fontFamily: FONT_MONO, fontSize: 9, fontWeight: 600, color: colors.navy },
  // Cards
  paramGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  paramCard: { width: '23%', borderRadius: 4, border: `0.5px solid #e2e8f0`, padding: 6 },
  paramLabel: { fontSize: 7, color: colors.grayDark, marginBottom: 2 },
  paramValue: { fontSize: 10, fontWeight: 600, color: colors.navy, fontFamily: FONT_MONO },
  // Warning
  warningBox: { flexDirection: 'row', gap: 6, padding: 6, marginBottom: 4, borderRadius: 3, border: `0.5px solid ${colors.amber}`, backgroundColor: '#fffbeb' },
  warningText: { fontSize: 8, color: colors.grayDark, flex: 1 },
  // Signature
  sigBlock: { marginTop: 40, paddingTop: 16, borderTop: `1px solid ${colors.border}` },
  sigRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  sigField: { width: '45%' },
  sigLine: { borderBottom: `1px solid ${colors.navy}`, marginBottom: 4 },
  sigLabel: { fontSize: 8, color: colors.grayDark },
  // Footer
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: colors.gray },
  // Uplift
  uplift: { color: colors.red },
  compression: { color: colors.green },
  disclaimer: { fontSize: 7, color: colors.grayDark, marginTop: 16, lineHeight: 1.6 },
});

interface Props {
  inputs: CalculationInputs;
  outputs: CalculationOutputs;
  projectName?: string;
  preparedBy?: string;
  watermark?: boolean;
  engineer?: EngineerProfile | null;
}

const WindCalcPdfReport = ({ inputs, outputs, projectName = 'Untitled Project', preparedBy = '', watermark = false, engineer }: Props) => {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const firmName = engineer?.business_name || engineer?.company || '';
  const firmLine = [firmName, engineer?.business_address].filter(Boolean).join(' · ');
  const contactLine = [engineer?.business_phone, engineer?.business_email].filter(Boolean).join(' · ');
  const licenseLine = engineer?.pe_license ? `${engineer.license_state || 'FL'} ${engineer.license_type || 'PE'} #${engineer.pe_license}` : '';
  const authorName = preparedBy || engineer?.display_name || '';
  const docTitle = firmName ? `${firmName} — ${projectName}` : projectName;

  return (
    <Document title={docTitle} author={authorName || 'HVHZ Calc Pro'}>
      {/* Cover Page */}
      <Page size="LETTER" style={s.coverPage}>
        <View style={s.coverContent}>
          <Text style={s.coverTitle}>{firmName || 'Wind Uplift Calculation Report'}</Text>
          <Text style={s.coverSub}>ASCE 7-22 Chapter 28 Envelope Procedure</Text>
          <View style={s.coverLine} />
          <View style={s.coverMeta}>
            <Text style={{ fontSize: 16, color: colors.white, fontWeight: 600, marginBottom: 12 }}>{projectName}</Text>
            {authorName && <Text style={s.coverMetaText}>Prepared by: {authorName}</Text>}
            {licenseLine && <Text style={s.coverMetaText}>{licenseLine}</Text>}
            {firmLine && <Text style={s.coverMetaText}>{firmLine}</Text>}
            {contactLine && <Text style={s.coverMetaText}>{contactLine}</Text>}
            <Text style={s.coverMetaText}>Design Basis: {inputs.designBasis}</Text>
            <Text style={s.coverMetaText}>Risk Category: {inputs.riskCategory}</Text>
            <Text style={s.coverDate}>{now}</Text>
          </View>
        </View>
        <View style={{ ...s.footer, bottom: 30 }}>
          <Text style={{ color: colors.gray, fontSize: 7 }}>{firmName || 'HVHZ Calc Pro'} — For review by licensed PE</Text>
        </View>
        {watermark && <WatermarkOverlay />}
      </Page>

      {/* Calculation Pages */}
      <Page size="LETTER" style={s.page}>
        <View style={s.header}>
          <Text style={s.headerTitle}>{firmName || 'HVHZ Calc Pro'} — {projectName}</Text>
          <Text style={s.headerRight}>ASCE 7-22 Ch. 28 · {inputs.designBasis} · {now}</Text>
        </View>

        {/* Input Parameters */}
        <Text style={s.sectionTitle}>1. Input Parameters</Text>
        <Text style={s.sectionSub}>Site & Wind</Text>
        <View style={s.paramGrid}>
          <View style={s.paramCard}><Text style={s.paramLabel}>Wind Speed (V)</Text><Text style={s.paramValue}>{inputs.V} mph</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Exposure</Text><Text style={s.paramValue}>{inputs.exposureCategory}</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Risk Cat.</Text><Text style={s.paramValue}>{inputs.riskCategory}</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Enclosure</Text><Text style={s.paramValue}>{inputs.enclosureType}</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Kzt</Text><Text style={s.paramValue}>{inputs.Kzt}</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Kd</Text><Text style={s.paramValue}>{inputs.Kd}</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Ke</Text><Text style={s.paramValue}>{inputs.Ke}</Text></View>
        </View>

        <Text style={s.sectionSub}>Building Geometry</Text>
        <View style={s.paramGrid}>
          <View style={s.paramCard}><Text style={s.paramLabel}>Length</Text><Text style={s.paramValue}>{inputs.buildingLength} ft</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Width</Text><Text style={s.paramValue}>{inputs.buildingWidth} ft</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Mean Roof Ht (h)</Text><Text style={s.paramValue}>{inputs.h} ft</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Roof Type</Text><Text style={s.paramValue}>{inputs.roofType}</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Pitch (θ)</Text><Text style={s.paramValue}>{inputs.pitchDegrees}°</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Truss Spacing</Text><Text style={s.paramValue}>{inputs.trussSpacing} ft</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Dead Load</Text><Text style={s.paramValue}>{inputs.deadLoad} psf</Text></View>
          {inputs.hasOverhang && <View style={s.paramCard}><Text style={s.paramLabel}>Overhang</Text><Text style={s.paramValue}>{inputs.overhangWidth} ft</Text></View>}
        </View>

        {/* Derivation Chain */}
        <Text style={s.sectionTitle}>2. Velocity Pressure Derivation</Text>
        <Text style={s.derivation}>Kz = {outputs.Kz}  (Table 26.10-1, Exp. {inputs.exposureCategory}, h = {inputs.h} ft)</Text>
        <Text style={s.derivation}>qh = 0.00256 × Kz × Kzt × Kd × Ke × V²</Text>
        <Text style={s.derivation}>   = 0.00256 × {outputs.Kz} × {inputs.Kzt} × {inputs.Kd} × {inputs.Ke} × {inputs.V}²</Text>
        <Text style={s.derivationResult}>qh = {outputs.qh.toFixed(2)} psf</Text>

        <Text style={{ ...s.derivation, marginTop: 8 }}>Zone a = max(min(0.1·L_min, 0.4·h), max(0.04·L_min, 3 ft))</Text>
        <Text style={s.derivationResult}>a = {outputs.zone_a_ft} ft    2a = {outputs.zone_2a_width_ft} ft</Text>

        {/* Zone Pressures */}
        <Text style={s.sectionTitle}>3. Zone Pressures (GCpf − GCpi)</Text>
        <View style={s.tableHeader}>
          <Text style={{ ...s.cellHeader, width: '15%' }}>Zone</Text>
          <Text style={{ ...s.cellHeader, width: '25%' }}>GCpf</Text>
          <Text style={{ ...s.cellHeader, width: '25%' }}>GCpi</Text>
          <Text style={{ ...s.cellHeader, width: '35%' }}>p (psf)</Text>
        </View>
        {outputs.zone_results.map((z, i) => (
          <View key={z.zone} style={i % 2 ? s.tableRowAlt : s.tableRow}>
            <Text style={{ ...s.cell, width: '15%', fontWeight: 600, color: z.zone.includes('E') ? colors.amber : colors.blue }}>{z.zone}</Text>
            <Text style={{ ...s.cell, width: '25%' }}>{z.GCpf.toFixed(3)}</Text>
            <Text style={{ ...s.cell, width: '25%' }}>{z.GCpi.toFixed(2)}</Text>
            <Text style={{ ...s.cell, width: '35%', color: z.p_psf < 0 ? colors.red : colors.green }}>{z.p_psf.toFixed(2)}</Text>
          </View>
        ))}

        {/* Overhang */}
        {outputs.overhang && (
          <>
            <Text style={s.sectionTitle}>4. Overhang Breakdown</Text>
            <Text style={s.derivation}>p_top = qh × (GCpf_2E − GCpi) = {outputs.overhang.p_top_psf} psf</Text>
            <Text style={s.derivation}>p_soffit = −0.8 × qh = {outputs.overhang.p_soffit_psf} psf</Text>
            <Text style={s.derivationResult}>p_net = {outputs.overhang.p_net_psf} psf</Text>
            <Text style={{ ...s.derivation, marginTop: 4 }}>A_oh = {outputs.overhang.area_ft2} ft²   F_wind = {outputs.overhang.F_oh_wind_lb} lb   F_DL = {outputs.overhang.F_oh_DL_lb} lb</Text>
            <Text style={s.derivationResult}>Net OH = {outputs.overhang.net_OH_lb} lb</Text>
          </>
        )}

        {watermark && <WatermarkOverlay />}
        <View style={s.footer} fixed>
          <Text>HVHZ Calc Pro — ASCE 7-22 Ch. 28</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      {/* Span Results Page */}
      <Page size="LETTER" style={s.page}>
        <View style={s.header}>
          <Text style={s.headerTitle}>{firmName || 'HVHZ Calc Pro'} — {projectName}</Text>
          <Text style={s.headerRight}>Span Results · {inputs.designBasis} · {now}</Text>
        </View>

        <Text style={s.sectionTitle}>{outputs.overhang ? '5' : '4'}. Span Results — {inputs.designBasis}</Text>
        <Text style={{ fontSize: 8, color: colors.grayDark, marginBottom: 8 }}>
          {inputs.roofType.charAt(0).toUpperCase() + inputs.roofType.slice(1)} roof · θ = {inputs.pitchDegrees}° · Truss spacing = {inputs.trussSpacing} ft
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
            <Text style={{ ...s.cell, width: '10%', color: r.zone === '2E' ? colors.amber : colors.blue }}>{r.zone}</Text>
            <Text style={{ ...s.cell, width: '12%' }}>{r.trib_area_ft2.toFixed(1)}</Text>
            <Text style={{ ...s.cell, width: '12%', color: colors.red }}>{r.p_psf.toFixed(2)}</Text>
            <Text style={{ ...s.cell, width: '14%', color: colors.red }}>{r.main_wind_force_lb}</Text>
            {outputs.overhang && <Text style={{ ...s.cell, width: '12%', color: colors.red }}>{r.oh_wind_force_lb}</Text>}
            <Text style={{ ...s.cell, width: '14%', color: colors.green }}>{r.total_dl_lb}</Text>
            <Text style={{ ...s.cell, width: '16%', fontWeight: 600, color: r.net_uplift_lb < 0 ? colors.red : colors.green }}>{r.net_uplift_lb}</Text>
          </View>
        ))}

        {/* Summary */}
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
          <View style={{ ...s.paramCard, width: 'auto', paddingHorizontal: 12 }}>
            <Text style={s.paramLabel}>Max Uplift (Critical)</Text>
            <Text style={{ ...s.paramValue, color: colors.red }}>{outputs.max_net_uplift_lb} lb</Text>
          </View>
          <View style={{ ...s.paramCard, width: 'auto', paddingHorizontal: 12 }}>
            <Text style={s.paramLabel}>Min Uplift</Text>
            <Text style={{ ...s.paramValue, color: outputs.min_net_uplift_lb < 0 ? colors.red : colors.green }}>{outputs.min_net_uplift_lb} lb</Text>
          </View>
        </View>

        {/* Warnings */}
        {outputs.warnings.length > 0 && (
          <>
            <Text style={{ ...s.sectionTitle, marginTop: 20 }}>Warnings & Notes</Text>
            {outputs.warnings.map((w, i) => (
              <View key={i} style={s.warningBox}>
                <Text style={{ fontSize: 8, fontWeight: 600, color: w.level === 'error' ? colors.red : w.level === 'warning' ? colors.amber : colors.blue }}>
                  {w.level === 'error' ? '✖' : w.level === 'warning' ? '⚠' : 'ℹ'}
                </Text>
                <Text style={s.warningText}>{w.message}{w.reference ? ` [${w.reference}]` : ''}</Text>
              </View>
            ))}
          </>
        )}

        {/* Signature Block */}
        <View style={s.sigBlock}>
          <Text style={{ fontSize: 10, fontWeight: 600, color: colors.navy, marginBottom: 4 }}>Engineer Review & Approval</Text>
          <Text style={{ fontSize: 7, color: colors.grayDark, marginBottom: 16 }}>
            This report must be reviewed, verified, and sealed by the Engineer of Record prior to use for construction.
          </Text>
          <View style={s.sigRow}>
            <View style={s.sigField}>
              {authorName ? <Text style={{ fontSize: 9, color: colors.navy, marginBottom: 2 }}>{authorName}</Text> : null}
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>Engineer of Record — Signature & {engineer?.license_type || 'PE'} Stamp</Text>
            </View>
            <View style={s.sigField}>
              <View style={{ height: 24 }} />
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>Date</Text>
            </View>
          </View>
          <View style={{ ...s.sigRow, marginTop: 20 }}>
            <View style={s.sigField}>
              {authorName ? <Text style={{ fontSize: 9, color: colors.navy, marginBottom: 2 }}>{authorName}</Text> : <View style={{ height: 24 }} />}
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>Printed Name</Text>
            </View>
            <View style={s.sigField}>
              {licenseLine ? <Text style={{ fontSize: 9, color: colors.navy, marginBottom: 2 }}>{licenseLine}</Text> : <View style={{ height: 24 }} />}
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>License Number / State</Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <Text style={s.disclaimer}>
          {firmName
            ? `This report was prepared by ${firmName} using ASCE 7-22 Chapter 28 Envelope Procedure. All results must be reviewed and approved by a licensed Professional Engineer. The Engineer of Record assumes full responsibility for the adequacy and applicability of these calculations to the specific project conditions.`
            : `HVHZ Calc Pro provides calculations as a design aid based on ASCE 7-22 Chapter 28 Envelope Procedure. All results must be reviewed and approved by a licensed Professional Engineer. The Engineer of Record assumes full responsibility for the adequacy and applicability of these calculations to the specific project conditions.`
          }
        </Text>

        {watermark && <WatermarkOverlay />}
        <View style={s.footer} fixed>
          <Text>{firmName || 'HVHZ Calc Pro'} — ASCE 7-22 Ch. 28</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

export default WindCalcPdfReport;
