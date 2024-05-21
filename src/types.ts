export interface IncidentData {
  date: string;
  dmg: string;
  fat: number;
  location: string;
  operator: string;
  reg: string;
  type: string;
}

export interface FlightLeg {
  aircraft: string;
  airline: string;
  aircraftIncidents: IncidentData[];
  airlineIncidents: IncidentData[];
}

export interface AllData {
  journeyDetails: FlightLeg[];
  riskScore: number | null;
  riskLevel: string | null;
}