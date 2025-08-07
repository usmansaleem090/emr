import React, { useState, useEffect, useRef } from 'react';
import { Save, Shield, ChevronDown, ChevronRight, Eye, Edit, Trash2, Plus, Download, DollarSign, Mail, MessageSquare, Printer, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Checkbox } from '@/components/UI/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { api } from '@/utils/apiClient';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
}

interface Module {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}

interface Operation {
  id: number;
  name: string;
  description?: string;
  operationType?: string;
  isActive?: boolean;
}

interface ModuleOperation {
  id: number;
  moduleId: number;
  operationId: number;
  module: Module;
  operation: Operation;
}

const UserAccessPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [moduleOperations, setModuleOperations] = useState<ModuleOperation[]>([]);
  const [userPermissions, setUserPermissions] = useState<Set<number>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadUserPermissions(selectedUser.id);
    } else {
      setUserPermissions(new Set());
    }
  }, [selectedUser]);

  const filteredUsers = users.filter(
    user =>
      user?.firstName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      user?.lastName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      user?.userType?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load users and module operations in parallel
      const [usersResponse, moduleOperationsResponse] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/module-operations')
      ]);

      setUsers(usersResponse.data || []);
      setModuleOperations(moduleOperationsResponse.data || []);

      // Set default expanded groups based on available modules
      const modules = moduleOperationsResponse.data || [];
      const moduleNames = modules.map((mo: any) => mo.module?.name).filter(Boolean) as string[];
      setExpandedGroups(new Set(moduleNames));

    } catch (error: any) {
      console.error('Error loading initial data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = async (userId: number) => {
    try {
      const response = await api.get(`/api/user-access/user/${userId}/permissions`);
      const permissionsData = response.data || [];

      // Map API response to moduleOperationIds
      const permissionIds = new Set<number>(
        permissionsData
          .map((perm: { moduleName: string; operationName: string }) => {
            // Find the matching moduleOperation
            const matchingModuleOp = moduleOperations.find(
              mo =>
                mo.module?.name === perm.moduleName &&
                mo.operation?.name === perm.operationName
            );
            return matchingModuleOp?.id;
          })
          .filter((id: unknown): id is number => typeof id === 'number') // Filter out undefined/null IDs
      );

      setUserPermissions(permissionIds);
    } catch (error: any) {
      console.error('Error loading user permissions:', error);
      setUserPermissions(new Set());
      toast({
        title: 'Error',
        description: error.message || 'Failed to load user permissions',
        variant: 'destructive',
      });
    }
  };
  const handlePermissionToggle = (moduleOperationId: number) => {
    const newPermissions = new Set(userPermissions);
    if (newPermissions.has(moduleOperationId)) {
      newPermissions.delete(moduleOperationId);
    } else {
      newPermissions.add(moduleOperationId);
    }
    setUserPermissions(newPermissions);
  };

  const handleGroupToggle = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const handleSelectAllGroup = (moduleId: number) => {
    const moduleOps = moduleOperations.filter(mo => mo.moduleId === moduleId);
    const newPermissions = new Set(userPermissions);
    const moduleOperationIds = moduleOps.map(op => op.id);
    const allSelected = moduleOperationIds.every(id => newPermissions.has(id));

    if (allSelected) {
      // Deselect all
      moduleOperationIds.forEach(id => newPermissions.delete(id));
    } else {
      // Select all
      moduleOperationIds.forEach(id => newPermissions.add(id));
    }
    setUserPermissions(newPermissions);
  };

  const handleSelectAll = () => {
    const newPermissions = new Set(userPermissions);
    const allOperationIds = moduleOperations.map(op => op.id);
    const allSelected = allOperationIds.every(id => newPermissions.has(id));

    if (allSelected) {
      // Deselect all
      setUserPermissions(new Set());
    } else {
      // Select all
      setUserPermissions(new Set(allOperationIds));
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) {
      toast({
        title: 'Error',
        description: 'Please select a user first',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(`/api/user-access/user/${selectedUser.id}/permissions`, {
        moduleOperationIds: Array.from(userPermissions)
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'User permissions saved successfully',
          variant: 'default'
        });

        // Reload user permissions to reflect changes
        await loadUserPermissions(selectedUser.id);
      }
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to save permissions',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const getPermissionIcon = (operation: Operation) => {
    const operationName = operation.name.toLowerCase();

    if (operationName.includes('view') || operationName.includes('read')) {
      return <Eye className="w-4 h-4" />;
    } else if (operationName.includes('edit') || operationName.includes('update')) {
      return <Edit className="w-4 h-4" />;
    } else if (operationName.includes('delete') || operationName.includes('remove')) {
      return <Trash2 className="w-4 h-4" />;
    } else if (operationName.includes('create') || operationName.includes('add')) {
      return <Plus className="w-4 h-4" />;
    } else if (operationName.includes('import')) {
      return <Download className="w-4 h-4" />;
    } else if (operationName.includes('export')) {
      return <Download className="w-4 h-4" />;
    } else if (operationName.includes('email') || operationName.includes('mail')) {
      return <Mail className="w-4 h-4" />;
    } else if (operationName.includes('message') || operationName.includes('text')) {
      return <MessageSquare className="w-4 h-4" />;
    } else if (operationName.includes('print')) {
      return <Printer className="w-4 h-4" />;
    } else if (operationName.includes('payment') || operationName.includes('charge')) {
      return <DollarSign className="w-4 h-4" />;
    } else {
      return <FileText className="w-4 h-4" />;
    }
  };

  // Group module operations by module
  const moduleGroups = moduleOperations.reduce((groups, moduleOp) => {
    const moduleId = moduleOp.module?.id || moduleOp.moduleId;
    const moduleName = moduleOp.module?.name || 'Unknown Module';

    if (!groups[moduleId]) {
      groups[moduleId] = {
        module: moduleOp.module || { id: moduleId, name: moduleName },
        operations: [] as ModuleOperation[]
      };
    }
    groups[moduleId].operations.push(moduleOp);
    return groups;
  }, {} as Record<number, { module: Module; operations: ModuleOperation[] }>);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          User Access
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto">
          <Select
            value={selectedUser?.id?.toString() || ''}
            onValueChange={(value) => {
              const user = users.find(u => u.id.toString() === value);
              setSelectedUser(user || null);
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue
                placeholder="Select a user"
              >
                {selectedUser
                  ? `${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.userType})`
                  : ''}
              </SelectValue>
            </SelectTrigger>

            <SelectContent
              onCloseAutoFocus={(e) => e.preventDefault()}
              className="max-h-64 overflow-y-auto"
            >
              <div className="px-2 py-1 border-b">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {filteredUsers.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <SelectItem
                    key={user.id}
                    value={user.id.toString()}
                    className="cursor-pointer text-sm"
                  >
                    {user.firstName} {user.lastName} ({user.userType})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Button
            variant="default"
            onClick={handleSavePermissions}
            disabled={!selectedUser || saving}
            className="min-w-[140px]"
          >
            {saving ? (
              <>
                <Loader2 className={`$ animate-spin text-white-600`} />

                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save User Access
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleSelectAll}
            disabled={!selectedUser || saving}
          >
            {moduleOperations.length > 0 && moduleOperations.every(op => userPermissions.has(op.id)) ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </div>
      {!selectedUser && (

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-16">
              <Shield className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a User
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a user from the dropdown above to manage their permissions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}


      {selectedUser && (
        <>
          <div className="flex items-center justify-between mb-4">
          </div>
          <div className="grid  gap-4">
            {Object.values(moduleGroups).map(({ module, operations }) => (
              <div key={module.id} className="border rounded-lg bg-muted/50 dark:bg-muted/30">
                <div className="flex items-center space-x-3 p-3 border-b">
                  <button
                    onClick={() => handleGroupToggle(module.name)}
                    className="flex items-center space-x-2 text-sm font-medium focus:outline-none"
                  >
                    {expandedGroups.has(module.name) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span>{module.name}</span>
                  </button>
                  <div className="flex items-center space-x-2 ml-auto">
                    <span className="text-xs text-gray-500">
                      {(Array.isArray(operations) ? operations.filter(op => userPermissions.has(op.id)).length : 0)} / {(Array.isArray(operations) ? operations.length : 0)}
                    </span>
                    <Checkbox
                      checked={Array.isArray(operations) && operations.every(op => userPermissions.has(op.id))}
                      onCheckedChange={() => handleSelectAllGroup(module.id)}
                      aria-label={Array.isArray(operations) && operations.every(op => userPermissions.has(op.id)) ? 'Deselect all permissions in group' : 'Select all permissions in group'}
                    />
                  </div>
                </div>
                {expandedGroups.has(module.name) && (
                  <div className="ml-6 py-2 grid grid-cols-3 gap-2">
                    {operations.map((moduleOp) => (
                      <div
                        key={moduleOp.id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                        onClick={() => handlePermissionToggle(moduleOp.id)}
                      >
                        <Checkbox
                          id={`permission-${moduleOp.id}`}
                          checked={userPermissions.has(moduleOp.id)}
                          onCheckedChange={() => handlePermissionToggle(moduleOp.id)}
                          onClick={e => e.stopPropagation()}
                        />
                        <div className="flex items-center space-x-2">
                          {getPermissionIcon(moduleOp.operation)}
                          <label
                            htmlFor={`permission-${moduleOp.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {moduleOp.operation.name}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {selectedUser && Object.keys(moduleGroups).length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Shield className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Modules Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No modules with operations are available for permission assignment.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserAccessPage;