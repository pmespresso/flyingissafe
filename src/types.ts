export interface IncidentData {
  date: string
  type: string
  reg: string
  operator: string
  fat: number
  location: string
}

export interface AllData {
  airlineIncidents: IncidentData[];
  aircraftIncidents: IncidentData[];
  airlinesInTheJourney: string[];
  aircraftsInTheJourney: string[];
}
