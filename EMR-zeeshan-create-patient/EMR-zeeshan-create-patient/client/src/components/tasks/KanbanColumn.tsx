import React, { useState } from "react";
import { Card, CardContent } from "@/components/UI/card";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import { TaskDetailContent } from "./TasksDetail";
import { CommonModal } from "../UI/CommonModal";
import { LoadingSpinner } from "../UI/LoadingSpinner";
import {
  MoreVertical,
  PlayCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  Paperclip,
} from "lucide-react";
import { api } from "@/utils/apiClient";
import { toast } from "@/hooks/use-toast";

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

interface KanbanColumnProps {
  title: string;
  tasks: TaskWithDetails[];
  onTaskUpdate?: () => void;
  onIndividualTaskUpdate?: (taskId: number, updatedTask: TaskWithDetails) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  tasks,
  onTaskUpdate,
  onIndividualTaskUpdate,
}) => {
  const [updatingTasks, setUpdatingTasks] = useState<Set<number>>(new Set());
  
  console.log('KanbanColumn props:', { 
    title, 
    tasksCount: tasks.length, 
    hasOnTaskUpdate: !!onTaskUpdate, 
    hasOnIndividualTaskUpdate: !!onIndividualTaskUpdate 
  });

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusUpdate = async (taskId: number, newStatus: string) => {
    // Add task to updating set
    setUpdatingTasks(prev => new Set(prev).add(taskId));
    
    try {
      const response = await api.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
      
      console.log('Status update response:', response);
      
      // Always try individual update first if callback is available
      if (onIndividualTaskUpdate && response.data?.success && response.data?.data) {
        console.log('Using individual task update');
        const updatedTask = response.data.data;
        onIndividualTaskUpdate(taskId, updatedTask);
      } else if (onIndividualTaskUpdate) {
        // If we have the callback but no data, create a minimal update
        console.log('Creating minimal task update');
        const currentTask = tasks.find(t => t.id === taskId);
        if (currentTask) {
          const minimalUpdate = { ...currentTask, status: newStatus as "open" | "in_progress" | "completed" | "closed" };
          onIndividualTaskUpdate(taskId, minimalUpdate);
        } else {
          console.log('Task not found, using full refresh');
          if (onTaskUpdate) {
            onTaskUpdate();
          }
        }
      } else {
        console.log('Using full refresh fallback');
        // Fallback to full refresh
        if (onTaskUpdate) {
          onTaskUpdate();
        }
      }
      
      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    } catch (error: any) {
      console.error("Failed to update task status:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update task status",
        variant: "destructive",
      });
    } finally {
      // Remove task from updating set
      setUpdatingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
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
      console.error("KanbanColumn - Download failed:", error);
      toast({
        title: "Download Failed",
        description: "Unable to download the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  /**
   * Formats file size for display
   */
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getStatusOptions = (currentStatus: string) => {
    const allStatuses = [
      { value: "open", label: "Open", icon: PlayCircle },
      { value: "in_progress", label: "In Progress", icon: Clock },
      { value: "completed", label: "Completed", icon: CheckCircle2 },
      { value: "closed", label: "Closed", icon: XCircle },
    ];

    return allStatuses.filter((status) => status.value !== currentStatus);
  };

  return (
    <div className=" rounded-lg  bg-[#eeeeee] shadow-md">
      <div className="p-4">
        <p className="text-base  text-[#717171] font-bold">
          {title}{" "}
          <span className="px-2 py-1 text-sm text-[#373737] rounded bg-[#dad9d9]">
            {tasks?.length || 0}
          </span>
        </p>
      </div>

      <div className="min-h-[60vh] max-h-[70vh] overflow-y-auto p-4 space-y-4">
        {tasks.map((task) => {
          const isUpdating = updatingTasks.has(task.id);
          
          return (
            <CommonModal
              key={task.id}
              title={task?.title || "Task Detail"}
              trigger={
                <Card className={`bg-white shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition relative ${
                  isUpdating ? 'opacity-75 pointer-events-none' : ''
                }`}>
                  {isUpdating && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                      <LoadingSpinner size="small" message="Updating..." />
                    </div>
                  )}
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold flex-1">{task.title}</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-gray-100"
                            onClick={(e) => e.stopPropagation()}
                            disabled={isUpdating}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {getStatusOptions(task.status).map((statusOption) => {
                            const IconComponent = statusOption.icon;
                            return (
                              <DropdownMenuItem
                                key={statusOption.value}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(task.id, statusOption.value);
                                }}
                                className="flex items-center gap-2"
                                disabled={isUpdating}
                              >
                                <IconComponent className="w-4 h-4" />
                                {statusOption.label}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div
                      className="text-sm text-gray-600 truncate prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: task.description
                          ? task.description
                              .replace(/<[^>]*>/g, "")
                              .substring(0, 100) +
                            (task.description.length > 100 ? "..." : "")
                          : "No description",
                      }}
                    />

                    <Badge
                      className={`w-fit capitalize ${getPriorityClass(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {task.assignedToUser?.firstName ?? "Unassigned"}
                    </div>
                  </CardContent>
                </Card>
              }
              minWidth="90%"
            >
              <TaskDetailContent task={task} />
            </CommonModal>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanColumn;
