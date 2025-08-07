import React, { useEffect, useState } from "react";
import { api } from "@/utils/apiClient";
import RichTextEditor from "@/components/UI/rich-text-editor";
import { Button } from "@/components/UI/button";
import { Separator } from "@/components/UI/separator";
import {
  User,
  Send,
  MessageSquare,
  Calendar,
  Eye,
  Lock,
  Share2,
  MoreVertical,
  X,
  Plus,
  Camera,
  Settings,
  ChevronUp,
  ChevronDown,
  Zap,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PlayCircle,
  History,
  Edit,
  UserPlus,
  UserMinus,
  Tag,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/UI/card";
import { toast } from "@/hooks/use-toast";
import { Badge } from "../UI/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Avatar, AvatarFallback } from "@/components/UI/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/UI/collapsible";
import moment from "moment";
import { SimpleDropdown } from "../UI/SimpleDropdown";

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
  startDate?: string;
  dueDate?: string;
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

interface TaskComment {
  id: number;
  taskId: number;
  commentedBy: number;
  commentText: string;
  createdAt: string;
  user: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface TaskHistory {
  id: number;
  taskId: number;
  changedBy: number;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
  changedByUser: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface Props {
  task: TaskWithDetails;
}

export const TaskDetailContent: React.FC<Props> = ({ task }) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [newComment, setNewComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

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

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "open":
        return {
          label: "Open",
          color: "bg-blue-100 text-blue-800",
          icon: PlayCircle,
        };
      case "in_progress":
        return {
          label: "In Progress",
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock,
        };
      case "completed":
        return {
          label: "Completed",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle2,
        };
      case "closed":
        return {
          label: "Closed",
          color: "bg-gray-100 text-gray-800",
          icon: XCircle,
        };
      default:
        return {
          label: "Open",
          color: "bg-blue-100 text-blue-800",
          icon: PlayCircle,
        };
    }
  };

  const formatUserName = (user: any) =>
    user.firstName || user.lastName
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : user.email;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString();

  const getInitials = (user: any) => {
    const name = formatUserName(user);
    return name
      .split(" ")
      .map((n: any) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return "📄";
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.includes("pdf")) return "📕";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📘";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return "📗";
    if (mimeType.includes("text")) return "📄";
    return "📎";
  };

  const handleFileDownload = async (attachment: TaskAttachment) => {
    try {
      setDownloadingFile(attachment.fileName);

      // Create a download link
      const link = document.createElement("a");
      link.href = `/api/tasks/attachments/${attachment.id}/download`;
      link.download = attachment.fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `${attachment.fileName} is being downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingFile(null);
    }
  };

  /**
   * Calculates the total size of all attachments
   */
  const getTotalAttachmentsSize = () => {
    if (!task.attachments || task.attachments.length === 0) return 0;
    return task.attachments.reduce(
      (total, attachment) => total + (attachment.fileSize || 0),
      0
    );
  };

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const res = await api.get(`/api/tasks/${task.id}/comments`);
      setComments(res.data?.data || res.data || []);
    } catch (error: any) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get(`/api/tasks/${task.id}/history`);
      setHistory(res.data?.data || res.data || []);
    } catch (error: any) {
      console.error("Failed to load history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getHistoryActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <Plus className="w-4 h-4 text-green-600" />;
      case "status_changed":
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      case "edited":
        return <Edit className="w-4 h-4 text-orange-600" />;
      case "assigned":
        return <UserPlus className="w-4 h-4 text-purple-600" />;
      case "unassigned":
        return <UserMinus className="w-4 h-4 text-red-600" />;
      case "priority_changed":
        return <Tag className="w-4 h-4 text-indigo-600" />;
      default:
        return <History className="w-4 h-4 text-gray-600" />;
    }
  };

  const getHistoryActionText = (action: string, fieldName?: string) => {
    switch (action) {
      case "created":
        return "Task created";
      case "status_changed":
        return `Status changed from ${fieldName === "status" ? "old" : ""} to ${
          fieldName === "status" ? "new" : ""
        }`;
      case "edited":
        return `${
          fieldName
            ? fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
            : "Field"
        } updated`;
      case "assigned":
        return "Task assigned";
      case "unassigned":
        return "Task unassigned";
      case "priority_changed":
        return "Priority changed";
      default:
        return "Action performed";
    }
  };

  const getHistoryDisplayValue = (fieldName: string, value: string) => {
    switch (fieldName) {
      case "status":
        return value.charAt(0).toUpperCase() + value.slice(1).replace("_", " ");
      case "priority":
        return value.charAt(0).toUpperCase() + value.slice(1);
      case "assignedTo":
        return value === "" ? "Unassigned" : `User ID: ${value}`;
      case "startDate":
      case "dueDate":
        return value ? moment(value).format("MMM D, YYYY") : "Not set";
      default:
        return value;
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      setAddingComment(true);
      await api.post(`/api/tasks/${task.id}/comments`, {
        commentText: newComment.trim(),
      });
      setNewComment("");
      await loadComments();
      toast({ title: "Comment added." });
    } catch (error: any) {
      toast({
        title: "Failed to add comment",
        description: error.response?.data?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setAddingComment(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.patch(`/api/tasks/${task.id}/status`, { status: newStatus });
      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
      // Trigger a page refresh or update the task data
      window.location.reload();
    } catch (error: any) {
      console.error("Failed to update task status:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update task status.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadComments();
    loadHistory();
  }, []);

  const statusInfo = getStatusDisplay(task.status);

  return (
    <div className="flex h-full">
      {/* Main Content Area (Left Panel) */}
      <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto">
        {/* Description Section */}
        <div className="mb-8">
          <h3 className="text-sm text-gray-700 mb-3 font-bold">Description</h3>
          <div
            className="text-gray-800 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html:
                task.description ||
                '<p class="text-gray-500 italic">No description provided.</p>',
            }}
          />
        </div>

        {/* Activity Tabs */}
        <div className="mb-6">
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comments">
                Comments ({comments.length})
              </TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="mt-4">
              {/* Comments Section */}
              <div className="space-y-4">
                {/* New Comment */}
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(task.createdByUser)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <RichTextEditor
                      value={newComment}
                      onChange={(value) => setNewComment(value)}
                      placeholder="Add a comment..."
                      className="min-h-[120px]"
                    />

                    <div className="flex justify-end mt-3">
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || addingComment}
                        size="sm"
                      >
                        {addingComment ? (
                          <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Add Comment
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                {loadingComments ? (
                  <p className="text-gray-500">Loading comments...</p>
                ) : comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No comments yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(comment.user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {formatUserName(comment.user)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <div
                            className="text-gray-700 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: comment.commentText,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              {/* History Section */}
              <div className="space-y-4">
                {loadingHistory ? (
                  <p className="text-gray-500">Loading history...</p>
                ) : history.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No history available.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {history.map((entry) => (
                      <div key={entry.id} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(entry.changedByUser)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {formatUserName(entry.changedByUser)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(entry.createdAt)}
                            </span>
                            <div className="flex items-center gap-1">
                              {getHistoryActionIcon(entry.action)}
                              <span className="text-sm text-gray-600">
                                {getHistoryActionText(
                                  entry.action,
                                  entry.fieldName
                                )}
                              </span>
                            </div>
                          </div>
                          {entry.fieldName &&
                            entry.oldValue !== undefined &&
                            entry.newValue !== undefined && (
                              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">
                                    Changed:
                                  </span>
                                  <span className="line-through text-red-600">
                                    {getHistoryDisplayValue(
                                      entry.fieldName,
                                      entry.oldValue
                                    )}
                                  </span>
                                  <span className="text-gray-400">→</span>
                                  <span className="text-green-600 font-medium">
                                    {getHistoryDisplayValue(
                                      entry.fieldName,
                                      entry.newValue
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Sidebar (Right Panel) */}
      <div className="w-80 p-6 bg-gray-50 overflow-y-auto">
        {/* Status Section */}
        <div className="mb-6">
          <div className=" mb-3 w-min-[150px]">
            <SimpleDropdown
              value={task.status}
              onValueChange={handleStatusChange}
              options={[
                { value: "open", label: "Open" },
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
                { value: "closed", label: "Closed" },
              ]}
              placeholder="Select status"
            />
          </div>
        </div>

        {/* Details Section */}
        <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <div className="bg-white rounded border">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-3 border-b cursor-pointer">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Details</span>
                </div>
                {isDetailsOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-3 space-y-4">
                {/* Assignee */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Assignee</span>
                  <div className="flex items-center gap-2">
                    {task.assignedToUser ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          {" "}
                          {/* Add padding here */}
                          <AvatarFallback className="text-xs">
                            {getInitials(task.assignedToUser)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {formatUserName(task.assignedToUser)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Unassigned</span>
                    )}
                  </div>
                </div>

                {/* Priority */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Priority</span>
                  <Badge
                    className={`capitalize ${getPriorityClass(task.priority)}`}
                  >
                    {task.priority}
                  </Badge>
                </div>

                {/* Parent */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Parent</span>
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800"
                  >
                    ⚡ {task.clinic.name}
                  </Badge>
                </div>

                {/* Start Date */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Start date</span>
                  {
                    <span className="text-sm text-gray-800">
                      {task?.startDate
                        ? moment(task.startDate).format("D MMM YYYY")
                        : "N/A"}
                    </span>
                  }
                </div>

                {/* Due Date */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Due date</span>
                  {
                    <span className="text-sm text-gray-800">
                      {task?.dueDate
                        ? moment(task.dueDate).format("D MMM YYYY")
                        : "N/A"}
                    </span>
                  }
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Attachments Section */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="mt-6">
            <div className="bg-white rounded border">
              <div className="p-3 border-b">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span className="font-medium">Attachments</span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(getTotalAttachmentsSize())}
                    </span>
                    <Badge variant="secondary">{task.attachments.length}</Badge>
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-2">
                {task.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className={`flex items-center gap-3 p-2 rounded border transition-colors ${
                      downloadingFile === attachment.fileName
                        ? "bg-blue-50 border-blue-200 cursor-wait"
                        : "hover:bg-gray-50 cursor-pointer"
                    }`}
                    onClick={() => {
                      if (downloadingFile !== attachment.fileName) {
                        handleFileDownload(attachment);
                      }
                    }}
                    title={
                      downloadingFile === attachment.fileName
                        ? "Downloading..."
                        : `Download ${attachment.fileName}`
                    }
                  >
                    <span className="text-lg">
                      {downloadingFile === attachment.fileName ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      ) : (
                        getFileIcon(attachment.mimeType)
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {attachment.fileName}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {downloadingFile === attachment.fileName
                        ? "Downloading..."
                        : "Click to download"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Attachments Message */}
        {(!task.attachments || task.attachments.length === 0) && (
          <div className="mt-6">
            <div className="bg-white rounded border p-4 text-center">
              <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">No attachments</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
