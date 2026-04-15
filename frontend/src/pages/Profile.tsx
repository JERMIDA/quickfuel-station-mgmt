import { useAuthStore } from "@/src/store/authStore";
import { useNotificationStore } from "@/src/store/notificationStore";
import { supabase, isMockSupabase } from "@/src/lib/supabase";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { User, Mail, Phone, Car, MapPin, BarChart3, TrendingDown, Fuel } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const FUEL_STATS = [
  { month: "Oct", liters: 120 },
  { month: "Nov", liters: 150 },
  { month: "Dec", liters: 110 },
  { month: "Jan", liters: 180 },
  { month: "Feb", liters: 140 },
  { month: "Mar", liters: 95 },
];

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "Addis Ababa, Ethiopia",
    license_plate: user?.license_plate || "AA 12345",
    fuel_preference: user?.fuel_preference || "benzene",
    license_card_id: user?.license_card_id || "",
    vehicle_make: user?.vehicle_make || "",
    national_id: user?.national_id || "",
  });

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      if (!isMockSupabase) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            role: user.role,
            full_name: formData.full_name,
            phone: formData.phone,
            location: formData.location,
            license_plate: formData.license_plate,
            fuel_preference: formData.fuel_preference,
            license_card_id: formData.license_card_id,
            vehicle_make: formData.vehicle_make,
            national_id: formData.national_id,
          });

        if (error) throw error;
      } else {
        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      setUser({
        ...user,
        full_name: formData.full_name,
        phone: formData.phone,
        location: formData.location,
        license_plate: formData.license_plate,
        fuel_preference: formData.fuel_preference,
        license_card_id: formData.license_card_id,
        vehicle_make: formData.vehicle_make,
        national_id: formData.national_id,
      });

      addNotification({
        title: "Profile Updated",
        message: "Profile changes saved successfully!",
        type: "success"
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      addNotification({
        title: "Update Failed",
        message: "Failed to save changes: " + error.message,
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const handleAvatarChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        // Mock saving avatar
        addNotification({
          title: "Avatar Selected",
          message: `Avatar ${file.name} selected. This would be uploaded to storage in a real app.`,
          type: "info"
        });
      }
    };
    input.click();
  };

  const handleChangePassword = () => {
    setIsPasswordModalOpen(true);
  };

  const handleSavePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      addNotification({
        title: "Password Mismatch",
        message: "New passwords do not match!",
        type: "error"
      });
      return;
    }
    if (passwordData.new.length < 6) {
      addNotification({
        title: "Password Too Short",
        message: "Password must be at least 6 characters long.",
        type: "error"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      if (!isMockSupabase) {
        const { error } = await supabase.auth.updateUser({
          password: passwordData.new
        });

        if (error) throw error;
      } else {
        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      addNotification({
        title: "Password Changed",
        message: "Password changed successfully!",
        type: "success"
      });
      setIsPasswordModalOpen(false);
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      console.error("Error updating password:", error);
      addNotification({
        title: "Update Failed",
        message: "Failed to change password: " + error.message,
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorAuth = () => {
    setIs2FAModalOpen(true);
  };

  const handleToggle2FA = () => {
    setIs2FAEnabled(!is2FAEnabled);
    addNotification({
      title: "2FA Updated",
      message: `Two-Factor Authentication has been ${!is2FAEnabled ? 'enabled' : 'disabled'}.`,
      type: "success"
    });
    setIs2FAModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Profile
          </h1>
          <p className="text-slate-500">Manage your account settings and preferences</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-4xl mb-4 shadow-inner">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user?.full_name}</h2>
              <p className="text-slate-500 capitalize text-sm font-medium">{user?.role}</p>
              <div className="mt-6 w-full">
                <Button variant="outline" className="w-full" onClick={handleAvatarChange}>Change Avatar</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Account Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-sm h-9" onClick={handleChangePassword}>
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm h-9" onClick={handleTwoFactorAuth}>
                Two-Factor Authentication
              </Button>
            </CardContent>
          </Card>

          {user?.role === "driver" && (
            <Card className="bg-amber-900 text-white border-none overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingDown size={80} />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-amber-100">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-amber-300 uppercase font-bold tracking-wider">Total Fuel (2024)</p>
                  <p className="text-2xl font-bold">795 <span className="text-sm font-normal text-amber-300">Liters</span></p>
                </div>
                <div>
                  <p className="text-xs text-amber-300 uppercase font-bold tracking-wider">Estimated Savings</p>
                  <p className="text-2xl font-bold">1,240 <span className="text-sm font-normal text-amber-300">ETB</span></p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      value={formData.full_name} 
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="pl-9" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      value={formData.email} 
                      readOnly
                      className="pl-9 bg-slate-50" 
                      type="email" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-9" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      value={formData.location} 
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="pl-9" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {user?.role === "driver" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Information</CardTitle>
                  <CardDescription>Details about your primary vehicle.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">License Plate</label>
                      <div className="relative">
                        <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input 
                          value={formData.license_plate} 
                          onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                          className="pl-9 uppercase font-mono" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Vehicle Make & Model</label>
                      <div className="relative">
                        <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input 
                          value={formData.vehicle_make} 
                          onChange={(e) => setFormData({ ...formData, vehicle_make: e.target.value })}
                          className="pl-9" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">License Card ID</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input 
                          value={formData.license_card_id} 
                          onChange={(e) => setFormData({ ...formData, license_card_id: e.target.value })}
                          className="pl-9" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">National ID</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input 
                          value={formData.national_id} 
                          onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                          className="pl-9" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Fuel Type Preference</label>
                      <div className="relative">
                        <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select 
                          value={formData.fuel_preference}
                          onChange={(e) => setFormData({ ...formData, fuel_preference: e.target.value })}
                          className="w-full h-10 pl-9 pr-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="benzene">Benzene</option>
                          <option value="diesel">Diesel</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 size={20} className="text-amber-600" />
                      Fuel Consumption
                    </CardTitle>
                    <CardDescription>Liters consumed per month</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="h-64 pt-4">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <BarChart data={FUEL_STATS}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: "#64748b" }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: "#64748b" }} 
                      />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="liters" radius={[4, 4, 0, 0]}>
                        {FUEL_STATS.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === FUEL_STATS.length - 1 ? "#d97706" : "#94a3b8"} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Enter your current password and a new password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Current Password</label>
                <Input 
                  type="password" 
                  value={passwordData.current} 
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">New Password</label>
                <Input 
                  type="password" 
                  value={passwordData.new} 
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                <Input 
                  type="password" 
                  value={passwordData.confirm} 
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })} 
                />
              </div>
            </CardContent>
            <div className="flex justify-end gap-3 p-4 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleSavePassword}>Save Password</Button>
            </div>
          </Card>
        </div>
      )}

      {/* 2FA Modal */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700">
                  Two-factor authentication is currently <span className="font-bold">{is2FAEnabled ? 'enabled' : 'disabled'}</span>.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  When enabled, you will be required to enter a code sent to your phone or email when logging in.
                </p>
              </div>
            </CardContent>
            <div className="flex justify-end gap-3 p-4 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setIs2FAModalOpen(false)}>Cancel</Button>
              <Button 
                className={is2FAEnabled ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"} 
                onClick={handleToggle2FA}
              >
                {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
