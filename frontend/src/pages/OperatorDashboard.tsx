import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Fuel, Users, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useReservationStore } from "@/src/store/reservationStore";
import { useNotificationStore } from "@/src/store/notificationStore";
import { useStationStore } from "@/src/store/stationStore";

export default function OperatorDashboard() {
  const [fuelAvailable, setFuelAvailable] = useState(true);
  const [pickupCodeInput, setPickupCodeInput] = useState("");
  const [verifiedReservation, setVerifiedReservation] = useState<any>(null);

  const { reservations, updateReservationStatus } = useReservationStore();
  const { addNotification } = useNotificationStore();
  const { stations } = useStationStore();

  // For demo purposes, let's assume the operator is at station ID 1
  const station = stations.find(s => s.id === 1) || stations[0];
  const stationReservations = reservations.filter(r => r.stationId === station.id || r.stationName === station.name);
  const pendingReservations = stationReservations.filter(r => r.status === "Confirmed" || r.status === "Pending");

  // Calculate queue length automatically
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  let currentQueueCount = 0;
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
            currentQueueCount++;
          }
        }
      }
    }
  });

  const capacityPerSlot = (station?.pumpsCount || 4) * 2;
  let calculatedQueueLength = "Short";
  if (currentQueueCount >= capacityPerSlot * 2) {
    calculatedQueueLength = "Long";
  } else if (currentQueueCount >= capacityPerSlot) {
    calculatedQueueLength = "Medium";
  }

  const handleVerify = () => {
    if (!pickupCodeInput) return;
    
    const reservation = stationReservations.find(r => r.pickupCode === pickupCodeInput);
    
    if (!reservation) {
      setVerifiedReservation(null);
      addNotification({
        title: "Invalid Code",
        message: "No reservation found with this code.",
        type: "error"
      });
      return;
    }

    if (reservation.status === "Completed") {
      setVerifiedReservation(null);
      addNotification({
        title: "Already Completed",
        message: "This reservation has already been completed.",
        type: "error"
      });
      return;
    }

    if (reservation.status === "Cancelled") {
      setVerifiedReservation(null);
      addNotification({
        title: "Cancelled",
        message: "This reservation was cancelled.",
        type: "error"
      });
      return;
    }

    if (reservation.status === "Expired") {
      setVerifiedReservation(null);
      addNotification({
        title: "Expired",
        message: "This reservation has expired.",
        type: "error"
      });
      return;
    }

    // Time validation
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    if (reservation.date === "Today") {
      const parts = reservation.timeSlot.split(" - ");
      if (parts.length === 2) {
        const startParts = parts[0].split(":");
        const endParts = parts[1].split(":");
        
        if (startParts.length === 2 && endParts.length === 2) {
          const startHours = parseInt(startParts[0], 10);
          const startMinutes = parseInt(startParts[1], 10);
          const startTimeInMinutes = startHours * 60 + startMinutes;
          
          const endHours = parseInt(endParts[0], 10);
          const endMinutes = parseInt(endParts[1], 10);
          const endTimeInMinutes = endHours * 60 + endMinutes;
          
          const expiryTimeInMinutes = endTimeInMinutes + (reservation.expiryMinutes || 15);

          if (currentTimeInMinutes < startTimeInMinutes) {
            setVerifiedReservation(null);
            addNotification({
              title: "Too Early",
              message: `This reservation is for ${reservation.timeSlot}. Please wait until the time slot starts.`,
              type: "error"
            });
            return;
          } else if (currentTimeInMinutes > expiryTimeInMinutes) {
            setVerifiedReservation(null);
            updateReservationStatus(reservation.id, "Expired");
            addNotification({
              title: "Expired",
              message: "This reservation has expired as the time slot and grace period have passed.",
              type: "error"
            });
            return;
          }
        }
      }
    } else if (reservation.date !== "Today") {
      // Basic check for other dates (simplified for demo)
      setVerifiedReservation(null);
      addNotification({
        title: "Wrong Date",
        message: `This reservation is for ${reservation.date}, not today.`,
        type: "error"
      });
      return;
    }

    setVerifiedReservation(reservation);
    addNotification({
      title: "Code Verified",
      message: "Reservation is valid and ready for fueling.",
      type: "success"
    });
  };

  const handleMarkCollected = () => {
    if (verifiedReservation) {
      updateReservationStatus(verifiedReservation.id, "Completed");
      setVerifiedReservation(null);
      setPickupCodeInput("");
      addNotification({
        title: "Success",
        message: "Reservation marked as completed.",
        type: "success"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {station?.name || "TotalEnergies Bole"}
          </h1>
          <p className="text-slate-500">Operator Dashboard</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">View Feedback</Button>
          <Button>Update Status</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div
              className={`p-3 rounded-full ${fuelAvailable ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"}`}
            >
              <Fuel size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Fuel Status</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {fuelAvailable ? "Available" : "Out of Stock"}
              </h3>
            </div>
            <div className="ml-auto">
              <Button
                size="sm"
                variant={fuelAvailable ? "destructive" : "success"}
                onClick={() => setFuelAvailable(!fuelAvailable)}
              >
                Toggle
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Queue Length</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {calculatedQueueLength}
              </h3>
            </div>
            <div className="ml-auto flex flex-col gap-1">
              <Badge variant={calculatedQueueLength === "Long" ? "destructive" : calculatedQueueLength === "Medium" ? "warning" : "success"}>
                Auto-calculated
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Pending Reservations
              </p>
              <h3 className="text-2xl font-bold text-slate-900">{pendingReservations.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Reservations</CardTitle>
            <CardDescription>Manage incoming fuel reservations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingReservations.slice(0, 5).map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                      D
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{reservation.amount}L {reservation.fuelType}</p>
                      <p className="text-sm text-slate-500">
                        Code: {reservation.pickupCode} | Slot: {reservation.timeSlot}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">{reservation.status}</Badge>
                    <Button size="sm" variant="outline" className="ml-2" onClick={() => {
                      setPickupCodeInput(reservation.pickupCode || "");
                      handleVerify();
                    }}>
                      Verify
                    </Button>
                  </div>
                </div>
              ))}
              {pendingReservations.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No pending reservations.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verify Pickup Code</CardTitle>
              <CardDescription>
                Enter the code provided by the driver
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. QF-1234"
                  className="text-lg uppercase tracking-widest font-mono"
                  value={pickupCodeInput}
                  onChange={(e) => setPickupCodeInput(e.target.value)}
                />
                <Button size="lg" onClick={handleVerify}>Verify</Button>
              </div>

              {verifiedReservation && (
                <div className="mt-6 p-4 border border-amber-200 bg-amber-50 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="text-amber-600 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-medium text-amber-900">Code Verified</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Reservation valid for {verifiedReservation.amount} Liters of {verifiedReservation.fuelType}. Paid via {verifiedReservation.paymentMethod || "Cash"}.
                      <br/>
                      Time Slot: {verifiedReservation.timeSlot}
                    </p>
                    <Button
                      size="sm"
                      className="mt-3 bg-amber-600 hover:bg-amber-700"
                      onClick={handleMarkCollected}
                    >
                      Mark as Collected
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
              <CardDescription>Driver ratings and comments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-slate-100 rounded-lg bg-slate-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-slate-900">Driver 45</span>
                    <div className="flex text-amber-500 text-sm">★★★★★</div>
                  </div>
                  <p className="text-sm text-slate-600">
                    "Fast service, queue was exactly as reported."
                  </p>
                </div>
                <div className="p-4 border border-slate-100 rounded-lg bg-slate-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-slate-900">Driver 22</span>
                    <div className="flex text-amber-500 text-sm">★★★★☆</div>
                  </div>
                  <p className="text-sm text-slate-600">
                    "Good service but the station was a bit crowded."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
