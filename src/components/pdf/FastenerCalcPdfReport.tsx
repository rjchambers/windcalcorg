import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { FastenerInputs, FastenerOutputs, TAS105Outputs } from '@/lib/fastener-engine';

Font.register({
  family: 'IBM Plex Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-sans@latest/latin-400-normal.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-sans@latest/latin-600-normal.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-sans@latest/latin-700-normal.ttf', fontWeight: 700 },
  ],
});

Font.register({
  family: 'JetBrains Mono',
  src: 'https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.ttf',
});

const c = {
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
  page: { padding: 40, fontFamily: 'IBM Plex Sans', fontSize: 9, color: c.navy },
  coverPage: { padding: 0, backgroundColor: c.navy },
  coverContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 60 },
  coverTitle: { fontSize: 28, fontWeight: 700, color: c.white, marginBottom: 4 },
  coverSub: { fontSize: 13, color: c.blueLight, marginBottom: 6 },
  coverRef: { fontSize: 10, color: c.gray, marginBottom: 40 },
  coverLine: { width: 80, height: 3, backgroundColor: c.blue, marginBottom: 40 },
  coverMeta: { alignItems: 'center' },
  coverMetaText: { fontSize: 10, color: c.gray, marginBottom: 4 },
  coverDate: { fontSize: 11, color: c.grayLight, marginTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: `1px solid ${c.border}`, paddingBottom: 8, marginBottom: 16 },
  headerTitle: { fontSize: 10, fontWeight: 600, color: c.blue },
  headerRight: { fontSize: 7, color: c.grayDark },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: c.navy, marginBottom: 8, marginTop: 16 },
  sectionSub: { fontSize: 10, fontWeight: 600, color: c.navy, marginBottom: 6, marginTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderBottom: `1px solid ${c.border}`, paddingVertical: 4 },
  tableRow: { flexDirection: 'row', borderBottom: `0.5px solid #e2e8f0`, paddingVertical: 3 },
  tableRowAlt: { flexDirection: 'row', borderBottom: `0.5px solid #e2e8f0`, paddingVertical: 3, backgroundColor: '#f8fafc' },
  cell: { paddingHorizontal: 4, fontSize: 8, fontFamily: 'JetBrains Mono' },
  cellHeader: { paddingHorizontal: 4, fontSize: 7, fontWeight: 600, color: c.grayDark },
  derivation: { fontFamily: 'JetBrains Mono', fontSize: 8, color: c.grayDark, lineHeight: 1.8, marginBottom: 4 },
  derivationResult: { fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, color: c.navy },
  paramGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  paramCard: { width: '23%', borderRadius: 4, border: `0.5px solid #e2e8f0`, padding: 6 },
  paramLabel: { fontSize: 7, color: c.grayDark, marginBottom: 2 },
  paramValue: { fontSize: 10, fontWeight: 600, color: c.navy, fontFamily: 'JetBrains Mono' },
  warningBox: { flexDirection: 'row', gap: 6, padding: 6, marginBottom: 4, borderRadius: 3, border: `0.5px solid ${c.amber}`, backgroundColor: '#fffbeb' },
  warningText: { fontSize: 8, color: c.grayDark, flex: 1 },
  sigBlock: { marginTop: 40, paddingTop: 16, borderTop: `1px solid ${c.border}` },
  sigRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  sigField: { width: '45%' },
  sigLine: { borderBottom: `1px solid ${c.navy}`, marginBottom: 4 },
  sigLabel: { fontSize: 8, color: c.grayDark },
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: c.gray },
  disclaimer: { fontSize: 7, color: c.grayDark, marginTop: 16, lineHeight: 1.6 },
});

const SYSTEM_LABELS: Record<string, string> = {
  modified_bitumen: 'Modified Bitumen',
  single_ply: 'Single-Ply (TPO/EPDM/PVC)',
  adhered: 'Adhered System',
  tile: 'Tile (RAS 127)',
  shingle: 'Shingle',
  metal: 'Metal Panel',
};

interface Props {
  inputs: FastenerInputs;
  outputs: FastenerOutputs;
  tas105Outputs?: TAS105Outputs | null;
  projectName?: string;
  preparedBy?: string;
}

const FastenerCalcPdfReport = ({
  inputs,
  outputs,
  tas105Outputs,
  projectName = 'Untitled Project',
  preparedBy = '',
}: Props) => {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const rasRef = inputs.systemType === 'single_ply' ? 'RAS 137' : 'RAS 117';

  return (
    <Document title={`FastenerCalc HVHZ — ${projectName}`} author="FastenerCalc HVHZ">
      {/* ── Cover Page ── */}
      <Page size="LETTER" style={s.coverPage}>
        <View style={s.coverContent}>
          <Text style={s.coverTitle}>FastenerCalc HVHZ</Text>
          <Text style={s.coverSub}>Uniform Roofing Application — Fastener Pattern Report</Text>
          <Text style={s.coverRef}>FBC 8th Ed. · ASCE 7-22 Ch. 30 C&C · {rasRef} · TAS 105</Text>
          <View style={s.coverLine} />
          <View style={s.coverMeta}>
            <Text style={{ fontSize: 16, color: c.white, fontWeight: 600, marginBottom: 12 }}>{projectName}</Text>
            {preparedBy ? <Text style={s.coverMetaText}>Prepared by: {preparedBy}</Text> : null}
            <Text style={s.coverMetaText}>System: {SYSTEM_LABELS[inputs.systemType] ?? inputs.systemType}</Text>
            <Text style={s.coverMetaText}>Construction: {inputs.constructionType} · {inputs.county === 'miami_dade' ? 'Miami-Dade HVHZ' : inputs.county === 'broward' ? 'Broward HVHZ' : 'Non-HVHZ'}</Text>
            <Text style={s.coverDate}>{now}</Text>
          </View>
        </View>
        <View style={{ ...s.footer, bottom: 30 }}>
          <Text style={{ color: c.gray, fontSize: 7 }}>Generated by FastenerCalc HVHZ — For review by licensed PE</Text>
        </View>
      </Page>

      {/* ── Page 2: Inputs + Velocity Pressure ── */}
      <Page size="LETTER" style={s.page}>
        <View style={s.header}>
          <Text style={s.headerTitle}>FastenerCalc HVHZ — {projectName}</Text>
          <Text style={s.headerRight}>{rasRef} · {now}</Text>
        </View>

        <Text style={s.sectionTitle}>1. Input Parameters</Text>
        <Text style={s.sectionSub}>Site &amp; Wind</Text>
        <View style={s.paramGrid}>
          <View style={s.paramCard}><Text style={s.paramLabel}>Wind Speed (V)</Text><Text style={s.paramValue}>{inputs.V} mph</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Exposure</Text><Text style={s.paramValue}>{inputs.exposureCategory}</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Risk Cat.</Text><Text style={s.paramValue}>{inputs.riskCategory}</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Enclosure</Text><Text style={s.paramValue}>{inputs.enclosure}</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Kzt</Text><Text style={s.paramValue}>{inputs.Kzt}</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Kd</Text><Text style={s.paramValue}>{inputs.Kd}</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Ke</Text><Text style={s.paramValue}>{inputs.Ke}</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>h</Text><Text style={s.paramValue}>{inputs.h} ft</Text></View>
        </View>

        <Text style={s.sectionSub}>Building Geometry</Text>
        <View style={s.paramGrid}>
          <View style={s.paramCard}><Text style={s.paramLabel}>Length</Text><Text style={s.paramValue}>{inputs.buildingLength} ft</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Width</Text><Text style={s.paramValue}>{inputs.buildingWidth} ft</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Roof Type</Text><Text style={s.paramValue}>{inputs.roofType}</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Pitch</Text><Text style={s.paramValue}>{inputs.pitchDegrees}°</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Parapet</Text><Text style={s.paramValue}>{inputs.parapetHeight} ft</Text></View>
        </View>

        <Text style={s.sectionSub}>Roof System</Text>
        <View style={s.paramGrid}>
          <View style={s.paramCard}><Text style={s.paramLabel}>System</Text><Text style={s.paramValue}>{SYSTEM_LABELS[inputs.systemType] ?? inputs.systemType}</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Deck</Text><Text style={s.paramValue}>{inputs.deckType}</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Construction</Text><Text style={s.paramValue}>{inputs.constructionType}</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Sheet Width</Text><Text style={s.paramValue}>{inputs.sheetWidth_in}"</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Lap Width</Text><Text style={s.paramValue}>{inputs.lapWidth_in}"</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Fy</Text><Text style={s.paramValue}>{inputs.Fy_lbf} lbf</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>Fy Source</Text><Text style={s.paramValue}>{inputs.fySource === 'tas105' ? 'TAS 105' : 'NOA'}</Text></View>
          <View style={s.paramCard}><Text style={s.paramLabel}>NOA MDP</Text><Text style={s.paramValue}>{inputs.noaMDP_psf} psf</Text></View>
        </View>

        {/* ── Velocity Pressure Derivation ── */}
        <Text style={s.sectionTitle}>2. Velocity Pressure Derivation (ASD)</Text>
        <Text style={s.derivation}>Kh = {outputs.Kh}  (Table 26.10-1, Exp. {inputs.exposureCategory}, h = {inputs.h} ft)</Text>
        <Text style={s.derivation}>qh_ASD = 0.00256 × Kh × Kzt × Ke × V² × 0.6</Text>
        <Text style={s.derivation}>       = 0.00256 × {outputs.Kh} × {inputs.Kzt} × {inputs.Ke} × {inputs.V}² × 0.6</Text>
        <Text style={s.derivationResult}>qh_ASD = {outputs.qh_ASD.toFixed(2)} psf</Text>

        <Text style={{ ...s.derivation, marginTop: 8 }}>Zone width = {outputs.zonePressures.zoneWidth_ft} ft</Text>

        {/* ── Zone Pressures ── */}
        <Text style={s.sectionTitle}>3. Zone Pressures (C&C — GCp − GCpi)</Text>
        <View style={s.tableHeader}>
          <Text style={{ ...s.cellHeader, width: '15%' }}>Zone</Text>
          <Text style={{ ...s.cellHeader, width: '25%' }}>P (psf)</Text>
          <Text style={{ ...s.cellHeader, width: '25%' }}>MDP Check</Text>
          <Text style={{ ...s.cellHeader, width: '20%' }}>Extrap.</Text>
          <Text style={{ ...s.cellHeader, width: '15%' }}>Width (ft)</Text>
        </View>
        {outputs.fastenerResults.map((r, i) => (
          <View key={r.zone} style={i % 2 ? s.tableRowAlt : s.tableRow}>
            <Text style={{ ...s.cell, width: '15%', fontWeight: 600 }}>{r.zone === "1'" ? "1' (Field)" : `Zone ${r.zone}`}</Text>
            <Text style={{ ...s.cell, width: '25%', color: c.red }}>{r.P_psf.toFixed(1)}</Text>
            <Text style={{ ...s.cell, width: '25%', color: r.noaCheck === 'prescriptive' ? c.green : r.noaCheck === 'enhanced' ? c.amber : c.red }}>
              {r.noaCheck === 'prescriptive' ? 'OK ≤ MDP' : r.noaCheck === 'enhanced' ? 'Enhanced' : 'FAIL'}
            </Text>
            <Text style={{ ...s.cell, width: '20%' }}>{r.extrapolationFactor > 1 ? `${r.extrapolationFactor}×` : '—'}</Text>
            <Text style={{ ...s.cell, width: '15%' }}>{outputs.zonePressures.zoneWidth_ft}</Text>
          </View>
        ))}

        <View style={s.footer} fixed>
          <Text>FastenerCalc HVHZ — {rasRef}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      {/* ── Page 3: Fastener Pattern + Per-Zone Derivation ── */}
      <Page size="LETTER" style={s.page}>
        <View style={s.header}>
          <Text style={s.headerTitle}>FastenerCalc HVHZ — {projectName}</Text>
          <Text style={s.headerRight}>Fastener Patterns · {now}</Text>
        </View>

        <Text style={s.sectionTitle}>4. Fastener Pattern Results — {rasRef}</Text>
        <Text style={{ fontSize: 8, color: c.grayDark, marginBottom: 4 }}>
          Fy = {inputs.Fy_lbf} lbf ({inputs.fySource === 'tas105' ? 'TAS 105 MCRF' : 'NOA'}) · NW = {inputs.sheetWidth_in - inputs.lapWidth_in}" · Initial rows = {inputs.initialRows}
        </Text>

        <View style={s.tableHeader}>
          <Text style={{ ...s.cellHeader, width: '10%' }}>Zone</Text>
          <Text style={{ ...s.cellHeader, width: '12%' }}>P (psf)</Text>
          <Text style={{ ...s.cellHeader, width: '10%' }}>n Rows</Text>
          <Text style={{ ...s.cellHeader, width: '12%' }}>RS (in)</Text>
          <Text style={{ ...s.cellHeader, width: '12%' }}>FS Calc</Text>
          <Text style={{ ...s.cellHeader, width: '12%' }}>FS Used</Text>
          <Text style={{ ...s.cellHeader, width: '12%' }}>D/R</Text>
          <Text style={{ ...s.cellHeader, width: '10%' }}>A (ft²)</Text>
          <Text style={{ ...s.cellHeader, width: '10%' }}>½ Sheet</Text>
        </View>
        {outputs.fastenerResults.map((r, i) => (
          <View key={r.zone} style={i % 2 ? s.tableRowAlt : s.tableRow}>
            <Text style={{ ...s.cell, width: '10%', fontWeight: 600 }}>{r.zone}</Text>
            <Text style={{ ...s.cell, width: '12%', color: c.red }}>{r.P_psf.toFixed(1)}</Text>
            <Text style={{ ...s.cell, width: '10%' }}>{r.n_rows}</Text>
            <Text style={{ ...s.cell, width: '12%' }}>{r.RS_in}</Text>
            <Text style={{ ...s.cell, width: '12%' }}>{r.FS_calculated_in}"</Text>
            <Text style={{ ...s.cell, width: '12%', fontWeight: 600 }}>{r.FS_used_in}"</Text>
            <Text style={{ ...s.cell, width: '12%', color: r.demandRatio > 0.95 ? c.red : r.demandRatio > 0.75 ? c.amber : c.green }}>{(r.demandRatio * 100).toFixed(0)}%</Text>
            <Text style={{ ...s.cell, width: '10%' }}>{r.A_fastener_ft2}</Text>
            <Text style={{ ...s.cell, width: '10%' }}>{r.halfSheetRequired ? 'YES' : '—'}</Text>
          </View>
        ))}

        {/* Per-Zone Derivation Chain */}
        <Text style={s.sectionTitle}>5. Per-Zone Derivation Chain</Text>
        {outputs.fastenerResults.map(r => {
          const NW = inputs.sheetWidth_in - inputs.lapWidth_in;
          return (
            <View key={`deriv-${r.zone}`} style={{ marginBottom: 10 }}>
              <Text style={s.sectionSub}>Zone {r.zone}{r.zone === "1'" ? ' (Interior Field)' : ''}</Text>
              <Text style={s.derivation}>P = {r.P_psf.toFixed(1)} psf (C&C, ASD)</Text>
              <Text style={s.derivation}>NW = {inputs.sheetWidth_in}" − {inputs.lapWidth_in}" = {NW}"</Text>
              <Text style={s.derivation}>n = {r.n_rows} rows → RS = {r.halfSheetRequired ? `${NW / 2}" / (${r.n_rows} − 1)` : `${NW}" / (${r.n_rows} − 1)`} = {r.RS_in}"</Text>
              <Text style={s.derivation}>FS = (Fy × 144) / (P × RS) = ({inputs.Fy_lbf} × 144) / ({r.P_psf.toFixed(1)} × {r.RS_in}) = {r.FS_calculated_in}"</Text>
              <Text style={s.derivation}>FS used = {r.FS_used_in}" (rounded ½" down, min 4", max 12")</Text>
              <Text style={s.derivation}>A = ({r.FS_used_in} × {r.RS_in}) / 144 = {r.A_fastener_ft2} ft²</Text>
              <Text style={s.derivation}>F_demand = {r.P_psf.toFixed(1)} × {r.A_fastener_ft2} = {r.F_demand_lbf} lbf</Text>
              <Text style={s.derivationResult}>D/R = {r.F_demand_lbf} / {inputs.Fy_lbf} = {(r.demandRatio * 100).toFixed(0)}%{r.halfSheetRequired ? '  [HALF SHEET]' : ''}</Text>
            </View>
          );
        })}

        <View style={s.footer} fixed>
          <Text>FastenerCalc HVHZ — {rasRef}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      {/* ── Page 4: Insulation + Tile + TAS 105 + Warnings + Signature ── */}
      <Page size="LETTER" style={s.page}>
        <View style={s.header}>
          <Text style={s.headerTitle}>FastenerCalc HVHZ — {projectName}</Text>
          <Text style={s.headerRight}>Supplemental · {now}</Text>
        </View>

        {/* Insulation Board */}
        <Text style={s.sectionTitle}>6. Insulation Board Fasteners (RAS 117 §8)</Text>
        <Text style={{ fontSize: 8, color: c.grayDark, marginBottom: 6 }}>
          Board size: {inputs.boardLength_ft}' × {inputs.boardWidth_ft}' = {inputs.boardLength_ft * inputs.boardWidth_ft} ft² · Fy = {inputs.insulation_Fy_lbf || inputs.Fy_lbf} lbf
        </Text>
        <View style={s.tableHeader}>
          <Text style={{ ...s.cellHeader, width: '15%' }}>Zone</Text>
          <Text style={{ ...s.cellHeader, width: '20%' }}>P (psf)</Text>
          <Text style={{ ...s.cellHeader, width: '20%' }}>N Req'd</Text>
          <Text style={{ ...s.cellHeader, width: '20%' }}>N Used</Text>
          <Text style={{ ...s.cellHeader, width: '25%' }}>Layout</Text>
        </View>
        {outputs.insulationResults.map((r, i) => (
          <View key={r.zone} style={i % 2 ? s.tableRowAlt : s.tableRow}>
            <Text style={{ ...s.cell, width: '15%', fontWeight: 600 }}>{r.zone}</Text>
            <Text style={{ ...s.cell, width: '20%' }}>{r.P_psf}</Text>
            <Text style={{ ...s.cell, width: '20%' }}>{r.N_required}</Text>
            <Text style={{ ...s.cell, width: '20%', fontWeight: 600 }}>{r.N_used}</Text>
            <Text style={{ ...s.cell, width: '25%' }}>{r.layout}</Text>
          </View>
        ))}

        {/* Tile Results */}
        {outputs.tileResults && (
          <>
            <Text style={s.sectionTitle}>7. Tile Attachment (RAS 127 Method {inputs.tileMethod})</Text>
            {outputs.tileResults.map((tr, i) => (
              <View key={tr.zone} style={{ ...s.derivation, flexDirection: 'row', gap: 8, paddingVertical: 2 }}>
                <Text style={{ fontWeight: 600, width: 50 }}>Zone {tr.zone}:</Text>
                {tr.Mr_required !== undefined && <Text>Mr = {tr.Mr_required} ft-lbf | Mf = {tr.Mf_NOA} ft-lbf</Text>}
                {tr.Fr_required !== undefined && <Text>Fr = {tr.Fr_required} lbf | F' = {tr.Fprime_NOA} lbf</Text>}
                <Text style={{ color: tr.pass ? c.green : c.red, fontWeight: 600 }}>{tr.pass ? 'PASS' : 'FAIL'}</Text>
              </View>
            ))}
          </>
        )}

        {/* TAS 105 */}
        {tas105Outputs && (
          <>
            <Text style={s.sectionTitle}>{outputs.tileResults ? '8' : '7'}. TAS 105 Field Pull Test Results</Text>
            <View style={s.paramGrid}>
              <View style={s.paramCard}><Text style={s.paramLabel}>n samples</Text><Text style={s.paramValue}>{tas105Outputs.n}</Text></View>
              <View style={s.paramCard}><Text style={s.paramLabel}>Mean (X̄)</Text><Text style={s.paramValue}>{tas105Outputs.mean_lbf} lbf</Text></View>
              <View style={s.paramCard}><Text style={s.paramLabel}>Std Dev (σ)</Text><Text style={s.paramValue}>{tas105Outputs.stdDev_lbf} lbf</Text></View>
              <View style={s.paramCard}><Text style={s.paramLabel}>t-factor</Text><Text style={s.paramValue}>{tas105Outputs.tFactor}</Text></View>
            </View>
            <Text style={s.derivation}>MCRF = X̄ − t × σ = {tas105Outputs.mean_lbf} − {tas105Outputs.tFactor} × {tas105Outputs.stdDev_lbf}</Text>
            <Text style={{ ...s.derivationResult, color: tas105Outputs.pass ? c.green : c.red }}>
              MCRF = {tas105Outputs.MCRF_lbf} lbf — {tas105Outputs.pass ? 'PASS (≥ 275 lbf)' : 'FAIL (< 275 lbf)'}
            </Text>
          </>
        )}

        {/* Warnings */}
        {outputs.warnings.length > 0 && (
          <>
            <Text style={{ ...s.sectionTitle, marginTop: 20 }}>Warnings &amp; Compliance Notes</Text>
            {outputs.warnings.map((w, i) => (
              <View key={i} style={s.warningBox}>
                <Text style={{ fontSize: 8, fontWeight: 600, color: w.level === 'error' ? c.red : w.level === 'warning' ? c.amber : c.blue }}>
                  {w.level === 'error' ? '✖' : w.level === 'warning' ? '⚠' : 'ℹ'}
                </Text>
                <Text style={s.warningText}>{w.message}{w.reference ? ` [${w.reference}]` : ''}</Text>
              </View>
            ))}
          </>
        )}

        {/* Pattern Summary */}
        <Text style={{ ...s.sectionTitle, marginTop: 16 }}>Fastener Pattern Summary — Permit Ready</Text>
        {outputs.fastenerResults.map(r => (
          <Text key={r.zone} style={{ ...s.derivation, fontWeight: 600, color: c.navy }}>
            Zone {r.zone}: {r.FS_used_in}" o.c. at {inputs.lapWidth_in}" lap + {r.FS_used_in}" o.c. at {r.n_rows - 1} rows{r.halfSheetRequired ? ' [HALF SHEET]' : ''}
          </Text>
        ))}

        {/* Signature Block */}
        <View style={s.sigBlock}>
          <Text style={{ fontSize: 10, fontWeight: 600, color: c.navy, marginBottom: 4 }}>Engineer Review &amp; Approval</Text>
          <Text style={{ fontSize: 7, color: c.grayDark, marginBottom: 16 }}>
            This report must be reviewed, verified, and sealed by the Engineer of Record prior to use for construction.
          </Text>
          <View style={s.sigRow}>
            <View style={s.sigField}>
              <View style={{ height: 24 }} />
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>Engineer of Record — Signature &amp; PE Stamp</Text>
            </View>
            <View style={s.sigField}>
              <View style={{ height: 24 }} />
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>Date</Text>
            </View>
          </View>
          <View style={{ ...s.sigRow, marginTop: 20 }}>
            <View style={s.sigField}>
              <View style={{ height: 24 }} />
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>Printed Name</Text>
            </View>
            <View style={s.sigField}>
              <View style={{ height: 24 }} />
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>License Number / State</Text>
            </View>
          </View>
        </View>

        <Text style={s.disclaimer}>
          FastenerCalc HVHZ provides calculations as a design aid based on FBC 8th Edition (2023), ASCE 7-22 Chapter 30 C&C,
          and Florida Test Protocols (RAS 117, 127, 128, 137, TAS 105). All results must be reviewed and approved by a licensed
          Professional Engineer. The Engineer of Record assumes full responsibility for the adequacy and applicability of these
          calculations to the specific project conditions.
        </Text>

        <View style={s.footer} fixed>
          <Text>FastenerCalc HVHZ — {rasRef}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

export default FastenerCalcPdfReport;
