import React, { useState } from "react";
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
import { Search, Plus, MoreVertical, Check, X, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useStationStore, Station, StationStatus, OperationalStatus } from "@/src/store/stationStore";

export default function AdminStations() {
  const { stations, updateStationStatus } = useStationStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | StationStatus>("All");
  const [stationToReject, setStationToReject] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Station; direction: "asc" | "desc" } | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSort = (key: keyof Station) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleStatusChange = (id: number, newStatus: StationStatus) => {
    if (newStatus === "Rejected") {
      setStationToReject(id);
      setRejectionReason("");
      return;
    }
    updateStationStatus(id, newStatus);
  };

  const confirmRejection = () => {
    if (stationToReject !== null) {
      updateStationStatus(stationToReject, "Rejected");
      setStationToReject(null);
      setRejectionReason("");
    }
  };

  const cancelRejection = () => {
    setStationToReject(null);
    setRejectionReason("");
  };

  const getBadgeVariant = (status: StationStatus) => {
    switch (status) {
      case "Verified":
        return "success";
      case "Pending":
        return "warning";
      case "Rejected":
        return "destructive";
      default:
        return "default";
    }
  };

  const getOperationalBadgeVariant = (status: OperationalStatus) => {
    switch (status) {
      case "Open":
        return "success";
      case "Closed":
        return "destructive";
      case "Under Maintenance":
        return "warning";
      default:
        return "default";
    }
  };

  const filteredStations = stations.filter((station) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      station.name.toLowerCase().includes(query) ||
      station.location.toLowerCase().includes(query) ||
      station.operator.toLowerCase().includes(query) ||
      station.contactPerson.toLowerCase().includes(query) ||
      station.phoneNumber.toLowerCase().includes(query);
      
    const matchesStatus = statusFilter === "All" || station.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedStations = [...filteredStations].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const { key, direction } = sortConfig;
    
    if (a[key] < b[key]) {
      return direction === "asc" ? -1 : 1;
    }
    if (a[key] > b[key]) {
      return direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Calculate pagination
  const totalItems = sortedStations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedStations = sortedStations.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as "All" | StationStatus);
    setCurrentPage(1);
  };

  const renderSortIcon = (key: keyof Station) => {
    if (sortConfig?.key !== key) {
      return <ArrowUpDown size={14} className="ml-1 text-slate-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} className="ml-1 text-amber-600" />
    ) : (
      <ArrowDown size={14} className="ml-1 text-amber-600" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Stations Management
          </h1>
          <p className="text-slate-500">Manage all registered fuel stations</p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" /> Add New Station
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Stations</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <select
                className="flex h-9 w-full sm:w-40 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={statusFilter}
                onChange={handleFilterChange}
              >
                <option value="All">All Statuses</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className="relative w-full sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <Input 
                  placeholder="Search stations..." 
                  className="pl-9 h-9" 
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th 
                    className="px-4 py-3 font-medium cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Station Name
                      {renderSortIcon("name")}
                    </div>
                  </th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th 
                    className="px-4 py-3 font-medium cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    onClick={() => handleSort("operator")}
                  >
                    <div className="flex items-center">
                      Operator
                      {renderSortIcon("operator")}
                    </div>
                  </th>
                  <th className="px-4 py-3 font-medium">Contact Person</th>
                  <th className="px-4 py-3 font-medium">Phone Number</th>
                  <th 
                    className="px-4 py-3 font-medium cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Verification Status
                      {renderSortIcon("status")}
                    </div>
                  </th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStations.length > 0 ? (
                  paginatedStations.map((station) => (
                    <tr
                      key={station.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          {station.name}
                          <Badge variant={getOperationalBadgeVariant(station.operationalStatus)} className="text-[10px] px-1.5 py-0 h-4">
                            {station.operationalStatus}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{station.location}</td>
                      <td className="px-4 py-3 text-slate-500">{station.operator}</td>
                      <td className="px-4 py-3 text-slate-500">{station.contactPerson}</td>
                      <td className="px-4 py-3 text-slate-500">{station.phoneNumber}</td>
                      <td className="px-4 py-3">
                        <Badge variant={getBadgeVariant(station.status)}>
                          {station.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </Button>
                          {station.status === "Pending" && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                onClick={() => handleStatusChange(station.id, "Verified")}
                                title="Verify Station"
                              >
                                <Check size={16} />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleStatusChange(station.id, "Rejected")}
                                title="Reject Station"
                              >
                                <X size={16} />
                              </Button>
                            </>
                          )}
                          {station.status !== "Pending" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-400 hover:text-slate-900"
                            >
                              <MoreVertical size={16} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No stations found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 text-sm text-slate-500">
            <div>
              Showing <span className="font-medium text-slate-900">{totalItems > 0 ? startIndex + 1 : 0}</span> to <span className="font-medium text-slate-900">{endIndex}</span> of <span className="font-medium text-slate-900">{totalItems}</span> entries
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Confirmation Modal */}
      {stationToReject !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Reject Station</CardTitle>
              <CardDescription>
                Please provide a reason for rejecting this station.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Rejection Reason
                </label>
                <Input
                  placeholder="e.g. Incomplete documentation"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  autoFocus
                />
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-4 pt-0">
              <Button variant="outline" onClick={cancelRejection}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmRejection}
                disabled={!rejectionReason.trim()}
              >
                Reject Station
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
