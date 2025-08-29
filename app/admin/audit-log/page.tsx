"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Search, 
  Filter,
  Calendar,
  User,
  Eye,
  ArrowLeft,
  Clock,
  MapPin,
  Monitor,
  Download,
  RefreshCw,
  AlertCircle,
  Activity
} from 'lucide-react';
import { taskService } from '@/lib/task-service';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface AuditLogData {
  id: number;
  admin_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  admin: {
    id: number;
    name: string;
    email: string;
  };
}

export default function AuditLogPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [adminIdFilter, setAdminIdFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogData | null>(null);

  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage, actionFilter, entityTypeFilter, startDate, endDate]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await taskService.getAdminAuditLog({
        page: currentPage,
        limit: 50,
        admin_id: adminIdFilter ? parseInt(adminIdFilter) : undefined,
        action: actionFilter === 'all' ? undefined : actionFilter,
        entity_type: entityTypeFilter === 'all' ? undefined : entityTypeFilter,
        start_date: startDate || undefined,
        end_date: endDate || undefined
      });
      if (result.success) {
        setAuditLogs(result.data.auditLogs || []);
        setTotalPages(result.data.pagination?.pages || 1);
      } else {
        setError(result.error || 'Failed to fetch audit logs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAuditLogs();
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchAuditLogs();
  };

  const openLog = (log: AuditLogData) => {
    setSelectedLog(log);
  };

  const closeLog = () => {
    setSelectedLog(null);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'approve': return 'bg-emerald-100 text-emerald-800';
      case 'reject': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityTypeColor = (entityType: string) => {
    switch (entityType) {
      case 'user': return 'bg-purple-100 text-purple-800';
      case 'task': return 'bg-indigo-100 text-indigo-800';
      case 'submission': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportAuditLogs = () => {
    // Create CSV content
    const headers = ['ID', 'Admin', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'User Agent', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...auditLogs.map(log => [
        log.id,
        `"${log.admin.name}"`,
        `"${log.action}"`,
        `"${log.entity_type}"`,
        log.entity_id || '',
        `"${log.ip_address || ''}"`,
        `"${log.user_agent || ''}"`,
        `"${new Date(log.created_at).toISOString()}"`
      ].join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Audit logs exported successfully!');
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="mt-4 text-lg">Loading audit logs...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Audit Log</h1>
        <p className="text-gray-600">
          Track and monitor all administrative actions across the platform ({auditLogs.length} logs)
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          
          <Input
            placeholder="Admin ID (optional)"
            value={adminIdFilter}
            onChange={(e) => setAdminIdFilter(e.target.value)}
            type="number"
          />
          
          <Select value={actionFilter} onValueChange={(value) => { setActionFilter(value); handleFilterChange(); }}>
            <SelectTrigger>
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="approve">Approve</SelectItem>
              <SelectItem value="reject">Reject</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={entityTypeFilter} onValueChange={(value) => { setEntityTypeFilter(value); handleFilterChange(); }}>
            <SelectTrigger>
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="submission">Submission</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button onClick={handleSearch} variant="outline">
            Search
          </Button>
          <Button onClick={fetchAuditLogs} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportAuditLogs} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audit Logs List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">All Audit Logs</h2>
          <div className="space-y-3">
            {auditLogs.length === 0 ? (
                            <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No audit logs found</p>
                </CardContent>
              </Card>
            ) : (
              auditLogs.map((log) => (
                <Card 
                  key={log.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedLog?.id === log.id ? 'ring-2 ring-emerald-500' : ''
                  }`}
                  onClick={() => openLog(log)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                        <Shield className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{log.admin.name}</h3>
                          <Badge className={`${getActionColor(log.action)} text-xs`}>
                            {log.action}
                          </Badge>
                          <Badge className={`${getEntityTypeColor(log.entity_type)} text-xs`}>
                            {log.entity_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {log.action} {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(log.created_at).toLocaleString()}</span>
                          </span>
                          {log.ip_address && (
                            <span className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{log.ip_address}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Log Detail */}
        {selectedLog && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Log Details</h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Log #{selectedLog.id}</span>
                  <div className="flex space-x-2">
                    <Badge className={getActionColor(selectedLog.action)}>
                      {selectedLog.action}
                    </Badge>
                    <Badge className={getEntityTypeColor(selectedLog.entity_type)}>
                      {selectedLog.entity_type}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Admin Information */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Admin Information</span>
                  </div>
                  <p className="text-sm"><strong>Name:</strong> {selectedLog.admin.name}</p>
                  <p className="text-sm"><strong>Email:</strong> {selectedLog.admin.email}</p>
                  <p className="text-sm"><strong>Admin ID:</strong> {selectedLog.admin.id}</p>
                </div>

                {/* Action Details */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Action Details</span>
                  </div>
                  <p className="text-sm"><strong>Action:</strong> {selectedLog.action}</p>
                  <p className="text-sm"><strong>Entity Type:</strong> {selectedLog.entity_type}</p>
                  {selectedLog.entity_id && (
                    <p className="text-sm"><strong>Entity ID:</strong> {selectedLog.entity_id}</p>
                  )}
                  <p className="text-sm"><strong>Timestamp:</strong> {new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>

                {/* Technical Details */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Monitor className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Technical Details</span>
                  </div>
                  {selectedLog.ip_address && (
                    <p className="text-sm"><strong>IP Address:</strong> {selectedLog.ip_address}</p>
                  )}
                  {selectedLog.user_agent && (
                    <p className="text-sm"><strong>User Agent:</strong> {selectedLog.user_agent}</p>
                  )}
                </div>

                {/* Additional Details */}
                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Additional Details</span>
                    </div>
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}

                <Button
                  onClick={closeLog}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
