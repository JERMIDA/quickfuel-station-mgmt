import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import {
  MapPin,
  Fuel,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  Star,
  List,
  Map as MapIcon,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useStationStore } from "@/src/store/stationStore";
import { useReservationStore } from "@/src/store/reservationStore";

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function Stations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"distance" | "queue" | "name" | "price">("distance");
  const [fuelType, setFuelType] = useState<"Benzene" | "Diesel" | "All">("All");
  const [queueFilter, setQueueFilter] = useState<"All" | "Short" | "Medium" | "Long">("All");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [userLocation, setUserLocation] = useState<[number, number]>([9.0054, 38.7636]); // Default Addis Ababa

  const { stations } = useStationStore();
  const { reservations } = useReservationStore();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location", error);
        },
      );
    }
  }, []);

  const filteredStations = useMemo(() => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    return stations
      .filter(s => s.verified) // Only verified stations
      .map(station => {
        // Calculate queue based on active reservations for this station today
        const activeReservations = reservations.filter(
          r => r.stationId === station.id && 
               (r.status === "Confirmed" || r.status === "Pending") &&
               r.date === "Today"
        );

        let currentQueueCount = 0;
        activeReservations.forEach(r => {
          const parts = r.timeSlot.split(" - ");
          if (parts.length === 2) {
            const startTimeParts = parts[0].split(":");
            if (startTimeParts.length === 2) {
              const startHours = parseInt(startTimeParts[0], 10);
              const startMinutes = parseInt(startTimeParts[1], 10);
              const startTimeInMinutes = startHours * 60 + startMinutes;
              
              if (startTimeInMinutes + 15 >= currentTimeInMinutes) {
                currentQueueCount++;
              }
            }
          }
        });

        let queueStatus = station.queue;
        let waitTime = station.estimatedWaitTime;
        const capacityPerSlot = (station.pumpsCount || 4) * 2;
        
        if (currentQueueCount === 0) {
          queueStatus = "Short";
          waitTime = "5 mins";
        } else if (currentQueueCount < capacityPerSlot) {
          queueStatus = "Short";
          waitTime = "10 mins";
        } else if (currentQueueCount < capacityPerSlot * 2) {
          queueStatus = "Medium";
          waitTime = "20 mins";
        } else {
          queueStatus = "Long";
          waitTime = `${30 + (currentQueueCount - capacityPerSlot * 2) * 5} mins`;
        }

        return {
          ...station,
          queue: queueStatus,
          estimatedWaitTime: waitTime,
          distance: calculateDistance(userLocation[0], userLocation[1], station.lat, station.lng)
        };
      })
      .filter(station => {
        const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              station.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFuel = fuelType === "All" || station.fuelTypes.includes(fuelType);
        const matchesQueue = queueFilter === "All" || station.queue === queueFilter;
        return matchesSearch && matchesFuel && matchesQueue;
      })
      .sort((a, b) => {
        if (sortBy === "distance") return a.distance - b.distance;
        if (sortBy === "queue") {
          const queueOrder = { Short: 1, Medium: 2, Long: 3 };
          return (queueOrder[a.queue as keyof typeof queueOrder] || 4) - (queueOrder[b.queue as keyof typeof queueOrder] || 4);
        }
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "price") {
          const priceA = fuelType !== "All" ? a.prices[fuelType as keyof typeof a.prices] || a.price : a.price;
          const priceB = fuelType !== "All" ? b.prices[fuelType as keyof typeof b.prices] || b.price : b.price;
          return priceA - priceB;
        }
        return 0;
      });
  }, [stations, reservations, searchQuery, fuelType, queueFilter, sortBy, userLocation]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] gap-4 md:overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("Stations")}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t("Find and reserve fuel at verified stations.")}</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setViewMode("map")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "map" ? "bg-white dark:bg-slate-950 text-amber-600 dark:text-amber-500 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <MapIcon size={16} />
            {t("Map")}
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "list" ? "bg-white dark:bg-slate-950 text-amber-600 dark:text-amber-500 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <List size={16} />
            {t("List")}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
        {/* Sidebar / List View */}
        <div className={`w-full md:w-96 flex flex-col gap-4 shrink-0 ${viewMode === 'map' ? 'hidden md:flex' : 'flex'}`}>
          <Card className="shrink-0 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder={t("Search stations or locations...")}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <select 
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2"
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as any)}
                >
                  <option value="All">{t("All Fuel")}</option>
                  <option value="Benzene">{t("Benzene")}</option>
                  <option value="Diesel">{t("Diesel")}</option>
                </select>
                <select 
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2"
                  value={queueFilter}
                  onChange={(e) => setQueueFilter(e.target.value as any)}
                >
                  <option value="All">{t("Any Queue")}</option>
                  <option value="Short">{t("Short Queue")}</option>
                  <option value="Medium">{t("Medium Queue")}</option>
                  <option value="Long">{t("Long Queue")}</option>
                </select>
              </div>

              <select 
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="distance">{t("Sort by Distance")}</option>
                <option value="queue">{t("Sort by Queue Length")}</option>
                <option value="price">{t("Sort by Price")}</option>
                <option value="name">{t("Sort Alphabetically")}</option>
              </select>
            </CardContent>
          </Card>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-20 md:pb-0">
            {filteredStations.length > 0 ? (
              filteredStations.map((station) => (
                <div 
                  key={station.id} 
                  className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
                  onClick={() => navigate(`/stations/${station.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                        {station.name}
                        {station.verified && <CheckCircle2 className="text-amber-500" size={14} />}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin size={12} />
                        {station.location} • {station.distance.toFixed(1)} km
                      </p>
                    </div>
                    <Badge variant={station.available ? "success" : "destructive"} className="text-[10px]">
                      {station.available ? t("In Stock") : t("Out of Stock")}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Clock size={14} />
                      <span className={
                        station.queue === "Short" ? "text-emerald-600 dark:text-emerald-400 font-medium" : 
                        station.queue === "Medium" ? "text-amber-600 dark:text-amber-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"
                      }>{t(station.queue)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Fuel size={14} />
                      <span>{fuelType !== "All" ? station.prices[fuelType as keyof typeof station.prices]?.toFixed(2) || station.price.toFixed(2) : station.price.toFixed(2)} ETB</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <AlertCircle className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t("No stations found matching your criteria.")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Map View */}
        <div className={`w-full h-[400px] md:h-full md:flex-1 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative z-0 ${viewMode === 'list' ? 'hidden md:block' : 'block'}`}>
          <MapContainer 
            center={userLocation} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <ChangeView center={userLocation} zoom={13} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {/* User Location Marker */}
            <Marker position={userLocation}>
              <Popup>
                <div className="text-center font-medium">{t("You are here")}</div>
              </Popup>
            </Marker>
            
            {/* Station Markers */}
            {filteredStations.map((station) => (
              <Marker key={station.id} position={[station.lat, station.lng]}>
                <Popup className="station-popup">
                  <div className="p-1 min-w-[200px]">
                    <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                      {station.name}
                      {station.verified && <CheckCircle2 className="text-amber-500" size={14} />}
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">{station.location}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="bg-slate-50 p-1.5 rounded">
                        <span className="text-slate-500 block mb-0.5">{t("Queue")}</span>
                        <span className={
                          station.queue === "Short" ? "text-emerald-600 font-medium" : 
                          station.queue === "Medium" ? "text-amber-600 font-medium" : "text-red-600 font-medium"
                        }>{t(station.queue)}</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded">
                        <span className="text-slate-500 block mb-0.5">{t("Status")}</span>
                        <span className={station.available ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                          {station.available ? t("In Stock") : t("Out of Stock")}
                        </span>
                      </div>
                    </div>
                    
                    <Button size="sm" className="w-full text-xs h-8" onClick={() => navigate(`/stations/${station.id}`)}>
                      {t("View Details")}
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
