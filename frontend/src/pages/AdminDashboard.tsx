import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import {
  Users,
  Fuel,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-slate-500">System Overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Data</Button>
          <Button>Add Station</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <Fuel size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Stations
              </p>
              <h3 className="text-2xl font-bold text-slate-900">42</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Users</p>
              <h3 className="text-2xl font-bold text-slate-900">1,204</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Reservations Today
              </p>
              <h3 className="text-2xl font-bold text-slate-900">356</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Pending Approvals
              </p>
              <h3 className="text-2xl font-bold text-slate-900">5</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Station Verifications</CardTitle>
            <CardDescription>
              Review and approve new fuel stations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Station Name</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">License No</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      NOC Megenagna
                    </td>
                    <td className="px-4 py-3 text-slate-500">Addis Ababa</td>
                    <td className="px-4 py-3 text-slate-500 font-mono">
                      LIC-2023-091
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="warning">Pending</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        >
                          <CheckCircle size={18} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      Oilibya CMC
                    </td>
                    <td className="px-4 py-3 text-slate-500">Addis Ababa</td>
                    <td className="px-4 py-3 text-slate-500 font-mono">
                      LIC-2023-042
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="success">Verified</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
            <CardDescription>User reports and ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-slate-100 rounded-lg bg-slate-50/50">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-slate-900">Driver 12</span>
                  <Badge variant="destructive">Flagged</Badge>
                </div>
                <p className="text-sm text-slate-600">
                  "Station reported as having fuel but they are out of stock."
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="w-full">
                    Investigate
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-slate-100 rounded-lg bg-slate-50/50">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-slate-900">Driver 45</span>
                  <div className="flex text-amber-500 text-sm">★★★★★</div>
                </div>
                <p className="text-sm text-slate-600">
                  "Fast service, queue was exactly as reported."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All User Feedback</CardTitle>
          <CardDescription>Comprehensive list of recent user feedback and reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Feedback</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">Abebe Kebede</td>
                  <td className="px-4 py-3 text-slate-600">The app is very helpful for finding fuel during shortages.</td>
                  <td className="px-4 py-3 text-slate-500">2 hours ago</td>
                  <td className="px-4 py-3"><Badge variant="success">Reviewed</Badge></td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">Sara Tadesse</td>
                  <td className="px-4 py-3 text-slate-600">Station location was inaccurate on the map.</td>
                  <td className="px-4 py-3 text-slate-500">5 hours ago</td>
                  <td className="px-4 py-3"><Badge variant="warning">Pending</Badge></td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">Dawit Alemu</td>
                  <td className="px-4 py-3 text-slate-600">Great UI, very easy to use.</td>
                  <td className="px-4 py-3 text-slate-500">1 day ago</td>
                  <td className="px-4 py-3"><Badge variant="success">Reviewed</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
