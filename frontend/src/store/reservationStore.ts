import { create } from "zustand";

export interface Reservation {
  id: string;
  stationId?: number;
  stationName: string;
  amount: number;
  fuelType: string;
  timeSlot: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled" | "Expired";
  pickupCode?: string;
  expiryMinutes?: number;
  paymentMethod?: string;
  date: string;
  lat?: number;
  lng?: number;
}

const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: "1",
    stationId: 1,
    stationName: "TotalEnergies Bole",
    amount: 20,
    fuelType: "Benzene",
    timeSlot: "10:30 - 10:45",
    status: "Confirmed",
    pickupCode: "QF-1234",
    expiryMinutes: 15,
    date: "Today",
    lat: 8.9806,
    lng: 38.7578,
  },
  {
    id: "3",
    stationId: 2,
    stationName: "Oilibya CMC",
    amount: 30,
    fuelType: "Benzene",
    timeSlot: "09:00 - 09:15",
    status: "Pending",
    date: "Today",
    lat: 9.0182,
    lng: 38.8025,
  },
  {
    id: "4",
    stationId: 3,
    stationName: "NOC Megenagna",
    amount: 15,
    fuelType: "Diesel",
    timeSlot: "16:15 - 16:30",
    status: "Completed",
    paymentMethod: "Telebirr",
    date: "Yesterday",
  },
  {
    id: "5",
    stationId: 4,
    stationName: "TotalEnergies Piassa",
    amount: 10,
    fuelType: "Benzene",
    timeSlot: "08:00 - 08:15",
    status: "Expired",
    date: "Mar 10",
  },
  {
    id: "6",
    stationId: 5,
    stationName: "Yetebaberut Beherawi",
    amount: 25,
    fuelType: "Diesel",
    timeSlot: "14:30 - 14:45",
    status: "Cancelled",
    date: "Mar 09",
  },
  {
    id: "7",
    stationId: 6,
    stationName: "Oilibya Kera",
    amount: 40,
    fuelType: "Benzene",
    timeSlot: "11:15 - 11:30",
    status: "Completed",
    paymentMethod: "Chapa",
    date: "Mar 05",
  },
  {
    id: "8",
    stationId: 7,
    stationName: "NOC Mexico",
    amount: 12,
    fuelType: "Benzene",
    timeSlot: "18:45 - 19:00",
    status: "Completed",
    paymentMethod: "Telebirr",
    date: "Feb 28",
  }
];

interface ReservationState {
  reservations: Reservation[];
  addReservation: (reservation: Reservation) => void;
  updateReservationStatus: (id: string, status: Reservation["status"]) => void;
  checkExpirations: () => void;
}

export const useReservationStore = create<ReservationState>((set) => ({
  reservations: INITIAL_RESERVATIONS,
  addReservation: (reservation) =>
    set((state) => ({
      reservations: [reservation, ...state.reservations],
    })),
  updateReservationStatus: (id, status) =>
    set((state) => ({
      reservations: state.reservations.map((res) =>
        res.id === id ? { ...res, status } : res
      ),
    })),
  checkExpirations: () =>
    set((state) => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeInMinutes = currentHours * 60 + currentMinutes;

      let hasChanges = false;
      const updatedReservations = state.reservations.map((res) => {
        if ((res.status === "Confirmed" || res.status === "Pending") && res.date === "Today") {
          const parts = res.timeSlot.split(" - ");
          if (parts.length === 2) {
            const endTimeParts = parts[1].split(":");
            if (endTimeParts.length === 2) {
              const endHours = parseInt(endTimeParts[0], 10);
              const endMinutes = parseInt(endTimeParts[1], 10);
              const endTimeInMinutes = endHours * 60 + endMinutes;
              
              // Expire if current time is 15 minutes past the end time
              if (currentTimeInMinutes > endTimeInMinutes + 15) {
                hasChanges = true;
                return { ...res, status: "Expired" as const };
              }
            }
          }
        }
        return res;
      });

      return hasChanges ? { reservations: updatedReservations } : state;
    }),
}));
