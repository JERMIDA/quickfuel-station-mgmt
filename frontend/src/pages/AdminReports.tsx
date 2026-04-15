import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { BarChart3, TrendingUp, Download, Calendar, Search } from "lucide-react";

interface FuelPriceData {
  currency: string;
  name: string;
  gasoline: string;
  midGrade: string;
  premium: string;
  diesel: string;
}

function RealTimeFuelPrices() {
  const [prices, setPrices] = useState<FuelPriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState("");
  const [fuelTypeFilter, setFuelTypeFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = async () => {
    const apiKey = import.meta.env.VITE_COLLECTAPI_KEY;
    if (!apiKey) {
      setError("API key missing. Please configure VITE_COLLECTAPI_KEY in your .env file. Get an API key from https://collectapi.com/api/gasPrice/gas-prices-api");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://api.collectapi.com/gasPrice/allUsaPrice", {
        headers: {
          "content-type": "application/json",
          "authorization": `apikey ${apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch fuel prices");
      }

      const data = await response.json();
      if (data.success) {
        setPrices(data.result);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.message || "Failed to fetch fuel prices");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const filteredPrices = prices.filter(price => {
    const matchesLocation = price.name.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesLocation;
  });

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <CardTitle>Real-Time Fuel Prices (US)</CardTitle>
          <CardDescription>
            Live data fetched from CollectAPI Gas Prices
            {lastUpdated && ` • Last updated: ${lastUpdated.toLocaleTimeString()}`}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPrices} disabled={loading} className="w-full sm:w-auto">
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  placeholder="Filter by state..."
                  className="pl-10"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <select
                className="flex h-10 w-full md:w-48 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={fuelTypeFilter}
                onChange={(e) => setFuelTypeFilter(e.target.value)}
              >
                <option value="all">All Fuel Types</option>
                <option value="gasoline">Gasoline</option>
                <option value="midGrade">Mid-Grade</option>
                <option value="premium">Premium</option>
                <option value="diesel">Diesel</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-4 py-3">State</th>
                      {(fuelTypeFilter === "all" || fuelTypeFilter === "gasoline") && <th className="px-4 py-3">Gasoline</th>}
                      {(fuelTypeFilter === "all" || fuelTypeFilter === "midGrade") && <th className="px-4 py-3">Mid-Grade</th>}
                      {(fuelTypeFilter === "all" || fuelTypeFilter === "premium") && <th className="px-4 py-3">Premium</th>}
                      {(fuelTypeFilter === "all" || fuelTypeFilter === "diesel") && <th className="px-4 py-3">Diesel</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrices.map((price, index) => (
                      <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{price.name}</td>
                        {(fuelTypeFilter === "all" || fuelTypeFilter === "gasoline") && <td className="px-4 py-3">${price.gasoline}</td>}
                        {(fuelTypeFilter === "all" || fuelTypeFilter === "midGrade") && <td className="px-4 py-3">${price.midGrade}</td>}
                        {(fuelTypeFilter === "all" || fuelTypeFilter === "premium") && <td className="px-4 py-3">${price.premium}</td>}
                        {(fuelTypeFilter === "all" || fuelTypeFilter === "diesel") && <td className="px-4 py-3">${price.diesel}</td>}
                      </tr>
                    ))}
                    {filteredPrices.length === 0 && (
                      <tr>
                        <td colSpan={fuelTypeFilter === "all" ? 5 : 2} className="px-4 py-8 text-center text-slate-500">
                          No states found matching your filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const kpiData = [
  { date: "Oct 1", revenue: 12000, reservations: 45, waitTime: 18 },
  { date: "Oct 5", revenue: 15000, reservations: 52, waitTime: 16 },
  { date: "Oct 10", revenue: 11000, reservations: 38, waitTime: 19 },
  { date: "Oct 15", revenue: 18000, reservations: 65, waitTime: 14 },
  { date: "Oct 20", revenue: 22000, reservations: 78, waitTime: 12 },
  { date: "Oct 25", revenue: 19000, reservations: 68, waitTime: 13 },
  { date: "Oct 30", revenue: 25000, reservations: 85, waitTime: 11 },
];

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            System Reports
          </h1>
          <p className="text-slate-500">Analytics and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar size={16} className="mr-2" /> Last 30 Days
          </Button>
          <Button>
            <Download size={16} className="mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                <BarChart3 size={24} />
              </div>
              <span className="text-sm font-medium text-amber-600 flex items-center">
                <TrendingUp size={16} className="mr-1" /> +12%
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500">Total Revenue</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">ETB 450K</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                <TrendingUp size={24} />
              </div>
              <span className="text-sm font-medium text-amber-600 flex items-center">
                <TrendingUp size={16} className="mr-1" /> +5%
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500">Reservations Completed</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">1,245</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                <BarChart3 size={24} />
              </div>
              <span className="text-sm font-medium text-red-600 flex items-center">
                <TrendingUp size={16} className="mr-1 rotate-180" /> -2%
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500">Average Wait Time</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">14 mins</h3>
          </CardContent>
        </Card>
      </div>

      <RealTimeFuelPrices />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Reservations</CardTitle>
            <CardDescription>Daily revenue and completed reservations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={kpiData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue (ETB)" fill="#d97706" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="reservations" name="Reservations" fill="#64748b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Wait Time</CardTitle>
            <CardDescription>Daily average wait time in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <LineChart data={kpiData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line
                    type="monotone"
                    dataKey="waitTime"
                    name="Wait Time (mins)"
                    stroke="#475569"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
