import React, { useState, useEffect } from 'react';
import { Save, Shield, ChevronDown, ChevronRight, Eye, Edit, Trash2, Plus, Download, DollarSign, Mail, MessageSquare, Printer, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Checkbox } from '@/components/UI/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { api } from '@/utils/apiClient';

interface Role {
  id: number;
  name: string;
  description?: string;
  permissionCount?: number;
  userCount?: number;
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

interface RolePermission {
  id: number;
  roleId: number;
  moduleOperationId: number;
  moduleOperation: ModuleOperation;
}

interface Permission {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  group?: string;
  isGroup?: boolean;
  children?: Permission[];
}

const RoleAccessPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [moduleOperations, setModuleOperations] = useState<ModuleOperation[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Set<number>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { toast } = useToast();
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions(selectedRole.id);
    } else {
      setRolePermissions(new Set());
    }
  }, [selectedRole]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load roles and module operations in parallel
      const [rolesResponse, moduleOperationsResponse] = await Promise.all([
        api.get('/api/roles'),
        api.get('/api/module-operations')
      ]);

      setRoles(rolesResponse.data || []);
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

  const loadRolePermissions = async (roleId: number) => {
    try {
      const response = await api.get(`/api/roles/${roleId}/permissions`);
      const permissionsData = response.data || [];
      const permissionIds = new Set<number>(permissionsData.map((rp: any) => rp.moduleoperationid).filter((id: any): id is number => typeof id === 'number'));
      setRolePermissions(permissionIds);
    } catch (error: any) {
      console.error('Error loading role permissions:', error);
      setRolePermissions(new Set());
    }
  };

  const handlePermissionToggle = (moduleOperationId: number) => {
    const newPermissions = new Set(rolePermissions);
    if (newPermissions.has(moduleOperationId)) {
      newPermissions.delete(moduleOperationId);
    } else {
      newPermissions.add(moduleOperationId);
    }
    setRolePermissions(newPermissions);
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
    const newPermissions = new Set(rolePermissions);
    const moduleOperationIds = moduleOps.map(op => op.id);
    const allSelected = moduleOperationIds.every(id => newPermissions.has(id));

    if (allSelected) {
      // Deselect all
      moduleOperationIds.forEach(id => newPermissions.delete(id));
    } else {
      // Select all
      moduleOperationIds.forEach(id => newPermissions.add(id));
    }
    setRolePermissions(newPermissions);
  };

  const handleSelectAll = () => {
    const newPermissions = new Set(rolePermissions);
    const allOperationIds = moduleOperations.map(op => op.id);
    const allSelected = allOperationIds.every(id => newPermissions.has(id));

    if (allSelected) {
      // Deselect all
      setRolePermissions(new Set());
    } else {
      // Select all
      setRolePermissions(new Set(allOperationIds));
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) {
      toast({
        title: 'Error',
        description: 'Please select a role first',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(`/api/roles/${selectedRole.id}/permissions`, {
        moduleOperationIds: Array.from(rolePermissions)
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Role access permissions saved successfully',
          variant: 'default'
        });

        // Reload role permissions to reflect changes
        await loadRolePermissions(selectedRole.id);
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
        operations: []
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
    <div className="container mx-auto p-4">
      <div className='flex items-center justify-between mb-4'>
        <h1 className="text-4xl font-bold dark:text-gray-900 tracking-tight">
          Role Access
        </h1>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto">
          <Select
            value={selectedRole?.id?.toString() || ''}
            onValueChange={(value) => {
              const role = roles.find(r => r.id.toString() === value);
              setSelectedRole(role || null);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select a role" />
              {selectedRole
                ? `${selectedRole.name}`
                : ''}
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="default"
            onClick={handleSavePermissions}
            disabled={!selectedRole || saving}
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
                Save Role Access
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleSelectAll}
            disabled={!selectedRole || saving}
            className="ml-2"
          >
            {moduleOperations.length > 0 && moduleOperations.every(op => rolePermissions.has(op.id)) ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </div>



      {/* Permissions Card */}
      {!selectedRole && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-16">
              <Shield className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a Role
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a role from the dropdown above to manage its permissions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedRole && (
        <>
          <div className="grid gap-4">
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
                      {operations.filter(op => rolePermissions.has(op.id)).length} / {operations.length}
                    </span>
                    <Checkbox
                      checked={operations.every(op => rolePermissions.has(op.id))}
                      onCheckedChange={() => handleSelectAllGroup(module.id)}
                      aria-label={operations.every(op => rolePermissions.has(op.id)) ? 'Deselect all permissions in group' : 'Select all permissions in group'}
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
                          checked={rolePermissions.has(moduleOp.id)}
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

      {selectedRole && Object.keys(moduleGroups).length === 0 && (
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

export default RoleAccessPage; 