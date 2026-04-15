import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Clock, Users, Info } from "lucide-react";
import { useStationStore } from "@/src/store/stationStore";
import { useReservationStore } from "@/src/store/reservationStore";

export default function OperatorQueue() {
  const { stations } = useStationStore();
  const { reservations } = useReservationStore();
  
  // For demo purposes, we assume the operator is assigned to station ID 1
  const station = stations.find(s => s.id === 1) || stations[0];
  
  const [queueLength, setQueueLength] = useState("Short");
  const [estimatedWait, setEstimatedWait] = useState(5);
  const [currentQueueCount, setCurrentQueueCount] = useState(0);

  useEffect(() => {
    if (!station) return;

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    const stationReservations = reservations.filter(r => r.stationId === station.id);
    const pendingReservations = stationReservations.filter(r => r.status === "Pending" || r.status === "Confirmed");

    let count = 0;
    pendingReservations.forEach(r => {
      if (r.date === "Today") {
        const parts = r.timeSlot.split(" - ");
        if (parts.length === 2) {
          const startTimeParts = parts[0].split(":");
          if (startTimeParts.length === 2) {
            const startHours = parseInt(startTimeParts[0], 10);
            const startMinutes = parseInt(startTimeParts[1], 10);
            const startTimeInMinutes = startHours * 60 + startMinutes;
            
            if (startTimeInMinutes + 15 >= currentTimeInMinutes) {
              count++;
            }
          }
        }
      }
    });

    setCurrentQueueCount(count);

    const capacityPerSlot = (station.pumpsCount || 4) * 2;
    
    if (count === 0) {
      setQueueLength("Short");
      setEstimatedWait(5);
    } else if (count < capacityPerSlot) {
      setQueueLength("Short");
      setEstimatedWait(10);
    } else if (count < capacityPerSlot * 2) {
      setQueueLength("Medium");
      setEstimatedWait(20);
    } else {
      setQueueLength("Long");
      setEstimatedWait(30 + (count - capacityPerSlot * 2) * 5);
    }
  }, [reservations, station]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Queue Management
          </h1>
          <p className="text-slate-500">View real-time auto-calculated queue status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>What drivers see on their app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                  queueLength === "Short" ? "bg-amber-100 text-amber-600" :
                  queueLength === "Medium" ? "bg-amber-100 text-amber-600" :
                  "bg-red-100 text-red-600"
                }`}>
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Queue Length</p>
                  <h3 className="text-2xl font-bold text-slate-900">{queueLength}</h3>
                </div>
              </div>
              <Badge variant={queueLength === "Long" ? "destructive" : queueLength === "Medium" ? "warning" : "success"}>
                Auto-calculated
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Estimated Wait</p>
                  <h3 className="text-2xl font-bold text-slate-900">~{estimatedWait} mins</h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue Information</CardTitle>
            <CardDescription>How the queue is calculated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 text-slate-800 rounded-lg flex items-start gap-3 border border-slate-200">
              <Info className="mt-0.5 shrink-0" size={18} />
              <div className="text-sm">
                <p className="font-medium mb-1">Automated Queue System</p>
                <p>The queue length is automatically calculated based on the number of active reservations for your station. Operators no longer need to manually update the queue status.</p>
              </div>
            </div>
            
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-slate-600">Active Reservations</span>
                <span className="font-bold text-lg">{currentQueueCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-slate-600">Station Capacity</span>
                <span className="font-bold text-lg">{(station?.pumpsCount || 4) * 2} cars/slot</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
