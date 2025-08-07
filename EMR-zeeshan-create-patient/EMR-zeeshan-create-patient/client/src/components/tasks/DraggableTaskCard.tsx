import React from "react";
import { useDrag } from "react-dnd";
import { Card, CardContent } from "@/components/UI/card";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import { LoadingSpinner } from "../UI/LoadingSpinner";
import {
  MoreVertical,
  PlayCircle,
  Clock,
  CheckCircle2,
  XCircle,
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

interface DraggableTaskCardProps {
  task: TaskWithDetails;
  isUpdating: boolean;
  onStatusUpdate: (taskId: number, newStatus: string) => void;
}

const ITEM_TYPE = "TASK";

export const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  isUpdating,
  onStatusUpdate,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
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
    <div
      ref={drag}
      className={`transition-all duration-200 ${
        isDragging ? "opacity-50 scale-105 rotate-1" : ""
      }`}
    >
      <Card
        className={`bg-white shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition relative ${
          isUpdating ? "opacity-75 pointer-events-none" : ""
        } ${isDragging ? "shadow-lg" : ""}`}
      >
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
                        onStatusUpdate(task.id, statusOption.value);
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
                ? task.description.replace(/<[^>]*>/g, "").substring(0, 100) +
                  (task.description.length > 100 ? "..." : "")
                : "No description",
            }}
          />

          <Badge
            className={`w-fit capitalize ${getPriorityClass(task.priority)}`}
          >
            {task.priority}
          </Badge>
          <div className="text-xs text-muted-foreground">
            {task.assignedToUser?.firstName ?? "Unassigned"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
