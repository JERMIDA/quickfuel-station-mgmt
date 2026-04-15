export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  capacity: number;
  reservedCount: number;
  status: "Available" | "Limited" | "Full";
}

export function generateTimeSlots(
  openingTime: string,
  closingTime: string,
  pumpsCount: number,
  slotDurationMinutes: number = 15,
  vehiclesPerPumpPerSlot: number = 2,
  reservedCounts: Record<string, number> = {}
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const capacity = pumpsCount * vehiclesPerPumpPerSlot;

  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return new Date(2000, 0, 1, hours, minutes);
  };

  const formatTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  let current = parseTime(openingTime);
  const end = parseTime(closingTime);

  while (current < end) {
    const slotEnd = new Date(current.getTime() + slotDurationMinutes * 60000);
    if (slotEnd > end) break;

    const startStr = formatTime(current);
    const endStr = formatTime(slotEnd);
    const id = `${startStr} - ${endStr}`;
    
    const reservedCount = reservedCounts[id] || 0;
    let status: "Available" | "Limited" | "Full" = "Available";
    if (reservedCount >= capacity) {
      status = "Full";
    } else if (reservedCount >= capacity * 0.8) {
      status = "Limited";
    }

    slots.push({
      id,
      start: startStr,
      end: endStr,
      capacity,
      reservedCount,
      status,
    });

    current = slotEnd;
  }

  return slots;
}
