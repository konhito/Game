"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Search, 
  Filter,
  Calendar,
  User,
  Edit,
  Trash2,
  ArrowLeft,
  Eye,
  TrendingUp,
  Shield,
  Mail,
  Phone,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Download,
  Copy,
  Check
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  whatsapp: string;
  is_active: boolean;
  last_login: string;
  created_at: string;
  weekly_points: number;
  total_coins: number;
  tasks_completed: number;
  tasks_approved: number;
  tasks_rejected: number;
  current_streak: number;
  longest_streak: number;
  rank: number;
  level: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editForm, setEditForm] = useState({
    role: '',
    is_active: true,
    phone: '',
    whatsapp: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await taskService.getAllUsers({
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      if (result.success) {
        setUsers(result.data.users || []);
        setTotalPages(result.data.pagination?.pages || 1);
      } else {
        setError(result.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const openEditDialog = (user: UserData) => {
    setSelectedUser(user);
    setEditForm({
      role: user.role,
      is_active: user.is_active,
      phone: user.phone || '',
      whatsapp: user.whatsapp || ''
    });
    setShowEditDialog(true);
  };

  const closeEditDialog = () => {
    setShowEditDialog(false);
    setSelectedUser(null);
    setEditForm({
      role: '',
      is_active: true,
      phone: '',
      whatsapp: ''
    });
  };

  const openDeleteDialog = (user: UserData) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setSelectedUser(null);
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      setEditing(true);
      const result = await taskService.updateUser(selectedUser.id, editForm);
      
      if (result.success) {
        toast.success('User updated successfully!');
        // Update the user in the list
        setUsers(users.map(u => 
          u.id === selectedUser.id 
            ? { ...u, ...editForm }
            : u
        ));
        closeEditDialog();
      } else {
        toast.error(result.error || 'Failed to update user');
      }
    } catch (err) {
      toast.error('Failed to update user');
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setDeleting(true);
      const result = await taskService.deleteUser(selectedUser.id);
      
      if (result.success) {
        toast.success('User deleted successfully!');
        // Remove the user from the list
        setUsers(users.filter(u => u.id !== selectedUser.id));
        closeDeleteDialog();
        
        // Refresh the list
        if (users.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchUsers();
        }
      } else {
        toast.error(result.error || 'Failed to delete user');
      }
    } catch (err) {
      toast.error('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyEmails = async () => {
    try {
      setCopying(true);
      setCopied(false);
      const result = await taskService.getUserEmails({
        role: roleFilter === 'all' ? undefined : roleFilter,
        status: statusFilter === 'all' ? undefined : statusFilter
      });

      const emailList = Array.isArray(result.data?.emailList)
        ? result.data.emailList.filter((email: unknown) => typeof email === 'string' && email.trim() !== '')
        : [];

      if (!result.success || emailList.length === 0) {
        toast.error('No emails found to copy');
        return;
      }

      const emails = emailList.join(', ');
      let copiedSuccessfully = false;

      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(emails);
          copiedSuccessfully = true;
        } catch (clipboardError) {
          copiedSuccessfully = false;
        }
      }

      if (!copiedSuccessfully && typeof document !== 'undefined') {
        const textArea = document.createElement('textarea');
        textArea.value = emails;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copiedSuccessfully = document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      if (copiedSuccessfully) {
        setCopied(true);
        toast.success(`Copied ${emailList.length} email(s) to clipboard!`);
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      const blob = new Blob([emails], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-emails-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Downloaded ${emailList.length} email(s) as fallback.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to copy emails');
    } finally {
      setCopying(false);
    }
  };

  const handleExportEmails = async () => {
    try {
      setExporting(true);
      const blob = await taskService.exportUserEmails({
        role: roleFilter === 'all' ? undefined : roleFilter,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-emails-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('User emails exported successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export emails');
    } finally {
      setExporting(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-purple-100 text-purple-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="mt-4 text-lg">Loading users...</p>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">
              Manage user accounts, roles, and permissions ({users.length} users)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleCopyEmails} 
              disabled={copying}
              variant="outline"
            >
              {copying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                  Copying...
                </>
              ) : copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Emails
                </>
              )}
            </Button>
            <Button 
              onClick={handleExportEmails} 
              disabled={exporting}
              variant="outline"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={(value) => { setRoleFilter(value); handleFilterChange(); }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); handleFilterChange(); }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} variant="outline">
            Search
          </Button>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {users.length === 0 ? (
                    <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* User Basic Info */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{user.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs font-mono border-emerald-300 text-emerald-700">
                            User ID: {user.id}
                          </Badge>
                          <Badge className={`${getRoleColor(user.role)} text-xs`}>
                            {user.role}
                          </Badge>
                          <Badge className={`${getStatusColor(user.is_active)} text-xs`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">{user.phone}</span>
                        </div>
                      )}
                      {user.whatsapp && (
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">{user.whatsapp}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Stats */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm">Performance Stats</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{user.weekly_points}</div>
                        <div className="text-xs text-blue-600">Weekly Points</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">₽{user.total_coins}</div>
                        <div className="text-xs text-green-600">Coins</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{user.tasks_approved}</div>
                        <div className="text-xs text-purple-600">Approved</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded-lg">
                        <div className="text-lg font-bold text-yellow-600">{user.current_streak}</div>
                        <div className="text-xs text-yellow-600">Streak</div>
                      </div>
                    </div>
                  </div>

                  {/* Task Stats */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm">Task Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completed:</span>
                        <span className="font-medium">{user.tasks_completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Approved:</span>
                        <span className="font-medium text-green-600">{user.tasks_approved}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rejected:</span>
                        <span className="font-medium text-red-600">{user.tasks_rejected}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Level:</span>
                        <span className="font-medium">{user.level}</span>
                      </div>
                      {user.rank && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rank:</span>
                          <span className="font-medium">#{user.rank}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm">Actions</h4>
                    <div className="space-y-2">
                      <Button
                        onClick={() => openEditDialog(user)}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit User
                      </Button>
                      <Button
                        onClick={() => openDeleteDialog(user)}
                        size="sm"
                        variant="destructive"
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                      {user.last_login && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Last: {new Date(user.last_login).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
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

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Update user role, status, and contact information
            </DialogDescription>
            {selectedUser && (
              <div className="pt-1">
                <Badge variant="outline" className="font-mono border-emerald-300 text-emerald-700">
                  User ID: {selectedUser.id}
                </Badge>
              </div>
            )}
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm({...editForm, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="is_active">Status</Label>
              <Select value={editForm.is_active.toString()} onValueChange={(value) => setEditForm({...editForm, is_active: value === 'true'})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            
            <div>
              <Label htmlFor="whatsapp">WhatsApp (Optional)</Label>
              <Input
                id="whatsapp"
                value={editForm.whatsapp}
                onChange={(e) => setEditForm({...editForm, whatsapp: e.target.value})}
                placeholder="Enter WhatsApp number"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={editing}>
              {editing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Account Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete {selectedUser?.name}'s account? This action cannot be undone.
            </DialogDescription>
            {selectedUser && (
              <div className="pt-1">
                <Badge variant="outline" className="font-mono border-red-300 text-red-700">
                  User ID: {selectedUser.id}
                </Badge>
              </div>
            )}
          </DialogHeader>
          
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-red-800 font-medium">
                Warning: This will permanently delete the user account and all associated data.
              </span>
            </div>
            {selectedUser?.role === 'admin' && (
              <div className="mt-2 text-sm text-red-700">
                This user has admin privileges. Make sure you want to remove their admin access.
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteUser} 
              disabled={deleting}
              variant="destructive"
            >
              {deleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
