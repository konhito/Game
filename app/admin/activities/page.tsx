"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Activity, 
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
  AlertCircle
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

interface ActivityData {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  activity_type: string;
  description: string;
  metadata: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<ActivityData | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [currentPage, activityTypeFilter, dateRangeFilter, startDate, endDate]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await taskService.getUserActivities({
        page: currentPage,
        limit: 50,
        user_id: userIdFilter ? parseInt(userIdFilter) : undefined,
        activity_type: activityTypeFilter === 'all' ? undefined : activityTypeFilter,
        date_range: dateRangeFilter === 'all' ? undefined : dateRangeFilter,
        start_date: startDate || undefined,
        end_date: endDate || undefined
      });
      if (result.success) {
        setActivities(result.data.activities || []);
        setTotalPages(result.data.pagination?.pages || 1);
      } else {
        setError(result.error || 'Failed to fetch activities');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchActivities();
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchActivities();
  };

  const handleDateRangeChange = (range: string) => {
    setDateRangeFilter(range);
    if (range === 'custom') {
      // Keep custom dates
    } else {
      setStartDate('');
      setEndDate('');
    }
    setCurrentPage(1);
    fetchActivities();
  };

  const openActivity = (activity: ActivityData) => {
    setSelectedActivity(activity);
  };

  const closeActivity = () => {
    setSelectedActivity(null);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <User className="h-4 w-4" />;
      case 'start_task': return <Activity className="h-4 w-4" />;
      case 'complete_task': return <Activity className="h-4 w-4" />;
      case 'admin_action': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login': return 'bg-blue-100 text-blue-800';
      case 'start_task': return 'bg-yellow-100 text-yellow-800';
      case 'complete_task': return 'bg-green-100 text-green-800';
      case 'admin_action': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportActivities = () => {
    // Create CSV content
    const headers = ['ID', 'User', 'Email', 'Activity Type', 'Description', 'IP Address', 'User Agent', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...activities.map(activity => [
        activity.id,
        `"${activity.user_name}"`,
        `"${activity.user_email}"`,
        `"${activity.activity_type}"`,
        `"${activity.description}"`,
        `"${activity.ip_address || ''}"`,
        `"${activity.user_agent || ''}"`,
        `"${new Date(activity.created_at).toISOString()}"`
      ].join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-activities-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Activities exported successfully!');
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="mt-4 text-lg">Loading activities...</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Activities</h1>
        <p className="text-gray-600">
          Monitor and track all user activities across the platform ({activities.length} activities)
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
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          
          <Input
            placeholder="User ID (optional)"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            type="number"
          />
          
          <Select value={activityTypeFilter} onValueChange={(value) => { setActivityTypeFilter(value); handleFilterChange(); }}>
            <SelectTrigger>
              <SelectValue placeholder="Activity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="start_task">Start Task</SelectItem>
              <SelectItem value="complete_task">Complete Task</SelectItem>
              <SelectItem value="admin_action">Admin Action</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateRangeFilter} onValueChange={handleDateRangeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Range */}
        {dateRangeFilter === 'custom' && (
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
        )}

        <div className="flex items-center space-x-4">
          <Button onClick={handleSearch} variant="outline">
            Search
          </Button>
          <Button onClick={fetchActivities} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportActivities} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activities List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">All Activities</h2>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No activities found</p>
                </CardContent>
              </Card>
            ) : (
              activities.map((activity) => (
                <Card 
                  key={activity.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedActivity?.id === activity.id ? 'ring-2 ring-emerald-500' : ''
                  }`}
                  onClick={() => openActivity(activity)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getActivityColor(activity.activity_type)}`}>
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{activity.user_name}</h3>
                          <Badge className={`${getActivityColor(activity.activity_type)} text-xs`}>
                            {activity.activity_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{activity.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(activity.created_at).toLocaleString()}</span>
                          </span>
                          {activity.ip_address && (
                            <span className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{activity.ip_address}</span>
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

        {/* Activity Detail */}
        {selectedActivity && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Activity Details</h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Activity #{selectedActivity.id}</span>
                  <Badge className={getActivityColor(selectedActivity.activity_type)}>
                    {selectedActivity.activity_type}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User Information */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">User Information</span>
                  </div>
                  <p className="text-sm"><strong>Name:</strong> {selectedActivity.user_name}</p>
                  <p className="text-sm"><strong>Email:</strong> {selectedActivity.user_email}</p>
                  <p className="text-sm"><strong>User ID:</strong> {selectedActivity.user_id}</p>
                </div>

                {/* Activity Details */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Activity Details</span>
                  </div>
                  <p className="text-sm"><strong>Type:</strong> {selectedActivity.activity_type}</p>
                  <p className="text-sm"><strong>Description:</strong> {selectedActivity.description}</p>
                  <p className="text-sm"><strong>Timestamp:</strong> {new Date(selectedActivity.created_at).toLocaleString()}</p>
                </div>

                {/* Technical Details */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Monitor className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Technical Details</span>
                  </div>
                  {selectedActivity.ip_address && (
                    <p className="text-sm"><strong>IP Address:</strong> {selectedActivity.ip_address}</p>
                  )}
                  {selectedActivity.user_agent && (
                    <p className="text-sm"><strong>User Agent:</strong> {selectedActivity.user_agent}</p>
                  )}
                </div>

                {/* Metadata */}
                {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Additional Data</span>
                    </div>
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                      {JSON.stringify(selectedActivity.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                <Button
                  onClick={closeActivity}
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
