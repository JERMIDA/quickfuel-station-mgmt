import { useState, useEffect } from "react";
import { useReservationStore } from "@/src/store/reservationStore";
import { useNotificationStore } from "@/src/store/notificationStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Fuel, Clock, MapPin, CheckCircle2, X, Star, MessageSquare } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function MyReservations() {
  const { reservations, updateReservationStatus } = useReservationStore();
  const { addNotification } = useNotificationStore();
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Confirmed" | "Completed" | "Cancelled" | "Expired">("All");
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCancel = (id: string) => {
    updateReservationStatus(id, "Cancelled");
    addNotification({
      title: "Reservation Cancelled",
      message: "Your reservation has been successfully cancelled.",
      type: "info"
    });
    setShowCancelModal(null);
  };

  const handleGetDirections = (lat?: number, lng?: number) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    } else {
      addNotification({
        title: "Location Unavailable",
        message: "Location coordinates not available for this station.",
        type: "error"
      });
    }
  };

  const submitFeedback = () => {
    addNotification({
      title: "Feedback Submitted",
      message: `Thank you for your ${rating}-star feedback!`,
      type: "success"
    });
    setShowFeedbackModal(null);
    setRating(0);
    setFeedbackText("");
  };

  const filteredReservations = reservations.filter((res) => {
    if (statusFilter === "All") return true;
    return res.status === statusFilter;
  });

  const statuses = ["All", "Pending", "Confirmed", "Completed", "Cancelled", "Expired"];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Reservations
          </h1>
          <p className="text-slate-500">Manage your fuel bookings</p>
        </div>
        <Badge variant="outline" className="h-fit">
          {filteredReservations.length} {statusFilter === "All" ? "total" : statusFilter}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 bg-slate-100 p-1 rounded-lg">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as any)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-all text-center ${
              statusFilter === status
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {filteredReservations.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-500">No {statusFilter === "All" ? "" : statusFilter.toLowerCase()} reservations found.</p>
          </div>
        ) : (
          filteredReservations.map((res) => (
            <Card 
              key={res.id} 
              className={`transition-all ${
                res.status === "Confirmed" 
                  ? "border-l-4 border-l-amber-500 shadow-md" 
                  : res.status === "Pending"
                    ? "border-l-4 border-l-amber-500 shadow-md"
                    : res.status === "Cancelled" || res.status === "Expired"
                      ? "opacity-60 grayscale" 
                      : "opacity-90"
              }`}
            >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge 
                      variant={
                        res.status === "Confirmed" 
                          ? "success" 
                          : res.status === "Pending"
                            ? "warning"
                            : res.status === "Completed" 
                              ? "default" 
                              : "destructive"
                      }
                    >
                      {res.status === "Confirmed" ? "Ready for Pickup" : res.status}
                    </Badge>
                    {(res.status === "Pending" || res.status === "Confirmed") && (
                      <span className={`text-sm font-medium ${timeLeft < 300 ? "text-red-500 animate-pulse" : "text-slate-500"}`}>
                        Expires in {formatTime(timeLeft)}
                      </span>
                    )}
                    {(res.status !== "Pending" && res.status !== "Confirmed") && (
                      <span className="text-sm text-slate-500">
                        {res.date}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900">
                    {res.stationName}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded">
                      <Fuel size={16} className="text-amber-600" /> 
                      {res.amount}L {res.fuelType}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded">
                      <Clock size={16} className="text-slate-600" /> 
                      {res.timeSlot}
                    </span>
                    {res.paymentMethod && (
                      <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-100">
                        <CheckCircle2 size={16} /> 
                        Paid via {res.paymentMethod}
                      </span>
                    )}
                  </div>
                </div>

                {(res.status === "Pending" || res.status === "Confirmed") && (
                  <div className="flex flex-col items-center justify-center bg-amber-50 p-6 rounded-xl border border-amber-100 min-w-[200px]">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-amber-100 mb-3">
                      <QRCodeSVG value={res.pickupCode || ""} size={120} level="H" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">
                      Pickup Code
                    </p>
                    <p className="text-2xl font-mono font-black tracking-[0.2em] text-amber-600">
                      {res.pickupCode}
                    </p>
                    <p className="text-[10px] text-amber-500 mt-2 text-center leading-tight">
                      Show this to the station operator<br/>to start fueling
                    </p>
                  </div>
                )}

                {res.status === "Completed" && (
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setShowFeedbackModal(res.id)}
                    >
                      <Star size={14} /> Leave Feedback
                    </Button>
                  </div>
                )}
              </div>

              {(res.status === "Pending" || res.status === "Confirmed") && (
                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2"
                    onClick={() => handleGetDirections(res.lat, res.lng)}
                  >
                    <MapPin size={16} /> Get Directions
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1 gap-2"
                    onClick={() => setShowCancelModal(res.id)}
                  >
                    <X size={16} /> Cancel Reservation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle className="text-red-600">Cancel Reservation?</CardTitle>
              <CardDescription>
                This action cannot be undone. You may be charged a small cancellation fee depending on the station policy.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowCancelModal(null)}>
                Keep it
              </Button>
              <Button variant="destructive" onClick={() => handleCancel(showCancelModal)}>
                Yes, Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Rate your experience</CardTitle>
              <CardDescription>
                How was the service at {reservations.find(r => r.id === showFeedbackModal)?.stationName}?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-1 transition-transform hover:scale-110 ${
                      star <= rating ? "text-amber-400" : "text-slate-300"
                    }`}
                  >
                    <Star size={32} fill={star <= rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare size={14} /> Additional Comments
                </label>
                <Input 
                  placeholder="Tell us more about your visit..." 
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowFeedbackModal(null)}>
                Later
              </Button>
              <Button 
                className="bg-amber-600 hover:bg-amber-700"
                onClick={submitFeedback}
                disabled={rating === 0}
              >
                Submit Feedback
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
