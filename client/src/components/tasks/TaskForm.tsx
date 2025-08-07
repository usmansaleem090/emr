import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import RichTextEditor from "@/components/UI/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Label } from "@/components/UI/label";
import { toast } from "@/hooks/use-toast";
import { api } from "@/utils/apiClient";
import { useAppSelector } from "@/redux/hooks";
import { ArrowLeft, Save, User, Upload, X } from "lucide-react";
import { Link } from "wouter";
import { SimpleDropdown } from "../UI/SimpleDropdown";

interface AssignableUser {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  userType: string;
}

interface TaskFormData {
  title: string;
  description: string;
  status: "open" | "in_progress" | "completed" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo?: number;
  startDate?: string;
  dueDate?: string;
}

interface TaskFormProps {
  onSuccess: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSuccess }) => {
  const { user } = useAppSelector((state: any) => state.auth);
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    status: "open",
    priority: "medium",
    startDate: "",
    dueDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Loads assignable users for the current clinic
   * Used for the "Assign To" dropdown
   */
  const loadAssignableUsers = async () => {
    if (!user?.clinicId) return;

    try {
      console.log(
        "TaskForm - Loading assignable users for clinic:",
        user.clinicId
      );
      const response = await api.get(
        `/api/tasks/assignable-users/${user.clinicId}`
      );
      console.log("TaskForm - Assignable users response:", response.data);

      // Handle different response structures
      let usersData = [];
      if (response.data?.data) {
        usersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data?.users) {
        usersData = response.data.users;
      }

      console.log("TaskForm - Assignable users extracted:", usersData);
      setAssignableUsers(usersData);
    } catch (error: any) {
      console.error("TaskForm - Failed to load assignable users:", error);
      toast({
        title: "Error",
        description: "Failed to load assignable users.",
        variant: "destructive",
      });
    }
  };

  /**
   * Handles file selection via file input
   * Adds selected files to the files state
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      console.log("TaskForm - Files selected via input:", selectedFiles);
      setFiles((prev) => {
        const newFiles = [...prev, ...selectedFiles];
        console.log("TaskForm - Updated files state:", newFiles);
        return newFiles;
      });
    }
  };

  /**
   * Handles file drop via drag and drop
   * Adds dropped files to the files state
   */
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    console.log("TaskForm - Files dropped:", droppedFiles);
    setFiles((prev) => {
      const newFiles = [...prev, ...droppedFiles];
      console.log("TaskForm - Updated files state after drop:", newFiles);
      return newFiles;
    });
  };

  /**
   * Removes a file from the files state
   * @param index - Index of the file to remove
   */
  const removeFile = (index: number) => {
    console.log("TaskForm - Removing file at index:", index);
    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      console.log("TaskForm - Updated files state after removal:", newFiles);
      return newFiles;
    });
  };

  useEffect(() => {
    if (user?.clinicId) {
      loadAssignableUsers();
    }
  }, [user?.clinicId]);

  /**
   * Handles form submission for creating a new task
   * Supports both JSON (no files) and FormData (with files) submissions
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);

      // Debug: Log current state
      console.log("TaskForm - Files count:", files.length);
      console.log("TaskForm - Form data:", formData);

      if (files.length > 0) {
        // CASE 1: Files present - Use FormData for multipart upload
        console.log("TaskForm - Using FormData submission with files");

        const formDataToSend = new FormData();

        // Add all form fields to FormData
        formDataToSend.append("title", formData.title.trim());
        formDataToSend.append("description", formData.description.trim() || "");
        formDataToSend.append("status", formData.status);
        formDataToSend.append("priority", formData.priority);

        // Add optional fields if they exist
        if (formData.assignedTo) {
          formDataToSend.append("assignedTo", formData.assignedTo.toString());
        }
        if (formData.startDate) {
          formDataToSend.append("startDate", formData.startDate);
        }
        if (formData.dueDate) {
          formDataToSend.append("dueDate", formData.dueDate);
        }

        // Add all files to FormData
        files.forEach((file, index) => {
          console.log(
            `TaskForm - Adding file ${index + 1}:`,
            file.name,
            file.size,
            file.type
          );
          formDataToSend.append("files", file);
        });

        // Debug: Log FormData contents
        console.log("TaskForm - FormData entries:");
        Array.from(formDataToSend.entries()).forEach(([key, value]) => {
          console.log(`  ${key}:`, value);
        });

        // Send FormData without setting Content-Type (browser will set it with boundary)
        const response = await api.post("/api/tasks", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log(
          "TaskForm - FormData submission successful:",
          response.data
        );
      } else {
        // CASE 2: No files - Use JSON for faster processing
        console.log("TaskForm - Using JSON submission (no files)");

        const jsonPayload = {
          title: formData.title.trim(),
          description: formData.description.trim() || "",
          status: formData.status,
          priority: formData.priority,
          assignedTo: formData.assignedTo || undefined,
          startDate: formData.startDate || undefined,
          dueDate: formData.dueDate || undefined,
        };

        console.log("TaskForm - JSON payload:", jsonPayload);

        const response = await api.post("/api/tasks", jsonPayload, {
          headers: { "Content-Type": "application/json" },
        });
        console.log("TaskForm - JSON submission successful:", response.data);
      }

      // Success handling
      if (onSuccess) onSuccess();

      toast({
        title: "Success",
        description: "Task created successfully.",
      });

      // Navigate back to tasks list
      setTimeout(() => {
        setLocation("/tasks");
      }, 500);
    } catch (error: any) {
      // Error handling with detailed logging
      console.error("TaskForm - Failed to create task:", error);
      console.error("TaskForm - Error response:", error.response?.data);
      console.error("TaskForm - Error status:", error.response?.status);

      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create task.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format user name for display
  const formatUserName = (user: AssignableUser) => {
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return name || user.email;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Summary *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter task title..."
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <RichTextEditor
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="Enter task description..."
          className="min-h-[120px]"
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <SimpleDropdown
          value={formData.status}
          onValueChange={(
            value: "open" | "in_progress" | "completed" | "closed"
          ) => setFormData({ ...formData, status: value })}
          options={[
            { value: "open", label: "Open" },
            { value: "in_progress", label: "In Progress" },
            { value: "completed", label: "Completed" },
            { value: "closed", label: "Closed" },
          ]}
          placeholder="Select status"
          label="Status"
        />
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <SimpleDropdown
          value={formData.priority}
          onValueChange={(value: "low" | "medium" | "high" | "urgent") =>
            setFormData({ ...formData, priority: value })
          }
          options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "urgent", label: "Urgent" },
          ]}
          placeholder="Select priority"
          label="Priority"
        />
      </div>

      {/* Assigned To */}
      <div className="space-y-2">
        <SimpleDropdown
          value={formData.assignedTo?.toString() || "unassigned"}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              assignedTo: value === "unassigned" ? undefined : parseInt(value),
            })
          }
          options={assignableUsers.map((user) => ({
            value: user.id.toString(),
            label: formatUserName(user),
            description: user.userType,
            icon: <User className="w-4 h-4" />,
          }))}
          placeholder="Select assignee (optional)"
          label="Assign To"
        />

        {/* <Label>Assign To</Label>
        <Select
          value={formData.assignedTo?.toString() || "unassigned"}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              assignedTo: value === "unassigned" ? undefined : parseInt(value),
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select assignee (optional)">
              {formData.assignedTo && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {formatUserName(
                    assignableUsers.find((u) => u.id === formData.assignedTo)!
                  )}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {assignableUsers.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{formatUserName(user)}</div>
                    <div className="text-xs text-gray-500">{user.userType}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
      </div>

      {/* Date Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            placeholder="Select start date"
          />
        </div>
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
            placeholder="Select due date"
          />
        </div>
      </div>

      {/* File Upload Field */}
      <div className="space-y-2 w-full">
        <Label className="pb-2">Attachments</Label>
        <div
          className="border border-dashed border-gray-400 p-6 rounded-md text-center hover:border-blue-500 transition-colors"
          onDrop={(e) => {
            e.preventDefault();
            handleFileDrop(e);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">
            Drag & drop files here, or click to select
          </p>
          <input
            type="file"
            multiple
            name="files"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 cursor-pointer"
          >
            Choose Files
          </label>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Selected Files:</p>
            <div className="space-y-1">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                >
                  <span className="text-sm text-gray-700 truncate">
                    {file.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Link href="/tasks">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </div>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Create Task
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
