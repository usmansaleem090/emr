import React, { useState, useEffect } from 'react';
import { api } from '@/utils/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Textarea } from '@/components/UI/textarea';
import { Checkbox } from '@/components/UI/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, FolderTree, ChevronRight, ChevronDown, Settings, Edit2, Trash2, UserPlus } from 'lucide-react';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';

interface Module {
  id: number;
  name: string;
  description: string;
  operations?: Operation[];
}

interface Operation {
  id: number;
  name: string;
  description: string;
}

interface ModuleWithOperations extends Module {
  operations: Operation[];
}

const PermissionsPage: React.FC = () => {
  const { toast } = useToast();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isOperationDialogOpen, setIsOperationDialogOpen] = useState(false);
  const [isEditModuleDialogOpen, setIsEditModuleDialogOpen] = useState(false);
  const [isEditOperationDialogOpen, setIsEditOperationDialogOpen] = useState(false);
  const [isAssignOperationsDialogOpen, setIsAssignOperationsDialogOpen] = useState(false);

  // Form states
  const [newModule, setNewModule] = useState({ name: '', description: '' });
  const [newOperation, setNewOperation] = useState({ name: '', description: '' });
  const [selectedOperations, setSelectedOperations] = useState<number[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());

  // Edit states
  const [editingModule, setEditingModule] = useState<ModuleWithOperations | null>(null);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [assigningModule, setAssigningModule] = useState<ModuleWithOperations | null>(null);

  // Pre-check assigned operations when opening Assign Operations dialog
  useEffect(() => {
    if (isAssignOperationsDialogOpen && assigningModule) {
      setSelectedOperations(assigningModule.operations?.map(op => op.id) || []);
    }
  }, [isAssignOperationsDialogOpen, assigningModule]);

  // State for modules and operations
  const [modules, setModules] = useState<ModuleWithOperations[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [operationsLoading, setOperationsLoading] = useState(true);

  // Loading states for operations
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [isCreatingOperation, setIsCreatingOperation] = useState(false);
  const [isUpdatingModule, setIsUpdatingModule] = useState(false);
  const [isUpdatingOperation, setIsUpdatingOperation] = useState(false);
  const [isDeletingModule, setIsDeletingModule] = useState(false);
  const [isDeletingOperation, setIsDeletingOperation] = useState(false);
  const [isAssigningOperations, setIsAssigningOperations] = useState(false);

  // Load modules and operations
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [modulesResponse, operationsResponse] = await Promise.all([
        api.get('/api/modules'),
        api.get('/api/operations')
      ]);

      setModules(modulesResponse.data || []);
      setOperations(operationsResponse.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setModulesLoading(false);
      setOperationsLoading(false);
    }
  };

  // Create module with operations
  const handleCreateModule = async () => {
    if (!newModule.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Module name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreatingModule(true);

      // First create the module
      const moduleResponse = await api.post('/api/modules', newModule);

      // Then assign operations if any selected
      if (selectedOperations.length > 0) {
        await api.post(`/api/modules/${moduleResponse.data.id}/operations`, {
          operationIds: selectedOperations
        });
      }

      await loadData(); // Refresh data
      setNewModule({ name: '', description: '' });
      setSelectedOperations([]);
      setIsCreateDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Module created successfully with selected operations',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create module',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingModule(false);
    }
  };

  // Create operation
  const handleCreateOperation = async () => {
    if (!newOperation.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Operation name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreatingOperation(true);
      await api.post('/api/operations', newOperation);

      await loadData(); // Refresh data
      setNewOperation({ name: '', description: '' });
      setIsOperationDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Operation created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create operation',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingOperation(false);
    }
  };

  // Update module
  const handleUpdateModule = async () => {
    if (!editingModule || !editingModule.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Module name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUpdatingModule(true);
      await api.put(`/api/modules/${editingModule.id}`, {
        name: editingModule.name,
        description: editingModule.description
      });

      await loadData(); // Refresh data
      setEditingModule(null);
      setIsEditModuleDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Module updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update module',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingModule(false);
    }
  };

  // Update operation
  const handleUpdateOperation = async () => {
    if (!editingOperation || !editingOperation.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Operation name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUpdatingOperation(true);
      await api.put(`/api/operations/${editingOperation.id}`, {
        name: editingOperation.name,
        description: editingOperation.description
      });

      await loadData(); // Refresh data
      setEditingOperation(null);
      setIsEditOperationDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Operation updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update operation',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingOperation(false);
    }
  };

  // Delete module
  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeletingModule(true);
      await api.delete(`/api/modules/${moduleId}`);

      await loadData(); // Refresh data
      toast({
        title: 'Success',
        description: 'Module deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete module',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingModule(false);
    }
  };

  // Delete operation
  const handleDeleteOperation = async (operationId: number) => {
    if (!confirm('Are you sure you want to delete this operation? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeletingOperation(true);
      await api.delete(`/api/operations/${operationId}`);

      await loadData(); // Refresh data
      toast({
        title: 'Success',
        description: 'Operation deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete operation',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingOperation(false);
    }
  };

  // Assign operations to module
  const handleAssignOperations = async () => {
    if (!assigningModule || selectedOperations.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one operation to assign',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsAssigningOperations(true);
      await api.post(`/api/modules/${assigningModule.id}/operations`, {
        operationIds: selectedOperations
      });

      await loadData(); // Refresh data
      setSelectedOperations([]);
      setAssigningModule(null);
      setIsAssignOperationsDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Operations assigned successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign operations',
        variant: 'destructive',
      });
    } finally {
      setIsAssigningOperations(false);
    }
  };

  const toggleModuleExpansion = (moduleId: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleOperationSelection = (operationId: number) => {
    setSelectedOperations(prev => {
      if (prev.includes(operationId)) {
        return prev.filter(id => id !== operationId);
      } else {
        return [...prev, operationId];
      }
    });
  };

  if (modulesLoading || operationsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-2">
      <div>
        <div className="flex justify-between items-center ">
          <div className='mb-3'>
            <h1 className="text-3xl font-bold dark:text-gray-900 tracking-tight mb-1">Permissions Management</h1>
            <p className="text-gray-600 dark:text-gray-400 text-base">Manage modules and operations for your application with ease.</p>
          </div>
          <div>
            <Dialog open={isOperationDialogOpen} onOpenChange={setIsOperationDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Operation
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-xl shadow-2xl bg-white dark:bg-gray-900 p-8 max-w-lg border border-blue-100 dark:border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-700 dark:text-gray-200">Create New Operation</DialogTitle>
                  <DialogDescription className="text-gray-500 dark:text-gray-400 mb-2">
                    Add a new operation that can be assigned to modules.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 mt-2">
                  <div>
                    <Label htmlFor="operation-name" className="font-semibold text-gray-700 dark:text-gray-200">Operation Name</Label>
                    <Input
                      id="operation-name"
                      value={newOperation.name}
                      onChange={(e) => setNewOperation({ ...newOperation, name: e.target.value })}
                      placeholder="Enter operation name"
                      className="mt-1 border-blue-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="operation-description" className="font-semibold text-gray-700 dark:text-gray-200">Description</Label>
                    <Textarea
                      id="operation-description"
                      value={newOperation.description}
                      onChange={(e) => setNewOperation({ ...newOperation, description: e.target.value })}
                      placeholder="Enter operation description"
                      rows={3}
                      className="mt-1 border-blue-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsOperationDialogOpen(false)} className="rounded-lg px-4 py-2">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateOperation} disabled={isCreatingOperation} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow">
                    {isCreatingOperation ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Operation'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="ms-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Module
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-xl shadow-2xl bg-white dark:bg-gray-900 px-8 max-w-2xl max-h-[85vh] overflow-auto border border-blue-100 dark:border-gray-800 flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-700 dark:text-gray-200">Create New Module</DialogTitle>
                  <DialogDescription className="text-gray-500 dark:text-gray-400 mb-2">
                    Create a new module and assign operations to it.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="module-name" className="font-semibold text-gray-700 dark:text-gray-200">Module Name</Label>
                    <Input
                      id="module-name"
                      value={newModule.name}
                      onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                      placeholder="Enter module name"
                      className="mt-1 border-blue-300 focus:border-blue-500 focus:ring-green-500 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="module-description" className="font-semibold text-gray-700 dark:text-gray-200">Description</Label>
                    <Textarea
                      id="module-description"
                      value={newModule.description}
                      onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                      placeholder="Enter module description"
                      rows={3}
                      className="mt-1 border-blue-300 focus:border-blue-500 focus:ring-green-500 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-gray-700 dark:text-gray-200">Select Operations (optional)</Label>
                    <div className="flex space-x-3 mb-3 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOperations(operations.map(op => op.id))}
                        className="rounded-lg px-3 py-1"
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOperations([])}
                        className="rounded-lg px-3 py-1"
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-2 max-h-36 overflow-y-auto rounded-lg bg-blue-50 dark:bg-gray-800 p-3 border border-blue-200 dark:border-gray-700">
                      {operations.map((operation) => (
                        <div
                          key={operation.id}
                          className="flex items-center space-x-2 hover:bg-green-100 dark:hover:bg-gray-700 rounded px-2 py-1 transition"
                        >
                          <Checkbox
                            id={`operation-${operation.id}`}
                            checked={selectedOperations.includes(operation.id)}
                            onCheckedChange={() => handleOperationSelection(operation.id)}
                          />
                          <Label htmlFor={`operation-${operation.id}`} className="text-sm font-medium text-gray-900 dark:text-gray-200">
                            <span className="font-semibold">{operation.name}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
                <DialogFooter className=" flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="rounded-lg px-4 py-2">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateModule} disabled={isCreatingModule} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow">
                    {isCreatingModule ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Module'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="">
          {/* main module */}
          <Card className="shadow-2xl rounded-2xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardContent className="mt-6">
              <div className="space-y-4">
                {modules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <FolderTree className="w-16 h-16 mb-4 opacity-60 text-gray-400" />
                    <p className="text-lg font-semibold">No modules found.</p>
                    <p className="text-base">Create your first module to get started.</p>
                  </div>
                ) : (
                  modules.map((module) => (
                    <div key={module.id} className="border rounded-xl shadow-sm  dark:from-gray-800 dark:to-gray-900 mb-4">
                      <div className="flex items-center justify-between p-4 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-t-xl transition">
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleModuleExpansion(module.id)}
                            className="p-1 h-7 w-7 rounded-full bg-blue-200 dark:bg-gray-700 hover:bg-blue-300 dark:hover:bg-gray-600"
                          >
                            {expandedModules.has(module.id) ? (
                              <ChevronDown className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                            )}
                          </Button>
                          <FolderTree className="w-5 h-5 text-gray-600" />
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-200">{module.name}</h3>
                            {module.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{module.description}</p>
                            )}
                          </div>
                          <span className="text-xs bg-blue-200 dark:bg-blue-900 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full font-semibold ml-2">
                            {module.operations?.length || 0} operations
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setAssigningModule(module);
                              setSelectedOperations([]);
                              setIsAssignOperationsDialogOpen(true);
                            }}
                            className="rounded-full hover:bg-blue-200 dark:hover:bg-gray-700"
                          >
                            <UserPlus className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingModule(module);
                              setIsEditModuleDialogOpen(true);
                            }}
                            className="rounded-full hover:bg-green-200 dark:hover:bg-gray-700"
                          >
                            <Edit2 className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteModule(module.id)}
                            disabled={isDeletingModule}
                            className="rounded-full hover:bg-red-200 dark:hover:bg-gray-700"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      {expandedModules.has(module.id) && (
                        <div className="border-t bg-blue-50 dark:bg-gray-800/50 rounded-b-xl">
                          {module.operations && module.operations.length > 0 ? (
                            <div className="p-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {module.operations.map((operation) => (
                                  <div
                                    key={operation.id}
                                    className="flex flex-col justify-between bg-white dark:bg-gray-700 rounded-lg border border-blue-100 dark:border-gray-700 shadow-sm p-4 transition hover:shadow-lg"
                                  >
                                    <div className='flex justify-between items-center w-full'>
                                      <div className="flex items-center mb-2">
                                        <Settings className="w-4 h-4 text-gray-400 mr-2" />
                                        <span className="text-base font-semibold text-gray-900 dark:text-gray-200">{operation.name}</span>
                                      </div>
                                      <div className="flex items-center space-x-2 ">

                                        <Edit2 onClick={() => {
                                          setEditingOperation(operation);
                                          setIsEditOperationDialogOpen(true);
                                        }} className="w-4 h-4 text-gray-700 dark:text-gray-200" />

                                        <Trash2 onClick={() => handleDeleteOperation(operation.id)} className="w-4 h-4 text-red-600 group-hover:animate-bounce" />
                                      </div>

                                    </div>
                                    {operation.description && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{operation.description}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              <p className="text-sm">No operations assigned to this module.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Edit Module Dialog */}
          <Dialog open={isEditModuleDialogOpen} onOpenChange={setIsEditModuleDialogOpen}>
            <DialogContent className="rounded-xl shadow-2xl bg-white dark:bg-gray-900 p-8 max-w-lg border border-blue-100 dark:border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-700 dark:text-gray-200">Edit Module</DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400 mb-2">
                  Update the module information.
                </DialogDescription>
              </DialogHeader>
              {editingModule && (
                <div className="space-y-6 mt-2">
                  <div>
                    <Label htmlFor="edit-module-name" className="font-semibold text-gray-700 dark:text-gray-200 ">Module Name</Label>
                    <Input
                      id="edit-module-name"
                      value={editingModule.name}
                      onChange={(e) => setEditingModule({ ...editingModule, name: e.target.value })}
                      placeholder="Enter module name"
                      className="mt-1 border-blue-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-module-description" className="font-semibold text-gray-700 dark:text-gray-200">Description</Label>
                    <Textarea
                      id="edit-module-description"
                      value={editingModule.description}
                      onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                      placeholder="Enter module description"
                      rows={3}
                      className="mt-1 border-blue-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    />
                  </div>
                </div>
              )}
              <DialogFooter className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditModuleDialogOpen(false)} className="rounded-lg px-4 py-2">
                  Cancel
                </Button>
                <Button onClick={handleUpdateModule} disabled={isUpdatingModule} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow">
                  {isUpdatingModule ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Module'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Operation Dialog */}
          <Dialog open={isEditOperationDialogOpen} onOpenChange={setIsEditOperationDialogOpen}>
            <DialogContent className="rounded-xl shadow-2xl bg-white dark:bg-gray-900 p-8 max-w-lg border border-blue-100 dark:border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-700 dark:text-gray-200">Edit Operation</DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400 mb-2">
                  Update the operation information.
                </DialogDescription>
              </DialogHeader>
              {editingOperation && (
                <div className="space-y-6 mt-2">
                  <div>
                    <Label htmlFor="edit-operation-name" className="font-semibold text-gray-700 dark:text-gray-200">Operation Name</Label>
                    <Input
                      id="edit-operation-name"
                      value={editingOperation.name}
                      onChange={(e) => setEditingOperation({ ...editingOperation, name: e.target.value })}
                      placeholder="Enter operation name"
                      className="mt-1 border-blue-300 focus:border-blue-500 focus:ring-green-500 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-operation-description" className="font-semibold text-gray-700 dark:text-gray-200">Description</Label>
                    <Textarea
                      id="edit-operation-description"
                      value={editingOperation.description}
                      onChange={(e) => setEditingOperation({ ...editingOperation, description: e.target.value })}
                      placeholder="Enter operation description"
                      rows={3}
                      className="mt-1 border-blue-300 focus:border-blue-500 focus:ring-green-500 rounded-lg"
                    />
                  </div>
                </div>
              )}
              <DialogFooter className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditOperationDialogOpen(false)} className="rounded-lg px-4 py-2">
                  Cancel
                </Button>
                <Button onClick={handleUpdateOperation} disabled={isUpdatingOperation} className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 shadow">
                  {isUpdatingOperation ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Operation'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Assign Operations Dialog */}
          <Dialog open={isAssignOperationsDialogOpen} onOpenChange={setIsAssignOperationsDialogOpen}>
            <DialogContent className="rounded-xl shadow-2xl bg-white dark:bg-gray-900 p-8 max-w-xl border border-blue-100 dark:border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-700 dark:text-gray-200">Assign Operations</DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400 mb-2">
                  Select operations to assign to <span className="font-semibold text-gray-900 dark:text-gray-200">{assigningModule?.name}</span>.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 mt-2">
                <div>
                  <Label className="font-semibold text-gray-700 dark:text-gray-200">Available Operations</Label>
                  <div className="flex space-x-3 mb-3 mt-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedOperations(operations.map(op => op.id))} className="rounded-lg px-3 py-1">
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedOperations([])} className="rounded-lg px-3 py-1">
                      Clear All
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto rounded-lg bg-blue-50 dark:bg-gray-800 p-3 border border-blue-200 dark:border-gray-700">
                    {operations.map((operation) => (
                      <div
                        key={operation.id}
                        className="flex items-center space-x-2 hover:bg-blue-100 dark:hover:bg-gray-700 rounded px-2 py-1 transition"
                      >
                        <Checkbox
                          id={`assign-operation-${operation.id}`}
                          checked={selectedOperations.includes(operation.id)}
                          onCheckedChange={() => handleOperationSelection(operation.id)}
                        />
                        <Label
                          htmlFor={`assign-operation-${operation.id}`}
                          className="text-sm font-medium text-gray-900 dark:text-gray-200"
                        >
                          <span className="font-semibold">{operation.name}</span>
                        </Label>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
              <DialogFooter className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAssignOperationsDialogOpen(false)} className="rounded-lg px-4 py-2">
                  Cancel
                </Button>
                <Button onClick={handleAssignOperations} disabled={isAssigningOperations} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow">
                  {isAssigningOperations ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    'Assign Operations'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div> {/* Close max-w-5xl mx-auto */}
    </div>
  )
}

export default PermissionsPage;