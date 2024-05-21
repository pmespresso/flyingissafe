export interface IncidentData {
  date: string
  type: string
  reg: string
  operator: string
  fat: number
  location: string
}

export interface FlightLeg {
  airline: string;
  aircraft: string;
}

export interface AllData {
  airlineIncidents: IncidentData[];
  aircraftIncidents: IncidentData[];
  journeyDetails: FlightLeg[];
  riskScore: number | null;
  riskLevel: string | null;
}