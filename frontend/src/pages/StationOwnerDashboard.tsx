import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Badge } from "@/src/components/ui/Badge";
import { UserPlus, Users, Fuel, Activity, Trash2 } from "lucide-react";
import { useNotificationStore } from "@/src/store/notificationStore";
import { useAuthStore } from "@/src/store/authStore";
import { useStationStore } from "@/src/store/stationStore";

interface Operator {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
}

export default function StationOwnerDashboard() {
  const { addNotification } = useNotificationStore();
  const { user } = useAuthStore();
  const { stations } = useStationStore();
  
  // Find the station belonging to this owner
  const myStation = stations.find(s => s.id.toString() === user?.station_id) || stations[0]; // Fallback to first station for demo

  const [operators, setOperators] = useState<Operator[]>([
    { id: "1", name: "Abebe Kebede", email: "abebe@example.com", phone: "+251911234567", status: "Active" },
    { id: "2", name: "Chala Merera", email: "chala@example.com", phone: "+251922345678", status: "Active" },
  ]);

  const [newOperator, setNewOperator] = useState({ name: "", email: "", phone: "" });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOperator.name || !newOperator.phone) {
      addNotification({ title: "Error", message: "Name and phone are required", type: "error" });
      return;
    }

    const newOp: Operator = {
      id: Date.now().toString(),
      name: newOperator.name,
      email: newOperator.email,
      phone: newOperator.phone,
      status: "Active",
    };

    setOperators([...operators, newOp]);
    setNewOperator({ name: "", email: "", phone: "" });
    setIsAdding(false);
    addNotification({ title: "Success", message: "Operator added successfully", type: "success" });
  };

  const handleRemoveOperator = (id: string) => {
    setOperators(operators.filter(op => op.id !== id));
    addNotification({ title: "Success", message: "Operator removed", type: "success" });
  };

  const toggleOperatorStatus = (id: string) => {
    setOperators(operators.map(op => 
      op.id === id ? { ...op, status: op.status === "Active" ? "Inactive" : "Active" } : op
    ));
    addNotification({ title: "Success", message: "Operator status updated", type: "success" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Station Owner Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage {myStation.name} and operators</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Operators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{operators.length}</div>
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Active Operators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {operators.filter(o => o.status === "Active").length}
              </div>
              <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Station Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-xl font-bold ${
                myStation.status === 'Verified' ? 'text-amber-600 dark:text-amber-400' : 
                myStation.status === 'Pending' ? 'text-amber-600 dark:text-amber-400' : 
                'text-red-600 dark:text-red-400'
              }`}>
                {myStation.status}
              </div>
              <div className={`p-2 rounded-lg ${
                myStation.status === 'Verified' ? 'bg-amber-100 dark:bg-amber-900/30' : 
                myStation.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-900/30' : 
                'bg-red-100 dark:bg-red-900/30'
              }`}>
                <Fuel className={`w-5 h-5 ${
                  myStation.status === 'Verified' ? 'text-amber-600 dark:text-amber-400' : 
                  myStation.status === 'Pending' ? 'text-amber-600 dark:text-amber-400' : 
                  'text-red-600 dark:text-red-400'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Station Operators</CardTitle>
            <CardDescription>Manage the operators for your station</CardDescription>
          </div>
          <Button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2">
            <UserPlus size={16} />
            Add Operator
          </Button>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <div className="mb-6 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-sm font-medium mb-4">Add New Operator</h3>
              <form onSubmit={handleAddOperator} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input 
                    value={newOperator.name}
                    onChange={e => setNewOperator({...newOperator, name: e.target.value})}
                    placeholder="Operator Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input 
                    value={newOperator.phone}
                    onChange={e => setNewOperator({...newOperator, phone: e.target.value})}
                    placeholder="+251..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email (Optional)</label>
                  <Input 
                    type="email"
                    value={newOperator.email}
                    onChange={e => setNewOperator({...newOperator, email: e.target.value})}
                    placeholder="operator@example.com"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end gap-2 mt-2">
                  <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                  <Button type="submit">Save Operator</Button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {operators.map((operator) => (
                  <tr key={operator.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">
                      {operator.name}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span>{operator.phone}</span>
                        {operator.email && <span className="text-xs text-slate-500">{operator.email}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={operator.status === "Active" ? "success" : "secondary"}>
                        {operator.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleOperatorStatus(operator.id)}
                        >
                          {operator.status === "Active" ? "Deactivate" : "Activate"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleRemoveOperator(operator.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {operators.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No operators found. Add one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
