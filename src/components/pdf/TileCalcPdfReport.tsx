import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { TileInputs, TileOutputs } from '@/lib/tile-engine';
import type { EngineerProfile } from '@/lib/engineer-profile';
import WatermarkOverlay from './WatermarkOverlay';

const FONT_MONO = 'Courier';

const c = {
  navy: '#0f172a',
  slate: '#1e293b',
  blue: '#2563eb',
  white: '#ffffff',
  gray: '#94a3b8',
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
    <Text>{firmName || 'HVHZ Calc Pro'} · TileCalc — {projectName || ''} · RAS 127-20</Text>
  </View>
);

const PageHeader = ({ projectName, rightText, now, firmName, jobAddress }: {
  projectName: string; rightText: string; now: string; firmName?: string; jobAddress?: string;
}) => (
  <View style={s.header}>
    <View>
      <Text style={s.headerTitle}>{firmName || 'HVHZ Calc Pro'} · TileCalc — {projectName}</Text>
      {jobAddress ? <Text style={{ fontSize: 7, color: c.grayDark, marginTop: 1 }}>{jobAddress}</Text> : null}
    </View>
    <Text style={s.headerRight}>{rightText} · {now}</Text>
  </View>
);

interface Props {
  inputs: TileInputs;
  outputs: TileOutputs;
  projectName?: string;
  preparedBy?: string;
  jobAddress?: string;
  watermark?: boolean;
  engineer?: EngineerProfile | null;
}

const TileCalcPdfReport = ({
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
  const isMoment = inputs.method === 'moment';
  const methodLabel = isMoment ? 'Method 1 — Moment Based' : 'Method 3 — Uplift Based';

  return (
    <Document title={firmName ? `${firmName} — ${projectName}` : `TileCalc HVHZ — ${projectName}`} author={authorName || 'HVHZ Calc Pro'}>

      {/* ══════════════ COVER PAGE ══════════════ */}
      <Page size="LETTER" style={s.coverPage}>
        <View style={s.coverContent}>
          <Text style={{ fontSize: 10, color: c.gray, marginBottom: 8 }}>{firmName || 'HVHZ Calc Pro'}</Text>
          <Text style={s.coverTitle}>TILE ROOF ATTACHMENT CALCULATIONS</Text>
          <Text style={s.coverSub}>FBC 8th Edition (2023) · ASCE 7-22 · RAS 127-20 · {methodLabel}</Text>
          <View style={s.coverLine} />
          <View style={s.coverMeta}>
            <Text style={{ fontSize: 14, color: c.white, fontFamily: 'Helvetica-Bold', marginBottom: 12 }}>{projectName}</Text>
            {jobAddress ? <Text style={s.coverMetaText}>Address: {jobAddress}</Text> : null}
            <Text style={s.coverMetaText}>Roof Type: {inputs.roofType.charAt(0).toUpperCase() + inputs.roofType.slice(1)} · Slope: {inputs.pitchRise}:12 ({outputs.pitchDegrees}°)</Text>
            <Text style={s.coverMetaText}>County: {inputs.county} {inputs.isHVHZ ? '(HVHZ)' : ''}</Text>
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
          DISCLAIMER: {firmName ? `This report was prepared by ${firmName}` : 'TileCalc HVHZ provides calculations'} as a design aid based on the Florida Building Code 8th Edition (2023), ASCE 7-22, and RAS 127-20 (Concrete and Clay Roof Tile Installation). All results must be reviewed, verified, and approved by a licensed Professional Engineer. The Engineer of Record is solely responsible for verifying the applicability of all referenced standards to specific project conditions.
        </Text>
        {watermark && <WatermarkOverlay />}
      </Page>

      {/* ══════════════ PROJECT CRITERIA ══════════════ */}
      <Page size="LETTER" style={s.page}>
        <PageHeader projectName={projectName} rightText="Project Criteria" now={now} firmName={firmName} jobAddress={jobAddress} />

        <Text style={s.sectionHeader}>SITE INFORMATION</Text>
        <ParamRow label="Project Address:" value={jobAddress || '—'} />
        <ParamRow label="County:" value={`${inputs.county} ${inputs.isHVHZ ? '(HVHZ)' : ''}`} />
        <ParamRow label="Risk Category:" value={inputs.riskCategory} codeRef="Table 1.5-1" />

        <Text style={s.sectionHeader}>WIND PARAMETERS</Text>
        <ParamRow label="Basic Wind Speed:" value={`V = ${inputs.V} mph`} codeRef="Fig. 26.5-1" />
        <ParamRow label="Exposure Category:" value={inputs.exposureCategory} codeRef="§26.7.3" />
        {inputs.isHVHZ && <ParamRow label="HVHZ Requirement:" value="Exposure C min per FBC §1609.1.1" />}

        <Text style={s.sectionHeader}>ROOF GEOMETRY</Text>
        <ParamRow label="Roof Type:" value={inputs.roofType.charAt(0).toUpperCase() + inputs.roofType.slice(1)} />
        <ParamRow label="Roof Slope:" value={`${inputs.pitchRise}:12 (${outputs.pitchDegrees}°)`} />
        <ParamRow label="Slope Band:" value={outputs.slopeBand} codeRef="RAS 127" />
        <ParamRow label="Mean Roof Height (h):" value={`${inputs.h} ft`} codeRef="§26.2" />
        <ParamRow label="Overhang:" value={inputs.hasOverhang ? 'Yes' : 'No'} />

        <Text style={s.sectionHeader}>ATTACHMENT METHOD</Text>
        <ParamRow label="Method:" value={methodLabel} codeRef={`RAS 127 §${isMoment ? '2' : '3'}`} />
        {isMoment ? (
          <>
            <ParamRow label="Aerodynamic Multiplier (λ):" value={`${inputs.lambda} ft²`} codeRef="Product Approval" />
            <ParamRow label="Restoring Moment (Mg):" value={`${inputs.Mg_ftlb} ft-lb`} codeRef="Gravity" />
            <ParamRow label="Attachment Resistance (Mf):" value={`${inputs.Mf_ftlb} ft-lb`} codeRef="Product Approval" />
          </>
        ) : (
          <>
            <ParamRow label="Tile Length (l):" value={`${inputs.tile_length_ft} ft`} />
            <ParamRow label="Tile Width (w):" value={`${inputs.tile_width_ft} ft`} />
            <ParamRow label="Tile Weight (W):" value={`${inputs.tile_weight_lb} lb`} />
            <ParamRow label="Resistance (F'):" value={`${inputs.F_prime_lbf} lbf`} codeRef="Product Approval" />
          </>
        )}

        {inputs.useEngineeredPressures && (
          <>
            <Text style={s.sectionHeader}>ENGINEERED PRESSURES (PE-SEALED)</Text>
            <ParamRow label="Pasd(1) Field:" value={`${inputs.engineeredPasd1 ?? 0} psf`} />
            <ParamRow label="Pasd(2) Perimeter:" value={`${inputs.engineeredPasd2 ?? 0} psf`} />
            <ParamRow label="Pasd(3) Corner:" value={`${inputs.engineeredPasd3 ?? 0} psf`} />
          </>
        )}

        <PageFooter firmName={firmName} projectName={projectName} />
      </Page>

      {/* ══════════════ ZONE PRESSURES & RESULTS ══════════════ */}
      <Page size="LETTER" style={s.page}>
        <PageHeader projectName={projectName} rightText="Zone Pressures & Results" now={now} firmName={firmName} jobAddress={jobAddress} />

        <Text style={s.sectionHeader}>DESIGN WIND PRESSURES — RAS 127-20</Text>
        <Text style={{ fontSize: 8, color: c.grayDark, marginBottom: 6, marginLeft: 8 }}>
          Source: {outputs.zonePressures.tableSource}
        </Text>

        <View style={s.tableHeader}>
          <Text style={{ ...s.cellHeader, width: '25%' }}>Zone</Text>
          <Text style={{ ...s.cellHeader, width: '25%' }}>Pasd (psf)</Text>
          <Text style={{ ...s.cellHeader, width: '50%' }}>Source</Text>
        </View>
        {[
          { label: 'Field (1)', p: outputs.zonePressures.Pasd1 },
          { label: 'Perimeter (2)', p: outputs.zonePressures.Pasd2 },
          { label: 'Corner (3)', p: outputs.zonePressures.Pasd3 },
        ].map((z, i) => (
          <View key={z.label} style={i % 2 ? s.tableRowAlt : s.tableRow}>
            <Text style={{ ...s.cell, width: '25%', fontFamily: 'Helvetica-Bold' }}>{z.label}</Text>
            <Text style={{ ...s.cell, width: '25%', color: c.red }}>{z.p} psf</Text>
            <Text style={{ ...s.cell, width: '50%', fontSize: 7 }}>{outputs.zonePressures.tableSource}</Text>
          </View>
        ))}

        <Text style={s.sectionHeader}>
          {isMoment ? 'MOMENT CHECK — METHOD 1 (RAS 127 §2)' : 'UPLIFT CHECK — METHOD 3 (RAS 127 §3)'}
        </Text>

        {isMoment ? (
          <>
            <Text style={s.calcLine}>Mr = Pasd × λ − Mg                                        [RAS 127 §2.5]</Text>
            <Text style={s.calcLine}>Check: Mf ≥ Mr → PASS; Mf {'<'} Mr → FAIL</Text>

            <View style={{ ...s.tableHeader, marginTop: 8 }}>
              <Text style={{ ...s.cellHeader, width: '18%' }}>Zone</Text>
              <Text style={{ ...s.cellHeader, width: '18%' }}>Pasd</Text>
              <Text style={{ ...s.cellHeader, width: '18%' }}>Mr (ft-lb)</Text>
              <Text style={{ ...s.cellHeader, width: '18%' }}>Mf (ft-lb)</Text>
              <Text style={{ ...s.cellHeader, width: '14%' }}>Ratio</Text>
              <Text style={{ ...s.cellHeader, width: '14%' }}>Status</Text>
            </View>
            {outputs.momentResults?.map((r, i) => (
              <View key={r.zone} style={i % 2 ? s.tableRowAlt : s.tableRow}>
                <Text style={{ ...s.cell, width: '18%', fontFamily: 'Helvetica-Bold' }}>{r.zone}</Text>
                <Text style={{ ...s.cell, width: '18%', color: c.red }}>{r.Pasd}</Text>
                <Text style={{ ...s.cell, width: '18%', color: c.red }}>{r.Mr_ftlb}</Text>
                <Text style={{ ...s.cell, width: '18%', color: c.green }}>{r.Mf_ftlb}</Text>
                <Text style={{ ...s.cell, width: '14%' }}>{r.demandRatio}</Text>
                <Text style={{ ...s.cell, width: '14%', fontFamily: 'Helvetica-Bold', color: r.passes ? c.green : c.red }}>
                  {r.passes ? 'PASS' : 'FAIL'}
                </Text>
              </View>
            ))}

            {/* Derivation */}
            <Text style={s.sectionHeader}>DERIVATION — MOMENT METHOD</Text>
            {outputs.momentResults?.map(r => (
              <View key={r.zone} style={{ marginBottom: 4 }}>
                <Text style={s.sectionSub}>{r.zone}</Text>
                <Text style={s.calcLine}>Mr = |{r.Pasd}| × {inputs.lambda} − {inputs.Mg_ftlb}</Text>
                <Text style={s.calcLine}>   = {Math.abs(r.Pasd)} × {inputs.lambda} − {inputs.Mg_ftlb}</Text>
                <Text style={s.resultLine}>Mr = {r.Mr_ftlb} ft-lb</Text>
                <Text style={s.calcLine}>Mf = {r.Mf_ftlb} ft-lb (from Product Approval)</Text>
                <Text style={{ ...s.resultLine, color: r.passes ? c.green : c.red }}>
                  {r.passes ? `PASS — Mf (${r.Mf_ftlb}) ≥ Mr (${r.Mr_ftlb})` : `FAIL — Mf (${r.Mf_ftlb}) < Mr (${r.Mr_ftlb})`}
                </Text>
              </View>
            ))}
          </>
        ) : (
          <>
            <Text style={s.calcLine}>Fr = [(|Pasd| × l × w) − W] × cos θ                      [RAS 127 §3.4]</Text>
            <Text style={s.calcLine}>{"Check: F' ≥ Fr → PASS; F' < Fr → FAIL"}</Text>

            <View style={{ ...s.tableHeader, marginTop: 8 }}>
              <Text style={{ ...s.cellHeader, width: '18%' }}>Zone</Text>
              <Text style={{ ...s.cellHeader, width: '18%' }}>Pasd</Text>
              <Text style={{ ...s.cellHeader, width: '18%' }}>Fr (lbf)</Text>
              <Text style={{ ...s.cellHeader, width: '18%' }}>F' (lbf)</Text>
              <Text style={{ ...s.cellHeader, width: '14%' }}>Ratio</Text>
              <Text style={{ ...s.cellHeader, width: '14%' }}>Status</Text>
            </View>
            {outputs.upliftResults?.map((r, i) => (
              <View key={r.zone} style={i % 2 ? s.tableRowAlt : s.tableRow}>
                <Text style={{ ...s.cell, width: '18%', fontFamily: 'Helvetica-Bold' }}>{r.zone}</Text>
                <Text style={{ ...s.cell, width: '18%', color: c.red }}>{r.Pasd}</Text>
                <Text style={{ ...s.cell, width: '18%', color: c.red }}>{r.Fr_lbf}</Text>
                <Text style={{ ...s.cell, width: '18%', color: c.green }}>{r.F_prime_lbf}</Text>
                <Text style={{ ...s.cell, width: '14%' }}>{r.demandRatio}</Text>
                <Text style={{ ...s.cell, width: '14%', fontFamily: 'Helvetica-Bold', color: r.passes ? c.green : c.red }}>
                  {r.passes ? 'PASS' : 'FAIL'}
                </Text>
              </View>
            ))}

            {/* Derivation */}
            <Text style={s.sectionHeader}>DERIVATION — UPLIFT METHOD</Text>
            <Text style={s.calcLine}>θ = {outputs.pitchDegrees}° → cos θ = {Math.cos(outputs.pitchDegrees * Math.PI / 180).toFixed(4)}</Text>
            {outputs.upliftResults?.map(r => (
              <View key={r.zone} style={{ marginBottom: 4 }}>
                <Text style={s.sectionSub}>{r.zone}</Text>
                <Text style={s.calcLine}>Fr = [(|{r.Pasd}| × {inputs.tile_length_ft} × {inputs.tile_width_ft}) − {inputs.tile_weight_lb}] × cos({outputs.pitchDegrees}°)</Text>
                <Text style={s.resultLine}>Fr = {r.Fr_lbf} lbf</Text>
                <Text style={s.calcLine}>{"F' = "}{r.F_prime_lbf} lbf (from Product Approval)</Text>
                <Text style={{ ...s.resultLine, color: r.passes ? c.green : c.red }}>
                  {r.passes ? `PASS — F' (${r.F_prime_lbf}) ≥ Fr (${r.Fr_lbf})` : `FAIL — F' (${r.F_prime_lbf}) < Fr (${r.Fr_lbf})`}
                </Text>
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
        <View style={{ padding: 12, marginBottom: 8, backgroundColor: outputs.overallPasses ? '#f0fdf4' : '#fef2f2', border: `1pt solid ${outputs.overallPasses ? '#bbf7d0' : '#fecaca'}`, borderRadius: 3 }}>
          <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: outputs.overallPasses ? c.green : c.red, textAlign: 'center' }}>
            {outputs.overallPasses ? '✓ ALL ZONES PASS' : '✗ ATTACHMENT FAILS'}
          </Text>
          <Text style={{ fontSize: 9, color: c.grayDark, textAlign: 'center', marginTop: 4 }}>
            Critical Zone: {outputs.criticalZone} · Demand Ratio: {outputs.criticalDemandRatio}
          </Text>
        </View>

        <Text style={s.sectionHeader}>ATTACHMENT SUMMARY</Text>
        <ParamRow label="Method:" value={methodLabel} />
        <ParamRow label="Roof Type:" value={`${inputs.roofType.charAt(0).toUpperCase() + inputs.roofType.slice(1)} · ${inputs.pitchRise}:12`} />
        <ParamRow label="Wind Speed:" value={`${inputs.V} mph · Exp ${inputs.exposureCategory}`} />
        <ParamRow label="Mean Roof Height:" value={`${inputs.h} ft`} />
        <ParamRow label="Overall:" value={outputs.overallPasses ? 'PASS' : 'FAIL'} />
        {outputs.requiresPESeal && <ParamRow label="PE Seal:" value="REQUIRED — Non-standard parameters" />}

        {/* Warnings */}
        {outputs.warnings.length > 0 && (
          <>
            <Text style={s.sectionHeader}>WARNINGS & COMPLIANCE NOTES</Text>
            {outputs.warnings.map((w, i) => (
              <View key={i} style={s.warningBox}>
                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: w.level === 'error' ? c.red : w.level === 'warning' ? c.amber : c.blue }}>
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

        {/* Signature Block */}
        <View style={s.sigBlock}>
          <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: c.navy, marginBottom: 8 }}>CERTIFICATION</Text>
          <Text style={s.disclaimer}>
            I hereby certify that these calculations were prepared by me or under my direct supervision and that they comply with the applicable provisions of the Florida Building Code 8th Edition (2023), ASCE 7-22, and RAS 127-20.
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

export default TileCalcPdfReport;
