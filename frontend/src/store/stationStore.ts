import { create } from "zustand";

export type StationStatus = "Verified" | "Pending" | "Rejected";
export type OperationalStatus = "Open" | "Closed" | "Under Maintenance";

export interface Station {
  id: number;
  name: string;
  location: string;
  operator: string;
  contactPerson: string;
  phoneNumber: string;
  status: StationStatus;
  operationalStatus: OperationalStatus;
  openingTime: string;
  closingTime: string;
  operatingDays: string;
  pumpsCount: number;
  lat: number;
  lng: number;
  available: boolean;
  queue: string;
  price: number;
  prices: { Benzene?: number; Diesel?: number };
  fuelTypes: string[];
  verified: boolean;
  rating: number;
  reviewCount: number;
  estimatedWaitTime: string;
}

const initialStations: Station[] = [
  { id: 1, name: "TotalEnergies Bole", location: "Addis Ababa", operator: "Abebe Kebede", contactPerson: "Abebe Kebede", phoneNumber: "+251 911 234 567", status: "Verified", operationalStatus: "Open", openingTime: "06:00", closingTime: "22:00", operatingDays: "Monday - Sunday", pumpsCount: 4, lat: 8.9806, lng: 38.7578, available: true, queue: "Short", price: 82.50, prices: { Benzene: 82.50, Diesel: 80.20 }, fuelTypes: ["Benzene", "Diesel"], verified: true, rating: 4.8, reviewCount: 342, estimatedWaitTime: "5-10 mins" },
  { id: 2, name: "NOC Piassa", location: "Addis Ababa", operator: "Abebe Kebede", contactPerson: "Chala Merera", phoneNumber: "+251 922 345 678", status: "Verified", operationalStatus: "Closed", openingTime: "06:00", closingTime: "22:00", operatingDays: "Monday - Sunday", pumpsCount: 6, lat: 9.03, lng: 38.75, available: false, queue: "Long", price: 81.90, prices: { Benzene: 81.90 }, fuelTypes: ["Benzene"], verified: false, rating: 3.9, reviewCount: 128, estimatedWaitTime: "45+ mins" },
  { id: 3, name: "Oilibya Kazanchis", location: "Addis Ababa", operator: "Abebe Kebede", contactPerson: "Tigist Bekele", phoneNumber: "+251 933 456 789", status: "Pending", operationalStatus: "Under Maintenance", openingTime: "06:00", closingTime: "22:00", operatingDays: "Monday - Sunday", pumpsCount: 4, lat: 9.015, lng: 38.765, available: true, queue: "Medium", price: 83.10, prices: { Benzene: 83.10, Diesel: 81.50 }, fuelTypes: ["Benzene", "Diesel"], verified: true, rating: 4.5, reviewCount: 256, estimatedWaitTime: "15-25 mins" },
  { id: 4, name: "YBP Megenagna", location: "Addis Ababa", operator: "Abebe Kebede", contactPerson: "Dawit Alemu", phoneNumber: "+251 944 567 890", status: "Verified", operationalStatus: "Open", openingTime: "06:00", closingTime: "22:00", operatingDays: "Monday - Sunday", pumpsCount: 8, lat: 9.018, lng: 38.801, available: true, queue: "Short", price: 80.50, prices: { Diesel: 80.50 }, fuelTypes: ["Diesel"], verified: true, rating: 4.2, reviewCount: 189, estimatedWaitTime: "5-10 mins" },
  { id: 5, name: "TotalEnergies Station 5", location: "Addis Ababa", operator: "Abebe Kebede", contactPerson: "Selamawit Tadesse", phoneNumber: "+251 955 678 901", status: "Rejected", operationalStatus: "Closed", openingTime: "06:00", closingTime: "22:00", operatingDays: "Monday - Sunday", pumpsCount: 4, lat: 8.98, lng: 38.75, available: false, queue: "Long", price: 82.50, prices: { Benzene: 82.50, Diesel: 80.20 }, fuelTypes: ["Benzene", "Diesel"], verified: false, rating: 3.5, reviewCount: 100, estimatedWaitTime: "30+ mins" },
  { id: 6, name: "NOC Station 1", location: "Bishoftu", operator: "Mulugeta Tesfaye", contactPerson: "Mulugeta Tesfaye", phoneNumber: "+251 911 111 222", status: "Verified", operationalStatus: "Open", openingTime: "06:00", closingTime: "22:00", operatingDays: "Monday - Sunday", pumpsCount: 4, lat: 8.75, lng: 38.98, available: true, queue: "Short", price: 81.90, prices: { Benzene: 81.90 }, fuelTypes: ["Benzene"], verified: true, rating: 4.0, reviewCount: 150, estimatedWaitTime: "5-10 mins" },
  { id: 7, name: "NOC Station 2", location: "Adama", operator: "Kebede Belay", contactPerson: "Kebede Belay", phoneNumber: "+251 911 333 444", status: "Pending", operationalStatus: "Open", openingTime: "06:00", closingTime: "22:00", operatingDays: "Monday - Sunday", pumpsCount: 4, lat: 8.54, lng: 39.27, available: true, queue: "Medium", price: 81.90, prices: { Benzene: 81.90 }, fuelTypes: ["Benzene"], verified: false, rating: 3.8, reviewCount: 120, estimatedWaitTime: "15-20 mins" },
  { id: 8, name: "YBP Station 1", location: "Hawassa", operator: "Sara Girma", contactPerson: "Sara Girma", phoneNumber: "+251 911 555 666", status: "Verified", operationalStatus: "Open", openingTime: "06:00", closingTime: "22:00", operatingDays: "Monday - Sunday", pumpsCount: 4, lat: 7.05, lng: 38.47, available: true, queue: "Short", price: 80.50, prices: { Diesel: 80.50 }, fuelTypes: ["Diesel"], verified: true, rating: 4.3, reviewCount: 200, estimatedWaitTime: "5-10 mins" },
  { id: 9, name: "TotalEnergies Station 6", location: "Bahir Dar", operator: "Daniel Haile", contactPerson: "Daniel Haile", phoneNumber: "+251 911 777 888", status: "Verified", operationalStatus: "Closed", openingTime: "06:00", closingTime: "22:00", operatingDays: "Monday - Sunday", pumpsCount: 4, lat: 11.59, lng: 37.39, available: false, queue: "Long", price: 82.50, prices: { Benzene: 82.50, Diesel: 80.20 }, fuelTypes: ["Benzene", "Diesel"], verified: true, rating: 4.6, reviewCount: 300, estimatedWaitTime: "45+ mins" },
  { id: 10, name: "NOC Station 3", location: "Gondar", operator: "Elias Worku", contactPerson: "Elias Worku", phoneNumber: "+251 911 999 000", status: "Pending", operationalStatus: "Open", openingTime: "06:00", closingTime: "22:00", operatingDays: "Monday - Sunday", pumpsCount: 4, lat: 12.6, lng: 37.46, available: true, queue: "Medium", price: 81.90, prices: { Benzene: 81.90 }, fuelTypes: ["Benzene"], verified: false, rating: 3.7, reviewCount: 110, estimatedWaitTime: "15-25 mins" },
  { id: 11, name: "YBP Station 2", location: "Mekelle", operator: "Hanna Tsegaye", contactPerson: "Hanna Tsegaye", phoneNumber: "+251 911 222 333", status: "Verified", operationalStatus: "Open", openingTime: "06:00", closingTime: "22:00", operatingDays: "Monday - Sunday", pumpsCount: 4, lat: 13.49, lng: 39.47, available: true, queue: "Short", price: 80.50, prices: { Diesel: 80.50 }, fuelTypes: ["Diesel"], verified: true, rating: 4.1, reviewCount: 180, estimatedWaitTime: "5-10 mins" },
  { id: 12, name: "TotalEnergies Station 7", location: "Jimma", operator: "Samuel Ayele", contactPerson: "Samuel Ayele", phoneNumber: "+251 911 444 555", status: "Rejected", operationalStatus: "Closed", openingTime: "06:00", closingTime: "22:00", operatingDays: "Monday - Sunday", pumpsCount: 4, lat: 7.67, lng: 36.83, available: false, queue: "Long", price: 82.50, prices: { Benzene: 82.50, Diesel: 80.20 }, fuelTypes: ["Benzene", "Diesel"], verified: false, rating: 3.4, reviewCount: 90, estimatedWaitTime: "30+ mins" },
];

interface StationState {
  stations: Station[];
  updateStationStatus: (id: number, status: StationStatus) => void;
  addStation: (station: Omit<Station, "id">) => void;
}

export const useStationStore = create<StationState>((set) => ({
  stations: initialStations,
  updateStationStatus: (id, status) => set((state) => ({
    stations: state.stations.map(s => s.id === id ? { ...s, status } : s)
  })),
  addStation: (station) => set((state) => ({
    stations: [...state.stations, { ...station, id: Date.now() }]
  }))
}));
