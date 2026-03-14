// src/lib/strap-engine.ts
// FBC 8th Edition (2023) Roof-to-Wall Connection Uplift Calculator
// References: FBC §R802.11, ASCE 7-22 §2.4 (ASD load combinations), FBC §1604.8

import { selectConnectors, type WallType, type Connector } from './connector-database';

export interface StrapInputs {
  zone1_netUplift_lbs: number;
  zone2E_netUplift_lbs: number;
  zone3E_netUplift_lbs: number;
  trussSpacing_ft: number;
  deadLoad_psf: number;
  designBasis: 'ASD' | 'LRFD';
  wallType: WallType;
  strapsPerTruss: 1 | 2;
  hipGirderPresent: boolean;
  hipGirderUplift_lbs?: number;
  isHVHZ: boolean;
  county: 'miami_dade' | 'broward' | 'other';
}

export interface StrapZoneResult {
  zone: string;
  T_required_lbs: number;
  T_total_lbs: number;
  codeMinimum_lbs: number;
  governingValue_lbs: number;
  selectedConnector: Connector | null;
  alternateConnectors: Connector[];
  pass: boolean;
  fastenersRequired: number;
  studToPlateRequired: boolean;
}

export interface StrapOutputs {
  zoneResults: StrapZoneResult[];
  hipGirderResult: StrapZoneResult | null;
  warnings: StrapWarning[];
  connectorSchedule: ConnectorScheduleRow[];
  overallStatus: 'ok' | 'warning' | 'fail';
}

export interface StrapWarning {
  level: 'error' | 'warning' | 'info';
  message: string;
  reference?: string;
}

export interface ConnectorScheduleRow {
  location: string;
  quantity: string;
  connectorModel: string;
  upliftCapacity_lbs: number;
  fastenersPerEnd: number;
  flApproval: string;
  notes: string;
}

const FBC_MINIMUM_UPLIFT_LBS = 500;
const FBC_FASTENERS_PER_END_MIN = 4;

export function calculateStrap(inputs: StrapInputs): StrapOutputs {
  const warnings: StrapWarning[] = [];

  if (inputs.isHVHZ) {
    warnings.push({
      level: 'info',
      message: `HVHZ: ${inputs.county === 'miami_dade' ? 'Miami-Dade (V=175 mph)' : 'Broward (V=170 mph)'} — Exposure C mandatory per FBC §1620.`,
      reference: 'FBC §1620'
    });
  }

  warnings.push({
    level: 'info',
    message: 'FBC §R802.11 requires minimum 500-lb uplift capacity with ≥4 fasteners per strap end regardless of calculated demand.',
    reference: 'FBC §R802.11'
  });

  if (inputs.wallType === 'cmu' || inputs.wallType === 'concrete') {
    warnings.push({
      level: 'info',
      message: 'Masonry/concrete walls: strap screws must provide minimum 2½" embedment per FBC §R802.11.',
      reference: 'FBC §R802.11'
    });
  }

  const zoneData: { zone: string; T_total: number }[] = [
    { zone: 'Zone 1 (Field)',    T_total: Math.abs(inputs.zone1_netUplift_lbs) },
    { zone: 'Zone 2E (Edge)',    T_total: Math.abs(inputs.zone2E_netUplift_lbs) },
    { zone: 'Zone 3E (Corner)',  T_total: Math.abs(inputs.zone3E_netUplift_lbs) },
  ];

  const zoneResults: StrapZoneResult[] = zoneData.map(({ zone, T_total }) => {
    const T_per_strap = Math.ceil(T_total / inputs.strapsPerTruss);
    const governing = Math.max(T_per_strap, FBC_MINIMUM_UPLIFT_LBS);
    const candidates = selectConnectors(governing, inputs.wallType);
    const selected = candidates[0] ?? null;
    const alternates = candidates.slice(1, 4);

    if (!selected) {
      warnings.push({
        level: 'error',
        message: `${zone}: No connector in database meets T_req = ${governing} lbs for ${inputs.wallType}. Specify custom connector with PE approval.`,
        reference: 'FBC §R802.11'
      });
    }

    if (selected && selected.fastenersPerEnd < FBC_FASTENERS_PER_END_MIN) {
      warnings.push({
        level: 'warning',
        message: `${zone}: Selected connector ${selected.model} has ${selected.fastenersPerEnd} fasteners/end — below FBC §R802.11 minimum of 4. Use alternate.`,
        reference: 'FBC §R802.11'
      });
    }

    return {
      zone,
      T_required_lbs: T_per_strap,
      T_total_lbs: T_total,
      codeMinimum_lbs: FBC_MINIMUM_UPLIFT_LBS,
      governingValue_lbs: governing,
      selectedConnector: selected,
      alternateConnectors: alternates,
      pass: selected !== null && selected.upliftCapacity_lbs >= governing,
      fastenersRequired: selected?.fastenersPerEnd ?? 0,
      studToPlateRequired: T_total > FBC_MINIMUM_UPLIFT_LBS,
    };
  });

  let hipGirderResult: StrapZoneResult | null = null;
  if (inputs.hipGirderPresent) {
    const T_hip = inputs.hipGirderUplift_lbs ?? Math.abs(inputs.zone3E_netUplift_lbs) * 2;
    const governing = Math.max(T_hip, FBC_MINIMUM_UPLIFT_LBS);
    const candidates = selectConnectors(governing, inputs.wallType);
    const selected = candidates[0] ?? null;
    if (!selected) {
      warnings.push({
        level: 'error',
        message: `Hip Girder: No connector meets T_req = ${governing} lbs. Engineer must specify custom connection.`,
        reference: 'FBC §R802.11'
      });
    }
    hipGirderResult = {
      zone: 'Hip Girder',
      T_required_lbs: T_hip,
      T_total_lbs: T_hip,
      codeMinimum_lbs: FBC_MINIMUM_UPLIFT_LBS,
      governingValue_lbs: governing,
      selectedConnector: selected,
      alternateConnectors: candidates.slice(1, 3),
      pass: selected !== null,
      fastenersRequired: selected?.fastenersPerEnd ?? 0,
      studToPlateRequired: T_hip > FBC_MINIMUM_UPLIFT_LBS,
    };
  }

  const connectorSchedule: ConnectorScheduleRow[] = zoneResults.map(r => ({
    location: r.zone,
    quantity: `1 per truss × ${inputs.strapsPerTruss} strap(s)`,
    connectorModel: r.selectedConnector?.model ?? 'SPECIFY',
    upliftCapacity_lbs: r.selectedConnector?.upliftCapacity_lbs ?? 0,
    fastenersPerEnd: r.selectedConnector?.fastenersPerEnd ?? 0,
    flApproval: r.selectedConnector?.flApprovalNumber ?? '—',
    notes: r.selectedConnector?.applicationNotes ?? 'No connector found — engineer must specify',
  }));

  if (hipGirderResult) {
    connectorSchedule.push({
      location: 'Hip Girder',
      quantity: '1 per hip girder end',
      connectorModel: hipGirderResult.selectedConnector?.model ?? 'SPECIFY',
      upliftCapacity_lbs: hipGirderResult.selectedConnector?.upliftCapacity_lbs ?? 0,
      fastenersPerEnd: hipGirderResult.selectedConnector?.fastenersPerEnd ?? 0,
      flApproval: hipGirderResult.selectedConnector?.flApprovalNumber ?? '—',
      notes: hipGirderResult.selectedConnector?.applicationNotes ?? 'No connector found',
    });
  }

  const hasErrors = warnings.some(w => w.level === 'error');
  const hasWarns = warnings.some(w => w.level === 'warning');

  return {
    zoneResults,
    hipGirderResult,
    warnings,
    connectorSchedule,
    overallStatus: hasErrors ? 'fail' : hasWarns ? 'warning' : 'ok',
  };
}
