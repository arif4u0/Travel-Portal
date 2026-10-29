// Utility for deterministic or event-based ID generation

let counter = 1000;

export function generateNextId(prefix: string = 'REF'): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

export function generatePnrCode(airlineCode: string): string {
  counter += 1;
  return `${airlineCode}-GRP-${counter}`;
}

export function generateTicketNumber(airlineCode: string): string {
  counter += 1;
  const prefix = airlineCode === 'SV' ? '065' : '176';
  return `${prefix}-49${counter}8192`;
}
