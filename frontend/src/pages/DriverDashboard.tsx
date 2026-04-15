import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { MapPin, Fuel, Clock, Navigation, CheckCircle2, AlertCircle, Search, Filter } from "lucide-react";
import { useStationStore } from "@/src/store/stationStore";
import { useReservationStore } from "@/src/store/reservationStore";

export default function DriverDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { stations } = useStationStore();
  const { reservations, checkExpirations } = useReservationStore();
  
  const [fuelTypeFilter, setFuelTypeFilter] = useState<"All" | "Benzene" | "Diesel">("All");
  const [availabilityFilter, setAvailabilityFilter] = useState<"All" | "Available">("All");
  const [queueFilter, setQueueFilter] = useState<"All" | "Short" | "Medium" | "Long">("All");

  useEffect(() => {
    checkExpirations();
    const interval = setInterval(checkExpirations, 60000);
    return () => clearInterval(interval);
  }, [checkExpirations]);

  const activeReservation = reservations.find(r => r.status === "Confirmed");
  const nextBooking = reservations.find(r => r.status === "Pending");

  const verifiedStations = stations.filter(s => s.verified);
  
  const filteredStations = verifiedStations.filter(station => {
    if (fuelTypeFilter !== "All" && !station.fuelTypes.includes(fuelTypeFilter)) return false;
    if (availabilityFilter === "Available" && !station.available) return false;
    if (queueFilter !== "All" && station.queue !== queueFilter) return false;
    return true;
  }).slice(0, 3); // Show top 3 nearby

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("Dashboard")}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t("Welcome back! Here's your fuel overview.")}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Reservation */}
        <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <CheckCircle2 className="text-amber-600 dark:text-amber-500" size={20} />
              {t("Active Reservation")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeReservation ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{activeReservation.stationName}</p>
                  </div>
                  <Badge variant={activeReservation.status === "Confirmed" ? "success" : "warning"}>
                    {t(activeReservation.status)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">{t("Time")}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{activeReservation.timeSlot}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">{t("Fuel")}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{activeReservation.amount}L {t(activeReservation.fuelType)}</p>
                  </div>
                </div>
                <div className="pt-4 flex gap-2">
                  <Button className="w-full" onClick={() => navigate("/reservations")}>{t("View Details")}</Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Fuel className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 mb-4">{t("No active reservations")}</p>
                <Button onClick={() => navigate("/stations")}>{t("Find Fuel")}</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Booking / Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="text-slate-500" size={20} />
              {nextBooking ? t("Next Booking") : t("Quick Navigation")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextBooking ? (
              <div className="space-y-4 mt-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{nextBooking.stationName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{nextBooking.date}</p>
                  </div>
                  <Badge variant="warning">{t(nextBooking.status)}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">{t("Time")}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{nextBooking.timeSlot}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">{t("Fuel")}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{nextBooking.amount}L {t(nextBooking.fuelType)}</p>
                  </div>
                </div>
                <div className="pt-4 flex gap-2">
                  <Button variant="outline" className="w-full" onClick={() => navigate("/reservations")}>{t("Manage")}</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Link to="/stations" className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800">
                  <MapPin className="text-amber-600 dark:text-amber-500 mb-2" size={24} />
                  <span className="font-medium text-slate-900 dark:text-white">{t("Stations")}</span>
                </Link>
                <Link to="/reservations" className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800">
                  <Clock className="text-amber-600 dark:text-amber-500 mb-2" size={24} />
                  <span className="font-medium text-slate-900 dark:text-white">{t("Reservations")}</span>
                </Link>
                <Link to="/profile" className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 col-span-2">
                  <Fuel className="text-amber-600 dark:text-amber-500 mb-2" size={24} />
                  <span className="font-medium text-slate-900 dark:text-white">{t("My Profile & Vehicles")}</span>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Nearby Stations */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
          <div>
            <CardTitle>{t("Nearby Stations")}</CardTitle>
            <CardDescription>{t("Quickly find fuel around you")}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/stations")}>
            {t("View All")}
          </Button>
        </CardHeader>
        <CardContent>
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <Filter size={16} className="text-slate-500 ml-2" />
              <select 
                className="bg-transparent border-none text-sm focus:ring-0 text-slate-700 dark:text-slate-300 py-1"
                value={fuelTypeFilter}
                onChange={(e) => setFuelTypeFilter(e.target.value as any)}
              >
                <option value="All">{t("All Fuel")}</option>
                <option value="Benzene">{t("Benzene")}</option>
                <option value="Diesel">{t("Diesel")}</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <select 
                className="bg-transparent border-none text-sm focus:ring-0 text-slate-700 dark:text-slate-300 py-1"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              >
                <option value="All">{t("All Status")}</option>
                <option value="Available">{t("In Stock")}</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <select 
                className="bg-transparent border-none text-sm focus:ring-0 text-slate-700 dark:text-slate-300 py-1"
                value={queueFilter}
                onChange={(e) => setQueueFilter(e.target.value as any)}
              >
                <option value="All">{t("Any Queue")}</option>
                <option value="Short">{t("Short Queue")}</option>
                <option value="Medium">{t("Medium Queue")}</option>
                <option value="Long">{t("Long Queue")}</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredStations.length > 0 ? (
              filteredStations.map((station) => (
                <div key={station.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                      <Fuel className="text-amber-600 dark:text-amber-500" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {station.name}
                        {station.verified && <CheckCircle2 className="text-amber-500" size={16} />}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin size={14} />
                        {station.location} • 2.5 km
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {station.fuelTypes.map(ft => (
                          <span key={ft}><Badge variant="outline" className="text-xs">{t(ft)}</Badge></span>
                        ))}
                        <Badge variant={station.available ? "success" : "destructive"} className="text-xs">
                          {station.available ? t("In Stock") : t("Out of Stock")}
                        </Badge>
                        <Badge variant={
                          station.queue === "Short" ? "success" : 
                          station.queue === "Medium" ? "warning" : "destructive"
                        } className="text-xs">
                          {t(station.queue)} {t("Queue")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => navigate(`/stations/${station.id}`)} className="w-full sm:w-auto shrink-0">
                    {t("View Details")}
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">{t("No stations found matching your filters.")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
