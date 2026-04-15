import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { MapPin, Fuel, Clock, Star, CheckCircle2, Navigation, AlertCircle, Phone, Calendar } from "lucide-react";
import { useStationStore } from "@/src/store/stationStore";
import { useReservationStore } from "@/src/store/reservationStore";
import { useNotificationStore } from "@/src/store/notificationStore";

const availableTimeSlots = [
  { id: "08:00-09:00", label: "08:00 AM - 09:00 AM", status: "Available" },
  { id: "09:00-10:00", label: "09:00 AM - 10:00 AM", status: "Available" },
  { id: "10:00-11:00", label: "10:00 AM - 11:00 AM", status: "Full" },
  { id: "11:00-12:00", label: "11:00 AM - 12:00 PM", status: "Available" },
  { id: "12:00-13:00", label: "12:00 PM - 01:00 PM", status: "Available" },
  { id: "13:00-14:00", label: "01:00 PM - 02:00 PM", status: "Available" },
];

export default function StationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { stations } = useStationStore();
  const { addReservation, reservations } = useReservationStore();
  const { addNotification } = useNotificationStore();

  const station = stations.find(s => s.id === Number(id));
  const activeReservation = reservations.find(r => r.status === "Confirmed" || r.status === "Pending");

  const [reservationAmount, setReservationAmount] = useState("");
  const [reservationFuelType, setReservationFuelType] = useState<"Benzene" | "Diesel">("Benzene");
  const [reservationTimeSlot, setReservationTimeSlot] = useState("");
  const [reservationStep, setReservationStep] = useState<"details" | "amount" | "review" | "payment" | "success">("details");
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "chapa" | "">("");
  const [isReserving, setIsReserving] = useState(false);
  const [showUssd, setShowUssd] = useState(false);
  const [ussdPin, setUssdPin] = useState("");

  useEffect(() => {
    if (station && station.fuelTypes.length > 0) {
      setReservationFuelType(station.fuelTypes[0] as "Benzene" | "Diesel");
    }
  }, [station]);

  if (!station) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <AlertCircle className="w-16 h-16 text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t("Station Not Found")}</h2>
        <Button onClick={() => navigate("/stations")}>{t("Back to Stations")}</Button>
      </div>
    );
  }

  const handleStartReservation = () => {
    if (activeReservation) {
      addNotification({
        title: t("Active Reservation Exists"),
        message: t("You already have an active reservation. Please complete or cancel it first."),
        type: "error"
      });
      return;
    }
    setReservationStep("amount");
  };

  const handleNext = () => {
    if (!reservationAmount || !reservationTimeSlot) return;
    
    if (!station.available) {
      addNotification({
        title: t("Out of Stock"),
        message: t("Sorry, this fuel is currently out of stock at this station."),
        type: "error"
      });
      return;
    }

    const selectedSlot = availableTimeSlots.find(slot => slot.id === reservationTimeSlot);
    if (selectedSlot && selectedSlot.status === "Full") {
      addNotification({
        title: t("Time Slot Full"),
        message: t("This time slot has reached its maximum capacity. Please select another."),
        type: "error"
      });
      return;
    }

    setReservationStep("review");
  };

  const handlePayment = () => {
    if (!paymentMethod) return;
    if (paymentMethod === "telebirr") {
      setShowUssd(true);
    } else {
      processReservation();
    }
  };

  const handleUssdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ussdPin.length >= 4) {
      setShowUssd(false);
      processReservation();
    }
  };

  const processReservation = () => {
    setIsReserving(true);
    setTimeout(() => {
      addReservation({
        id: Math.random().toString(36).substring(2, 9),
        stationId: station.id,
        stationName: station.name,
        fuelType: reservationFuelType,
        amount: Number(reservationAmount),
        timeSlot: reservationTimeSlot,
        status: "Confirmed",
        pickupCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        expiryMinutes: 15,
        paymentMethod: paymentMethod === 'telebirr' ? 'Telebirr' : 'Chapa',
        date: new Date().toISOString().split('T')[0],
        lat: station.lat,
        lng: station.lng,
      });
      setIsReserving(false);
      setReservationStep("success");
      addNotification({
        title: t("Reservation Successful"),
        message: t("Your fuel reservation has been confirmed."),
        type: "success"
      });
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate("/stations")} className="mb-4">
        &larr; {t("Back to Stations")}
      </Button>

      {reservationStep === "details" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {station.name}
                      {station.verified && <CheckCircle2 className="text-amber-500" size={20} />}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1 text-base">
                      <MapPin size={16} />
                      {station.location}
                    </CardDescription>
                  </div>
                  <Badge variant={station.available ? "success" : "destructive"} className="text-sm px-3 py-1">
                    {station.available ? t("In Stock") : t("Out of Stock")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                      <Clock size={16} />
                      <span className="text-sm font-medium">{t("Queue Status")}</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{t(station.queue)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("Est. wait")}: {station.estimatedWaitTime}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                      <Star size={16} className="text-amber-500" />
                      <span className="text-sm font-medium">{t("Rating")}</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{station.rating} / 5.0</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{station.reviewCount} {t("reviews")}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Fuel size={18} className="text-amber-600 dark:text-amber-500" />
                    {t("Fuel Types & Prices")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {station.fuelTypes.map(ft => (
                      <div key={ft} className="flex justify-between items-center p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{t(ft)}</span>
                        <span className="font-bold text-amber-600 dark:text-amber-500">
                          {station.prices[ft as keyof typeof station.prices]?.toFixed(2)} ETB/L
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Phone size={18} className="text-amber-600 dark:text-amber-500" />
                    {t("Contact Info")}
                  </h3>
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                    <p>{t("Operator")}: {station.operator}</p>
                    <p>{t("Phone")}: {station.phoneNumber}</p>
                    <p>{t("Hours")}: {station.openingTime} - {station.closingTime} ({station.operatingDays})</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Star size={18} className="text-amber-600 dark:text-amber-500" />
                    {t("Ratings & Feedback")}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold text-slate-900 dark:text-white">{station.rating}</div>
                      <div className="flex flex-col">
                        <div className="flex text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={16} fill={star <= Math.round(station.rating) ? "currentColor" : "none"} />
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">{t("Based on 124 reviews")}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">{t("Write a Review")}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{t("Reserve Fuel")}</CardTitle>
                <CardDescription>{t("Skip the queue by booking in advance.")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full h-12 text-lg" 
                  onClick={handleStartReservation}
                  disabled={!station.available}
                >
                  {station.available ? t("Start Reservation") : t("Currently Unavailable")}
                </Button>
                <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
                  {t("Reservations are held for 30 minutes past the selected time slot.")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Reservation Flow Steps */}
      {reservationStep === "amount" && (
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>{t("Reservation Details")}</CardTitle>
            <CardDescription>{t("Select fuel type, amount, and time slot.")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("Fuel Type")}</label>
              <div className="grid grid-cols-2 gap-3">
                {station.fuelTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setReservationFuelType(type as "Benzene" | "Diesel")}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      reservationFuelType === type
                        ? "border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-amber-300 dark:hover:border-amber-700"
                    }`}
                  >
                    {t(type)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("Amount (Liters)")}</label>
              <input
                type="number"
                min="1"
                max="100"
                value={reservationAmount}
                onChange={(e) => setReservationAmount(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="e.g. 20"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("Preferred Time Slot")}</label>
              <div className="grid grid-cols-2 gap-3">
                {availableTimeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => slot.status === "Available" && setReservationTimeSlot(slot.id)}
                    disabled={slot.status === "Full"}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                      reservationTimeSlot === slot.id
                        ? "border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                        : slot.status === "Full"
                        ? "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-amber-300 dark:hover:border-amber-700"
                    }`}
                  >
                    <span>{slot.label}</span>
                    {slot.status === "Full" && <span className="text-[10px] text-red-500 font-bold uppercase">{t("Full")}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="w-full" onClick={() => setReservationStep("details")}>{t("Back")}</Button>
              <Button className="w-full" onClick={handleNext} disabled={!reservationAmount || !reservationTimeSlot}>{t("Next")}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {reservationStep === "review" && (
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>{t("Review Reservation")}</CardTitle>
            <CardDescription>{t("Please confirm your details before payment.")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{t("Station")}</span>
                <span className="font-medium text-slate-900 dark:text-white">{station.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{t("Fuel Type")}</span>
                <span className="font-medium text-slate-900 dark:text-white">{t(reservationFuelType)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{t("Amount")}</span>
                <span className="font-medium text-slate-900 dark:text-white">{reservationAmount} Liters</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{t("Time Slot")}</span>
                <span className="font-medium text-slate-900 dark:text-white">{availableTimeSlots.find(s => s.id === reservationTimeSlot)?.label}</span>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-medium text-slate-900 dark:text-white">{t("Total Price")}</span>
                <span className="text-xl font-bold text-amber-600 dark:text-amber-500">
                  {((station.prices[reservationFuelType] || station.price) * Number(reservationAmount)).toFixed(2)} ETB
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("Select Payment Method")}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod("telebirr")}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === "telebirr"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-blue-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">TB</div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Telebirr</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("chapa")}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === "chapa"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-green-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xs">CH</div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Chapa</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="w-full" onClick={() => setReservationStep("amount")}>{t("Back")}</Button>
              <Button className="w-full" onClick={handlePayment} disabled={!paymentMethod || isReserving}>
                {isReserving ? t("Processing...") : t("Pay & Reserve")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showUssd && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm shadow-2xl border-0 animate-in zoom-in-95 duration-200">
            <CardHeader className="bg-blue-600 text-white rounded-t-xl pb-6">
              <CardTitle className="text-center text-xl">Telebirr Payment</CardTitle>
              <CardDescription className="text-blue-100 text-center">Enter your PIN to confirm payment</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUssdSubmit} className="space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Amount to Pay</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {((station.prices[reservationFuelType] || station.price) * Number(reservationAmount)).toFixed(2)} ETB
                  </p>
                </div>
                <div className="space-y-2">
                  <input
                    type="password"
                    maxLength={4}
                    value={ussdPin}
                    onChange={(e) => setUssdPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-2xl tracking-[1em] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="w-full" onClick={() => setShowUssd(false)}>Cancel</Button>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={ussdPin.length < 4 || isReserving}>
                    {isReserving ? "Processing..." : "Confirm"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {reservationStep === "success" && (
        <Card className="max-w-md mx-auto text-center py-8">
          <CardContent className="space-y-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="text-green-600 dark:text-green-500 w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t("Reservation Confirmed!")}</h2>
              <p className="text-slate-600 dark:text-slate-400">
                {t("Your fuel has been reserved. Please arrive at the station within your selected time slot.")}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t("Your Pickup Code")}</p>
              <p className="text-3xl font-mono font-bold text-amber-600 dark:text-amber-500 tracking-widest">
                {Math.random().toString(36).substring(2, 8).toUpperCase()}
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={() => navigate("/reservations")} className="w-full">{t("View My Reservations")}</Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">{t("Back to Dashboard")}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
