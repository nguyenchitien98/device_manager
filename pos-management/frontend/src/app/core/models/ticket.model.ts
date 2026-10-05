export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  merchantId?: string;
  terminalId?: string;
  deviceId?: string;
  issueType: 'HARDWARE' | 'SOFTWARE' | 'PAPER' | 'SIM' | 'REPLACEMENT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  description?: string;
  technicianId?: string;
  resolutionNotes?: string;
  handoverDocUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  merchantId?: string;
  terminalId?: string;
  deviceId?: string;
  issueType: string;
  priority?: string;
  description?: string;
}
