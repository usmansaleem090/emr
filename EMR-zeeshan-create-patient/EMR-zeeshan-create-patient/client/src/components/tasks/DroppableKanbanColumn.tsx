import React from "react";
import { useDrop } from "react-dnd";
import { DraggableTaskCard } from "./DraggableTaskCard";
import { CommonModal } from "../UI/CommonModal";
import { TaskDetailContent } from "./TasksDetail";

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

interface DroppableKanbanColumnProps {
  title: string;
  status: "open" | "in_progress" | "completed" | "closed";
  tasks: TaskWithDetails[];
  updatingTasks: Set<number>;
  onStatusUpdate: (taskId: number, newStatus: string) => void;
  onIndividualTaskUpdate?: (
    taskId: number,
    updatedTask: TaskWithDetails
  ) => void;
}

const ITEM_TYPE = "TASK";

export const DroppableKanbanColumn: React.FC<DroppableKanbanColumnProps> = ({
  title,
  status,
  tasks,
  updatingTasks,
  onStatusUpdate,
  onIndividualTaskUpdate,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { id: number; status: string }) => {
      if (item.status !== status) {
        onStatusUpdate(item.id, status);
      }
    },
    canDrop: (item: { id: number; status: string }) => item.status !== status,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // const handleTaskClick = (task: TaskWithDetails) => {
  //   // This will be handled by the parent component
  // };

  return (
    <div className="rounded-lg bg-[#eeeeee] shadow-md">
      <div className="p-4">
        <p className="text-base text-[#717171] font-bold">
          {title}{" "}
          <span className="px-2 py-1 text-sm text-[#373737] rounded bg-[#dad9d9]">
            {tasks?.length || 0}
          </span>
        </p>
      </div>

      <div
        ref={drop}
        className={`min-h-[60vh] max-h-[70vh] overflow-y-auto p-4 space-y-4 transition-all duration-200 ${
          isOver && canDrop
            ? "bg-blue-50 border-2 border-dashed border-blue-300 scale-[1.02]"
            : isOver
            ? "bg-gray-50 border-2 border-dashed border-gray-300"
            : ""
        }`}
      >
        {tasks.map((task) => (
          <CommonModal
            key={task.id}
            title={task?.title || "Task Detail"}
            trigger={
              <div onClick={(e) => e.stopPropagation()}>
                <DraggableTaskCard
                  task={task}
                  isUpdating={updatingTasks.has(task.id)}
                  onStatusUpdate={onStatusUpdate}
                />
              </div>
            }
            minWidth="90%"
          >
            <TaskDetailContent task={task} />
          </CommonModal>
        ))}

        {isOver && canDrop && (
          <div className="text-center py-4 text-blue-600 font-medium animate-pulse">
            Drop here to move to {title}
          </div>
        )}
      </div>
    </div>
  );
};
