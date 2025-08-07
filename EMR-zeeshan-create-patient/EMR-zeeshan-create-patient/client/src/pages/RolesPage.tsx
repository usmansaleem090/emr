import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Textarea } from '@/components/UI/textarea';
import { Switch } from '@/components/UI/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/UI/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/table';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { api } from '@/utils/apiClient';
import { Link } from 'wouter';

interface Role {
  id: number;
  name: string;
  description?: string;
  isPracticeRole?: boolean;
  permissionCount?: number;
  userCount?: number;
  clinicId?: number;
  clinic?: {
    id: number;
    name: string;
  };
}

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', isPracticeRole: false });
  const [saving, setSaving] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/roles');
      setRoles(response.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load roles',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '', isPracticeRole: false });
    setIsDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      isPracticeRole: role.isPracticeRole || false
    });
    setIsDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Role name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);

      if (editingRole) {
        await api.put(`/api/roles/${editingRole.id}`, formData);
        toast({
          title: 'Success',
          description: 'Role updated successfully'
        });
      } else {
        await api.post('/api/roles', formData);
        toast({
          title: 'Success',
          description: 'Role created successfully'
        });
      }

      setIsDialogOpen(false);
      await loadRoles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${editingRole ? 'update' : 'create'} role`,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    try {
      await api.delete(`/api/roles/${roleId}`);
      toast({
        title: 'Success',
        description: 'Role deleted successfully'
      });
      await loadRoles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete role',
        variant: 'destructive'
      });
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold dark:text-gray-900 tracking-tight">Role Management</h1>
            <Button onClick={handleCreateRole}>
            <Plus className="w-4 h-4 mr-2" />
            Add Role
          </Button>
          </div>
                 <div className="flex-1 max-w-sm">
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>
      </div>

      <section
        className="relative mb-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 p-4"
        style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)' }}
      >
        {filteredRoles.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-full text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap font-semibold tracking-wide">Name</TableHead>
                  <TableHead className="whitespace-nowrap font-semibold tracking-wide">Description</TableHead>
                  <TableHead className="whitespace-nowrap font-semibold tracking-wide">Practice Role</TableHead>
                  <TableHead className="text-right whitespace-nowrap font-semibold tracking-wide">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-lg">
                    <TableCell className="font-medium py-2 px-2 whitespace-nowrap rounded-l-lg">{role.name}</TableCell>
                    <TableCell className="py-2 px-2 whitespace-nowrap">{role.description || 'No description'}</TableCell>
                    <TableCell className="py-2 px-2 whitespace-nowrap">
                      <Badge variant={role.isPracticeRole ? "default" : "secondary"} className="px-2 py-1 text-xs font-semibold rounded-full">
                        {role.isPracticeRole ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-2 px-2 whitespace-nowrap rounded-r-lg">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                          className="rounded-lg border-gray-300 dark:border-gray-700 shadow-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-lg border-gray-300 dark:border-gray-700 shadow-sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Role</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the role "{role.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteRole(role.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Shield className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No roles found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
              {searchTerm ? 'No roles match your search criteria.' : 'Get started by creating your first role.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateRole} className="rounded-lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Role
              </Button>
            )}
          </div>
        )}
      </section>

      {/* Create/Edit Role Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? 'Update the role information below.'
                : 'Enter the details for the new role.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-3">
            <div className="grid gap-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter role name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter role description (optional)"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPracticeRole"
                checked={formData.isPracticeRole}
                onCheckedChange={(checked) => setFormData({ ...formData, isPracticeRole: checked })}
              />
              <Label htmlFor="isPracticeRole">Practice Role</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole} disabled={saving}>
              {saving ? (
                <>
             <Loader2 className={`$ animate-spin text-white-600`} />
                  {editingRole ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingRole ? 'Update Role' : 'Create Role'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesPage;