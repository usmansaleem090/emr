import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Shield, Plus, Check } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Checkbox } from '@/components/UI/checkbox';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { api } from '@/utils/apiClient';

interface Module {
  id: number;
  name: string;
  description?: string;
}

interface Operation {
  id: number;
  name: string;
  description?: string;
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

interface Role {
  id: number;
  name: string;
  description?: string;
  isPracticeRole?: boolean;
}

const RolePermissionsPage: React.FC = () => {
  const roleId = parseInt(window.location.pathname.split('/')[2]);
  
  // Validate roleId
  if (isNaN(roleId)) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Role ID</h1>
        <p className="text-gray-600">Please navigate to this page from the roles list.</p>
      </div>
    );
  }
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [role, setRole] = useState<Role | undefined>();
  const [moduleOperations, setModuleOperations] = useState<ModuleOperation[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [roleId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch role details, module operations, and current permissions
      const [roleResponse, moduleOperationsResponse, rolePermissionsResponse] = await Promise.all([
        api.get(`/api/roles/${roleId}`),
        api.get('/api/module-operations'),
        api.get(`/api/roles/${roleId}/permissions`)
      ]);

      setRole(roleResponse.data);
      setModuleOperations(moduleOperationsResponse.data || []);
      setRolePermissions(rolePermissionsResponse.data || []);

      // Initialize selected permissions
      const currentPermissions = rolePermissionsResponse.data || [];
      
      if (currentPermissions.length > 0) {
        const permissionIds = new Set<number>(
          currentPermissions.map((rp: any) => rp.moduleOperationId || rp.moduleoperationid)
        );
        setSelectedPermissions(permissionIds);
      } else {
        // Clear selected permissions if no permissions found
        setSelectedPermissions(new Set());
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (moduleOperationId: number) => {
    const newPermissions = new Set(selectedPermissions);
    if (newPermissions.has(moduleOperationId)) {
      newPermissions.delete(moduleOperationId);
    } else {
      newPermissions.add(moduleOperationId);
    }
    setSelectedPermissions(newPermissions);
  };

  const handleSelectAllModule = (moduleId: number, operations: ModuleOperation[]) => {
    const newPermissions = new Set(selectedPermissions);
    const moduleOperationIds = operations.map(op => op.id);
    const allSelected = moduleOperationIds.every(id => newPermissions.has(id));
    
    if (allSelected) {
      // Deselect all
      moduleOperationIds.forEach(id => newPermissions.delete(id));
    } else {
      // Select all
      moduleOperationIds.forEach(id => newPermissions.add(id));
    }
    setSelectedPermissions(newPermissions);
  };

  const handleSelectAll = () => {
    const newPermissions = new Set(selectedPermissions);
    const allOperationIds = moduleOperations.map(op => op.id);
    const allSelected = allOperationIds.every(id => newPermissions.has(id));
    
    if (allSelected) {
      // Deselect all
      setSelectedPermissions(new Set());
    } else {
      // Select all
      setSelectedPermissions(new Set(allOperationIds));
    }
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
      const response = await api.put(`/api/roles/${roleId}/permissions`, {
        moduleOperationIds: Array.from(selectedPermissions)
      });
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Permissions updated successfully',
          variant: 'default',
          className: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100'
        });
        
        // Reload data to reflect changes
        await loadData();
      }
    } catch (error: any) {
      console.error('Permission update error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to update permissions',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Group operations by module
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
          <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Roles
        </Button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Role Permissions: {role?.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Assign module and operation permissions to this role
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleSelectAll}
              disabled={saving}
            >
              {moduleOperations.length > 0 && moduleOperations.every(op => selectedPermissions.has(op.id)) ? 'Deselect All' : 'Select All'}
            </Button>
            <Button 
              onClick={handleSavePermissions}
              disabled={saving}
              className="min-w-[120px]"
            >
              {saving ? (
                <>
                  <LoadingSpinner />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.values(moduleGroups).map(({ module, operations }) => (
          <Card key={module.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{module.name}</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {operations.filter(op => selectedPermissions.has(op.id)).length} / {operations.length} selected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAllModule(module.id, operations)}
                  >
                    {operations.every(op => selectedPermissions.has(op.id)) ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              </CardTitle>
              {module.description && (
                <CardDescription>{module.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {operations.map((moduleOp) => (
                  <div 
                    key={moduleOp.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Checkbox
                      id={`permission-${moduleOp.id}`}
                      checked={selectedPermissions.has(moduleOp.id)}
                      onCheckedChange={() => handlePermissionToggle(moduleOp.id)}
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={`permission-${moduleOp.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {moduleOp.operation.name}
                      </label>
                      {moduleOp.operation.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {moduleOp.operation.description}
                        </p>
                      )}
                    </div>
                    {selectedPermissions.has(moduleOp.id) && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(moduleGroups).length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Modules Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No modules with operations are available for permission assignment.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RolePermissionsPage;