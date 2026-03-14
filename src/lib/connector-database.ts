// src/lib/connector-database.ts
// Simpson Strong-Tie & MiTek HVHZ-approved roof-to-wall connectors
// Uplift values are ASD (lbs) per FL Product Approval / Miami-Dade NOA

export type WallType = 'wood_plate' | 'cmu' | 'concrete' | 'steel';
export type ConnectorFamily = 'simpson' | 'mitek';

export interface Connector {
  model: string;
  family: ConnectorFamily;
  upliftCapacity_lbs: number;
  lateralCapacity_lbs: number;
  fastenersPerEnd: number;
  approvedWallTypes: WallType[];
  flApprovalNumber: string;
  applicationNotes: string;
  embedDepth_in?: number;
}

export const CONNECTORS: Connector[] = [
  { model: 'H2.5A',   family: 'simpson', upliftCapacity_lbs: 1205, lateralCapacity_lbs: 580,  fastenersPerEnd: 3, approvedWallTypes: ['wood_plate'],             flApprovalNumber: 'FL17766', applicationNotes: 'Standard hip/truss to wood top plate. Most common HVHZ strap.' },
  { model: 'H10A',    family: 'simpson', upliftCapacity_lbs: 2015, lateralCapacity_lbs: 900,  fastenersPerEnd: 4, approvedWallTypes: ['wood_plate'],             flApprovalNumber: 'FL17766', applicationNotes: 'High-capacity truss to wood plate. Use where T_req > 1205 lbs.' },
  { model: 'MTS16',   family: 'simpson', upliftCapacity_lbs: 1480, lateralCapacity_lbs: 620,  fastenersPerEnd: 4, approvedWallTypes: ['wood_plate'],             flApprovalNumber: 'FL7259',  applicationNotes: 'Twist strap, wood plate. Good for retrofit/reroof access.' },
  { model: 'LSTA21',  family: 'simpson', upliftCapacity_lbs: 2135, lateralCapacity_lbs: 720,  fastenersPerEnd: 5, approvedWallTypes: ['wood_plate'],             flApprovalNumber: 'FL7259',  applicationNotes: 'Long strap over rafter. Used for ridge/hip members.' },
  { model: 'HETA20',  family: 'simpson', upliftCapacity_lbs: 3085, lateralCapacity_lbs: 1200, fastenersPerEnd: 6, approvedWallTypes: ['cmu', 'concrete'],        flApprovalNumber: 'FL11470', applicationNotes: 'CMU embed strap. Requires 2.5" min embedment per FBC R802.11.', embedDepth_in: 2.5 },
  { model: 'DETAL20', family: 'simpson', upliftCapacity_lbs: 4200, lateralCapacity_lbs: 1800, fastenersPerEnd: 8, approvedWallTypes: ['cmu', 'concrete'],        flApprovalNumber: 'FL17888', applicationNotes: 'Heavy CMU embed. For corner/hip girder high-demand connections.', embedDepth_in: 3.0 },
  { model: 'HHETA22', family: 'simpson', upliftCapacity_lbs: 3640, lateralCapacity_lbs: 1500, fastenersPerEnd: 6, approvedWallTypes: ['cmu', 'concrete'],        flApprovalNumber: 'FL11470', applicationNotes: 'Heavy hip rafter / girder truss to CMU. Corner zones.', embedDepth_in: 2.5 },
  { model: 'MP28',    family: 'mitek',   upliftCapacity_lbs: 1350, lateralCapacity_lbs: 600,  fastenersPerEnd: 4, approvedWallTypes: ['wood_plate'],             flApprovalNumber: 'FL8943',  applicationNotes: 'MiTek standard plate strap. Alternative to H2.5A.' },
  { model: 'MP34',    family: 'mitek',   upliftCapacity_lbs: 2200, lateralCapacity_lbs: 850,  fastenersPerEnd: 6, approvedWallTypes: ['wood_plate'],             flApprovalNumber: 'FL8943',  applicationNotes: 'MiTek high-capacity plate strap. Alternative to H10A.' },
  { model: 'MAS20',   family: 'mitek',   upliftCapacity_lbs: 2800, lateralCapacity_lbs: 1100, fastenersPerEnd: 5, approvedWallTypes: ['cmu', 'concrete'],        flApprovalNumber: 'FL9012',  applicationNotes: 'MiTek masonry embed strap. 2.5" min embedment.', embedDepth_in: 2.5 },
];

export function selectConnectors(
  T_req_lbs: number,
  wallType: WallType,
  family?: ConnectorFamily
): Connector[] {
  return CONNECTORS
    .filter(c =>
      c.upliftCapacity_lbs >= T_req_lbs &&
      c.approvedWallTypes.includes(wallType) &&
      (family ? c.family === family : true)
    )
    .sort((a, b) => a.upliftCapacity_lbs - b.upliftCapacity_lbs);
}
