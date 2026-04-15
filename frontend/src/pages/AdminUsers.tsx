import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Search, MoreVertical, Shield, User, Car, Building } from "lucide-react";
import { useNotificationStore } from "@/src/store/notificationStore";

type UserRole = "admin" | "operator" | "driver" | "station_owner";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: "Active" | "Suspended";
  joined: string;
  stationName?: string;
}

const initialUsers: UserData[] = [
  { id: 1, name: "Abebe Kebede", email: "abebe@example.com", role: "operator", status: "Active", joined: "2023-01-15", stationName: "TotalEnergies Station 1" },
  { id: 2, name: "Chala Merera", email: "chala@example.com", role: "driver", status: "Active", joined: "2023-02-20" },
  { id: 3, name: "Tigist Hailu", email: "tigist@example.com", role: "driver", status: "Suspended", joined: "2023-03-10" },
  { id: 4, name: "Admin User", email: "admin@quickfuel.com", role: "admin", status: "Active", joined: "2022-12-01" },
  { id: 5, name: "Station Owner", email: "owner@quickfuel.com", role: "station_owner", status: "Active", joined: "2023-04-01", stationName: "TotalEnergies Station 1" },
];

export default function AdminUsers() {
  const { addNotification } = useNotificationStore();
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin": return <Shield size={16} className="text-amber-600" />;
      case "station_owner": return <Building size={16} className="text-amber-600" />;
      case "operator": return <User size={16} className="text-amber-600" />;
      case "driver": return <Car size={16} className="text-amber-600" />;
    }
  };

  const toggleStatus = (id: number) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, status: user.status === "Active" ? "Suspended" : "Active" } 
        : user
    ));
    addNotification({ title: "Success", message: "User status updated", type: "success" });
  };

  const changeRole = (id: number, newRole: UserRole) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, role: newRole } 
        : user
    ));
    addNotification({ title: "Success", message: "User role updated", type: "success" });
  };

  const [isRegisteringOwner, setIsRegisteringOwner] = useState(false);
  const [newOwner, setNewOwner] = useState({ name: "", email: "", phone: "", stationName: "", documentsVerified: false });

  const handleRegisterOwner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwner.name || !newOwner.email || !newOwner.documentsVerified) return;

    const newUser: UserData = {
      id: Date.now(),
      name: newOwner.name,
      email: newOwner.email,
      role: "station_owner",
      status: "Active",
      joined: new Date().toISOString().split('T')[0],
      stationName: newOwner.stationName
    };

    setUsers([...users, newUser]);
    setIsRegisteringOwner(false);
    setNewOwner({ name: "", email: "", phone: "", stationName: "", documentsVerified: false });
    addNotification({ title: "Success", message: "Station Owner registered successfully", type: "success" });
  };

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "driver" as UserRole });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const user: UserData = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "Active",
      joined: new Date().toISOString().split('T')[0]
    };

    setUsers([...users, user]);
    setIsAddingUser(false);
    setNewUser({ name: "", email: "", role: "driver" });
    addNotification({ title: "Success", message: "User added successfully", type: "success" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            User Management
          </h1>
          <p className="text-slate-500">Manage system users and their roles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setIsRegisteringOwner(true); setIsAddingUser(false); }}>
            Register Station Owner
          </Button>
          <Button onClick={() => { setIsAddingUser(true); setIsRegisteringOwner(false); }}>Add New User</Button>
        </div>
      </div>

      {isAddingUser && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
            <p className="text-sm text-slate-500">
              Create a new user account and assign a role.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input 
                    required 
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    placeholder="e.g. Abebe Kebede" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input 
                    required 
                    type="email" 
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    placeholder="user@example.com" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                  >
                    <option value="driver">Driver</option>
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddingUser(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add User
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isRegisteringOwner && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800">
          <CardHeader>
            <CardTitle>Register Station Owner</CardTitle>
            <p className="text-sm text-slate-500">
              Verify physical documents before registering a new station owner.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterOwner} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Owner Full Name</label>
                  <Input 
                    required 
                    value={newOwner.name}
                    onChange={e => setNewOwner({...newOwner, name: e.target.value})}
                    placeholder="e.g. Abebe Kebede" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input 
                    required 
                    type="email" 
                    value={newOwner.email}
                    onChange={e => setNewOwner({...newOwner, email: e.target.value})}
                    placeholder="owner@example.com" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input 
                    required 
                    value={newOwner.phone}
                    onChange={e => setNewOwner({...newOwner, phone: e.target.value})}
                    placeholder="+251..." 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Station Name</label>
                  <Input 
                    required 
                    value={newOwner.stationName}
                    onChange={e => setNewOwner({...newOwner, stationName: e.target.value})}
                    placeholder="e.g. TotalEnergies Bole" 
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <input 
                  type="checkbox" 
                  id="docs-verified" 
                  className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-600"
                  checked={newOwner.documentsVerified}
                  onChange={e => setNewOwner({...newOwner, documentsVerified: e.target.checked})}
                  required
                />
                <label htmlFor="docs-verified" className="text-sm font-medium cursor-pointer">
                  I confirm that I have physically verified the station owner's ID, business license, and station ownership documents.
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsRegisteringOwner(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!newOwner.documentsVerified}>
                  Complete Registration
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Users</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <Input 
                placeholder="Search users..." 
                className="pl-9 h-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined Date</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{user.name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                          {user.role === 'station_owner' && user.stationName && (
                            <div className="text-xs text-amber-600 font-medium mt-0.5">{user.stationName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 capitalize">
                        {getRoleIcon(user.role)}
                        <select
                          className="bg-transparent border-none text-slate-700 focus:ring-0 cursor-pointer outline-none font-medium"
                          value={user.role}
                          onChange={(e) => changeRole(user.id, e.target.value as UserRole)}
                        >
                          <option value="admin">Admin</option>
                          <option value="station_owner">Station Owner</option>
                          <option value="operator">Operator</option>
                          <option value="driver">Driver</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.status === "Active" ? "success" : "destructive"}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{user.joined}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toggleStatus(user.id)}
                        >
                          {user.status === "Active" ? "Suspend" : "Activate"}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-slate-400 hover:text-slate-900"
                        >
                          <MoreVertical size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
