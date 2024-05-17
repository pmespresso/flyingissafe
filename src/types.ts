export interface ServerIncidentData {
  date: string
  type: string
  reg: string
  operator: string
  fat: number
  location: string
}

export interface UIIncidentData {
  type: string
  airline?: string
  aircraft?: string
  date: string
  fatalities: number
  location: string
  daysSinceLastIncident: number
}
