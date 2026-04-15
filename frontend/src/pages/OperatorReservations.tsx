import { useState } from "react";
import { useNotificationStore } from "@/src/store/notificationStore";
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
import { Search, CheckCircle2, XCircle, Clock } from "lucide-react";

type ReservationStatus = "Pending" | "Completed" | "Cancelled";

interface Reservation {
  id: string;
  driverName: string;
  fuelType: string;
  amount: number;
  time: string;
  status: ReservationStatus;
  code: string;
}

const initialReservations: Reservation[] = [
  { id: "1", driverName: "Abebe K.", fuelType: "Benzene", amount: 20, time: "10:30 AM", status: "Pending", code: "QF-1001" },
  { id: "2", driverName: "Chala M.", fuelType: "Diesel", amount: 50, time: "11:15 AM", status: "Completed", code: "QF-1002" },
  { id: "3", driverName: "Tigist H.", fuelType: "Benzene", amount: 15, time: "09:00 AM", status: "Cancelled", code: "QF-1003" },
  { id: "4", driverName: "Dawit B.", fuelType: "Diesel", amount: 100, time: "02:45 PM", status: "Pending", code: "QF-1004" },
];

export default function OperatorReservations() {
  const { addNotification } = useNotificationStore();
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyCode, setVerifyCode] = useState("");

  const filteredReservations = reservations.filter(res => 
    res.driverName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    res.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVerify = () => {
    const res = reservations.find(r => r.code === verifyCode.toUpperCase());
    if (res && res.status === "Pending") {
      setReservations(reservations.map(r => 
        r.id === res.id ? { ...r, status: "Completed" } : r
      ));
      setVerifyCode("");
      addNotification({
        title: "Code Verified",
        message: "Code verified successfully! Reservation marked as completed.",
        type: "success"
      });
    } else if (res && res.status !== "Pending") {
      addNotification({
        title: "Already Processed",
        message: `Reservation is already ${res.status.toLowerCase()}.`,
        type: "warning"
      });
    } else {
      addNotification({
        title: "Invalid Code",
        message: "The code you entered is invalid.",
        type: "error"
      });
    }
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case "Pending": return <Badge variant="warning">Pending</Badge>;
      case "Completed": return <Badge variant="success">Completed</Badge>;
      case "Cancelled": return <Badge variant="destructive">Cancelled</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Reservations
          </h1>
          <p className="text-slate-500">Manage and verify fuel reservations</p>
        </div>
      </div>

      <Card className="bg-amber-50 border-amber-100">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">Quick Verify</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input 
              placeholder="Enter Pickup Code (e.g. QF-1234)" 
              className="w-full sm:max-w-xs bg-white uppercase font-mono tracking-widest"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
            />
            <Button onClick={handleVerify} className="w-full sm:w-auto">Verify Code</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Reservations</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <Input 
                placeholder="Search by name or code..." 
                className="pl-9 h-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReservations.map((res) => (
              <div
                key={res.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50/50 gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                    {res.driverName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{res.driverName}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="font-mono text-amber-600 font-medium">{res.code}</span>
                      <span>•</span>
                      <span>{res.amount}L {res.fuelType}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <div className="flex items-center text-sm text-slate-500">
                    <Clock size={14} className="mr-1" />
                    {res.time}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(res.status)}
                    {res.status === "Pending" && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="ml-2"
                        onClick={() => {
                          setVerifyCode(res.code);
                        }}
                      >
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredReservations.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No reservations found matching your search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
