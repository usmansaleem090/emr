import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Badge } from "@/components/UI/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { toast } from "@/hooks/use-toast";
import { api } from "@/utils/apiClient";
import { useAppSelector } from "@/redux/hooks";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PlayCircle,
  Eye,
  Download,
  Paperclip,
} from "lucide-react";
import { CommonModal } from "@/components/UI/CommonModal";
import TaskForm from "@/components/tasks/TaskForm";
import { DroppableKanbanColumn } from "@/components/tasks/DroppableKanbanColumn";
import { SimpleDropdown } from "@/components/UI/SimpleDropdown";

interface TaskAttachment {
  id: number;
  taskId: number;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  mimeType: string | null;
  uploadedBy: number;
  createdAt: string;
  uploadedByUser: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface TaskWithDetails {
  id: number;
  title: string;
  description?: string;
  status: "open" | "in_progress" | "completed" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  createdBy: number;
  assignedTo?: number;
  clinicId: number;
  createdAt: string;
  updatedAt: string;
  createdByUser: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  assignedToUser?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  clinic: {
    id: number;
    name: string;
  };
  commentsCount: number;
  attachments?: TaskAttachment[];
}

interface TaskStats {
  total: number;
  byStatus: {
    open: number;
    in_progress: number;
    completed: number;
    closed: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

export default function TasksPage() {
  const { user, token, isAuthenticated } = useAppSelector(
    (state: any) => state.auth
  );

  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithDetails[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // 👈 modal state
  const [isLoading, setIsLoading] = useState(true); // 👈 loading state
  const [isLoadingStats, setIsLoadingStats] = useState(true); // 👈 stats loading state
  const [updatingTasks, setUpdatingTasks] = useState<Set<number>>(new Set());

  // Load tasks
  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (user?.clinicId)
        queryParams.append("clinic_id", user.clinicId.toString());
      if (assignedToMeOnly) queryParams.append("assigned_to_me", "true");

      const response = await api.get(`/api/tasks?${queryParams.toString()}`, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.success) {
        const tasksData = response.data || [];
        setTasks(tasksData);
        setFilteredTasks(tasksData);
      } else {
        console.error("Failed to load tasks:", response.message);
        toast({
          title: "Error",
          description: response.message || "Failed to load tasks",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("TasksPage - Error loading tasks:", error);
      console.error("TasksPage - Error response:", error.response?.data);
      console.error("TasksPage - Error status:", error.response?.status);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle status update for drag and drop with optimistic updates
  const handleStatusUpdate = async (taskId: number, newStatus: string) => {
    // Find the task to get its current status
    const currentTask = tasks.find((task) => task.id === taskId);
    if (!currentTask) return;

    const oldStatus = currentTask.status;

    // Optimistic update - immediately update the UI
    const optimisticTask = {
      ...currentTask,
      status: newStatus as "open" | "in_progress" | "completed" | "closed",
    };
    updateIndividualTask(taskId, optimisticTask);

    // Show loading state for this specific task
    setUpdatingTasks((prev) => new Set(prev).add(taskId));

    try {
      const response = await api.patch(`/api/tasks/${taskId}/status`, {
        status: newStatus,
      });

      // Check if the response indicates success
      if (response?.success) {
        // API success - check if we have updated data
        if (response?.data) {
          const updatedTask = response?.data;
          updateIndividualTask(taskId, updatedTask);
        }
        // Keep the optimistic update if no data returned
        toast({
          title: "Success",
          description: "Task status updated successfully",
        });
      } else {
        // API failed - revert to original status
        console.log("API failed, reverting task");
        const revertedTask = { ...currentTask, status: oldStatus };
        updateIndividualTask(taskId, revertedTask);
        toast({
          title: "Error",
          description: "Failed to update task status",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to update task status:", error);
      // API failed - revert to original status
      const revertedTask = { ...currentTask, status: oldStatus };
      updateIndividualTask(taskId, revertedTask);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update task status",
        variant: "destructive",
      });
    } finally {
      // Remove loading state
      setUpdatingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  // Load task statistics
  const loadStats = async () => {
    if (!user?.clinicId) return;

    setIsLoadingStats(true);
    try {
      const response = await api.get(`/api/tasks/stats/${user.clinicId}`);
      setStats(response.data);
    } catch (error: any) {
      console.error("Failed to load task stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleTaskCreated = () => {
    loadTasks(); // refresh tasks
    setIsModalOpen(false); // close modal
  };

  // Update individual task without triggering main loading
  const updateIndividualTask = (
    taskId: number,
    updatedTask: TaskWithDetails
  ) => {
    console.log("Updating individual task:", taskId, updatedTask);
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
    );
    setFilteredTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
    );
  };

  // Filter tasks based on search and filters
  useEffect(() => {
    let filtered = tasks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${task.createdByUser?.firstName || ""} ${
            task.createdByUser?.lastName || ""
          }`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          `${task.assignedToUser?.firstName || ""} ${
            task.assignedToUser?.lastName || ""
          }`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    // Assigned to me filter
    if (assignedToMeOnly && user?.id) {
      filtered = filtered.filter((task) => task.assignedTo === user.id);
    }

    setFilteredTasks(filtered);
  }, [
    tasks,
    searchTerm,
    statusFilter,
    priorityFilter,
    assignedToMeOnly,
    user?.id,
  ]);

  useEffect(() => {
    if (user?.clinicId) {
      loadTasks();
      loadStats();
    }
  }, [user?.clinicId, assignedToMeOnly]);

  // Status badge component
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: "bg-blue-100 text-blue-800", icon: PlayCircle },
      in_progress: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
      closed: { color: "bg-gray-100 text-gray-800", icon: XCircle },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  // Priority badge component
  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };

    return (
      <Badge
        className={
          priorityColors[priority as keyof typeof priorityColors] ||
          priorityColors.medium
        }
      >
        {priority}
      </Badge>
    );
  };

  // Format user name
  const formatUserName = (user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  }) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return user.email;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleFileDownload = async (attachment: TaskAttachment) => {
    try {
      // Create a download link using the file path
      const link = document.createElement("a");
      link.href = attachment.filePath; // Use the file path directly
      link.download = attachment.fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success message
      toast({
        title: "Download Started",
        description: `${attachment.fileName} is being downloaded.`,
      });
    } catch (error) {
      console.error("TasksPage - Download failed:", error);
      toast({
        title: "Download Failed",
        description: "Unable to download the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const todoTasks = filteredTasks.filter((t) => t.status === "open");
  const inProgressTasks = filteredTasks.filter(
    (t) => t.status === "in_progress"
  );
  const doneTasks = filteredTasks.filter(
    (t) => t.status === "completed" || t.status === "closed"
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and track tasks within your clinic
          </p>
        </div>

        <div className="flex gap-2">
          <CommonModal
            title="Create New Task"
            description="Create a new task for your clinic team"
            trigger={<Button> Create Task</Button>}
            minWidth="70%"
            open={Boolean(isModalOpen)}
            onOpenChange={() => setIsModalOpen((prev) => !prev)}
          >
            <TaskForm onSuccess={handleTaskCreated} />
          </CommonModal>
        </div>
      </div>

      {/* Statistics Cards */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <LoadingSpinner size="small" message="Loading stats..." />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <LoadingSpinner size="small" message="Loading stats..." />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <LoadingSpinner size="small" message="Loading stats..." />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <LoadingSpinner size="small" message="Loading stats..." />
            </CardContent>
          </Card>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.byStatus.in_progress}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.byStatus.completed}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.byPriority.urgent}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">0</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks by title, description, or assignee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="min-w-[150px]">
                <SimpleDropdown
                  value={statusFilter || ""}
                  onValueChange={setStatusFilter}
                  options={[
                    { value: "all", label: "All Status" },
                    { value: "open", label: "Open" },
                    { value: "in_progress", label: "In Progress" },
                    { value: "completed", label: "Completed" },
                    { value: "closed", label: "Closed" },
                  ]}
                  placeholder="Select status"
                />
              </div>

              <div className="min-w-[150px]">
                <SimpleDropdown
                  value={priorityFilter || ""}
                  onValueChange={setPriorityFilter}
                  options={[
                    { value: "all", label: "All Priority" },
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                    { value: "urgent", label: "Urgent" },
                  ]}
                  placeholder="Select priority"
                />
              </div>

              <Button
                variant={assignedToMeOnly ? "default" : "outline"}
                onClick={() => setAssignedToMeOnly(!assignedToMeOnly)}
                className="whitespace-nowrap"
              >
                <User className="w-4 h-4 mr-2" />
                My Tasks
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="large" message="Loading tasks..." />
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchTerm ||
                statusFilter !== "all" ||
                priorityFilter !== "all"
                  ? "No tasks match your search criteria."
                  : "No tasks found."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <DndProvider backend={HTML5Backend}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* To Do Column */}
              <DroppableKanbanColumn
                title="To Do"
                status="open"
                tasks={todoTasks}
                updatingTasks={updatingTasks}
                onStatusUpdate={handleStatusUpdate}
                onIndividualTaskUpdate={updateIndividualTask}
              />

              {/* In Progress Column */}
              <DroppableKanbanColumn
                title="In Progress"
                status="in_progress"
                tasks={inProgressTasks}
                updatingTasks={updatingTasks}
                onStatusUpdate={handleStatusUpdate}
                onIndividualTaskUpdate={updateIndividualTask}
              />

              {/* Done Column */}
              <DroppableKanbanColumn
                title="Done"
                status="completed"
                tasks={doneTasks}
                updatingTasks={updatingTasks}
                onStatusUpdate={handleStatusUpdate}
                onIndividualTaskUpdate={updateIndividualTask}
              />
            </div>
          </DndProvider>
        )}
      </div>
    </div>
  );
}
