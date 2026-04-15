import { create } from "zustand";

export type UserRole = "driver" | "operator" | "admin" | "station_owner";

export interface User {
  id: string;
  role: UserRole;
  full_name: string;
  email?: string;
  phone: string;
  avatar_url?: string;
  location?: string;
  license_plate?: string;
  license_card_id?: string;
  vehicle_make?: string;
  national_id?: string;
  fuel_preference?: string;
  station_id?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem("quickfuel_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem("quickfuel_token"),
  isAuthenticated: !!localStorage.getItem("quickfuel_token"),
  login: (user, token) => {
    localStorage.setItem("quickfuel_token", token);
    localStorage.setItem("quickfuel_user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("quickfuel_token");
    localStorage.removeItem("quickfuel_user");
    set({ user: null, token: null, isAuthenticated: false });
  },
  setUser: (user) => {
    if (user) {
      localStorage.setItem("quickfuel_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("quickfuel_user");
    }
    set({ user, isAuthenticated: !!user });
  },
}));
