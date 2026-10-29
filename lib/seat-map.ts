export type SeatStatus = 'available' | 'occupied' | 'group_hold' | 'selected' | 'blocked';
export type SeatClass = 'first' | 'business' | 'economy_extra' | 'economy';

export interface AircraftSeat {
  id: string; // e.g. "12A"
  row: number;
  letter: string;
  cabin: SeatClass;
  status: SeatStatus;
  priceSAR: number;
  isExitRow?: boolean;
  hasPower?: boolean;
  hasExtraLegroom?: boolean;
}

export interface AircraftLayout {
  aircraftModel: string;
  totalSeats: number;
  availableSeatsCount: number;
  rows: {
    rowNumber: number;
    cabin: SeatClass;
    isExitRow?: boolean;
    seats: (AircraftSeat | null)[]; // null represents aisle gap
  }[];
}

export function generateAircraftSeatMap(aircraftModel: string, seedAvailability: number): AircraftLayout {
  const isA320OrA321 = aircraftModel.includes('A320') || aircraftModel.includes('A321') || aircraftModel.includes('737');
  
  if (isA320OrA321) {
    // 3-3 configuration (A B C - D E F)
    // Rows 1-3 Business (2-2 or 3-3 with blocked middle), Rows 4-32 Economy
    const rows: AircraftLayout['rows'] = [];
    let seatCounter = 0;
    let availableCount = 0;

    for (let r = 1; r <= 28; r++) {
      const isBusiness = r <= 3;
      const isExit = r === 11 || r === 12;
      const cabin: SeatClass = isBusiness ? 'business' : (isExit ? 'economy_extra' : 'economy');
      const letters = isBusiness ? ['A', 'C', 'D', 'F'] : ['A', 'B', 'C', 'D', 'E', 'F'];

      const rowSeats: (AircraftSeat | null)[] = [];

      letters.forEach((letter, idx) => {
        // Insert aisle
        if (isBusiness && idx === 2) rowSeats.push(null);
        if (!isBusiness && idx === 3) rowSeats.push(null);

        seatCounter++;
        // Determine status pseudo-randomly but deterministically
        const hash = (r * 13 + letter.charCodeAt(0) * 7) % 100;
        let status: SeatStatus = 'available';

        if (hash < 45) {
          status = 'occupied';
        } else if (hash < 65) {
          status = 'group_hold';
        } else {
          status = 'available';
          availableCount++;
        }

        rowSeats.push({
          id: `${r}${letter}`,
          row: r,
          letter,
          cabin,
          status,
          priceSAR: isBusiness ? 450 : (isExit ? 120 : (hash % 5 === 0 ? 40 : 0)),
          isExitRow: isExit,
          hasExtraLegroom: isExit || isBusiness,
          hasPower: true,
        });
      });

      rows.push({
        rowNumber: r,
        cabin,
        isExitRow: isExit,
        seats: rowSeats,
      });
    }

    return {
      aircraftModel,
      totalSeats: seatCounter,
      availableSeatsCount: availableCount,
      rows,
    };
  }

  // Widebody Boeing 777-300ER / A380: 3-4-3 or 2-4-2 config
  const rows: AircraftLayout['rows'] = [];
  let seatCounter = 0;
  let availableCount = 0;

  for (let r = 1; r <= 36; r++) {
    const isFirst = r <= 2;
    const isBusiness = r > 2 && r <= 8;
    const isExit = r === 18 || r === 28;
    const cabin: SeatClass = isFirst ? 'first' : (isBusiness ? 'business' : (isExit ? 'economy_extra' : 'economy'));

    const rowSeats: (AircraftSeat | null)[] = [];

    if (isFirst) {
      // 1-2-1
      const letters = ['A', 'E', 'F', 'K'];
      letters.forEach((letter, idx) => {
        if (idx === 1 || idx === 3) rowSeats.push(null);
        seatCounter++;
        const status: SeatStatus = (r + idx) % 2 === 0 ? 'occupied' : 'available';
        if (status === 'available') availableCount++;
        rowSeats.push({
          id: `${r}${letter}`,
          row: r,
          letter,
          cabin,
          status,
          priceSAR: 1200,
          hasExtraLegroom: true,
          hasPower: true,
        });
      });
    } else if (isBusiness) {
      // 2-3-2 (A B - D E F - J K)
      const letters = ['A', 'B', 'D', 'E', 'F', 'J', 'K'];
      letters.forEach((letter, idx) => {
        if (idx === 2 || idx === 5) rowSeats.push(null);
        seatCounter++;
        const status: SeatStatus = (r * 7 + idx) % 3 === 0 ? 'occupied' : 'available';
        if (status === 'available') availableCount++;
        rowSeats.push({
          id: `${r}${letter}`,
          row: r,
          letter,
          cabin,
          status,
          priceSAR: 600,
          hasExtraLegroom: true,
          hasPower: true,
        });
      });
    } else {
      // 3-4-3 Economy (A B C - D E F G - H J K)
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
      letters.forEach((letter, idx) => {
        if (idx === 3 || idx === 7) rowSeats.push(null);
        seatCounter++;
        const hash = (r * 19 + letter.charCodeAt(0) * 11) % 100;
        let status: SeatStatus = 'available';

        if (hash < 50) {
          status = 'occupied';
        } else if (hash < 72) {
          status = 'group_hold';
        } else {
          status = 'available';
          availableCount++;
        }

        rowSeats.push({
          id: `${r}${letter}`,
          row: r,
          letter,
          cabin,
          status,
          priceSAR: isExit ? 150 : (letter === 'A' || letter === 'K' ? 35 : 0),
          isExitRow: isExit,
          hasExtraLegroom: isExit,
          hasPower: true,
        });
      });
    }

    rows.push({
      rowNumber: r,
      cabin,
      isExitRow: isExit,
      seats: rowSeats,
    });
  }

  return {
    aircraftModel,
    totalSeats: seatCounter,
    availableSeatsCount: availableCount,
    rows,
  };
}
