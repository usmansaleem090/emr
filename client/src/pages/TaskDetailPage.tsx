import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import RichTextEditor from '@/components/UI/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Label } from '@/components/UI/label';
import { Separator } from '@/components/UI/separator';
import { toast } from '@/hooks/use-toast';
import { api } from '@/utils/apiClient';
import { useAppSelector } from '@/redux/hooks';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  Trash2, 
  User, 
  Calendar, 
  MessageSquare, 
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PlayCircle
} from 'lucide-react';
import { Link } from 'wouter';

interface TaskWithDetails {
  id: number;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
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

interface AssignableUser {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  userType: string;
}

export default function TaskDetailPage() {
  const { user } = useAppSelector((state: any) => state.auth);
  const [, params] = useRoute('/tasks/:id');
  const [, setLocation] = useLocation();
  const taskId = params?.id ? parseInt(params.id) : null;
  
  const [task, setTask] = useState<TaskWithDetails | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'open' as 'open' | 'in_progress' | 'completed' | 'closed',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assignedTo: undefined as number | undefined,
    startDate: '',
    dueDate: '',
  });

  // Load task details
  const loadTask = async () => {
    if (!taskId) return;
    
    try {
      setIsLoading(true);
      console.log('Loading task with ID:', taskId);
      const response = await api.get(`/api/tasks/${taskId}`);
      console.log('Task API response:', response.data);
      
      // Handle different response structures
      let taskData = null;
      if (response.data?.data) {
        taskData = response.data.data;
      } else if (response.data && response.data.id) {
        taskData = response.data;
      }
      
      console.log('Task data extracted:', taskData);
      
      if (taskData) {
        setTask(taskData);
        setEditForm({
          title: taskData.title,
          description: taskData.description || '',
          status: taskData.status,
          priority: taskData.priority,
          assignedTo: taskData.assignedTo,
          startDate: taskData.startDate || '',
          dueDate: taskData.dueDate || '',
        });
      }
    } catch (error: any) {
      console.error('Failed to load task:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load task.",
        variant: "destructive",
      });
      if (error.response?.status === 404) {
        setLocation('/tasks');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load task comments
  const loadComments = async () => {
    if (!taskId) return;
    
    try {
      console.log('Loading comments for task:', taskId);
      const response = await api.get(`/api/tasks/${taskId}/comments`);
      console.log('Comments API response:', response.data);
      
      // Handle different response structures
      let commentsData = [];
      if (response.data?.data) {
        commentsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        commentsData = response.data;
      }
      
      console.log('Comments data extracted:', commentsData);
      setComments(commentsData);
    } catch (error: any) {
      console.error('Failed to load comments:', error);
    }
  };

  // Load assignable users
  const loadAssignableUsers = async () => {
    if (!user?.clinicId) return;
    
    try {
      console.log('Loading assignable users for clinic:', user.clinicId);
      const response = await api.get(`/api/tasks/assignable-users/${user.clinicId}`);
      console.log('Assignable users response:', response.data);
      
      // Handle different response structures
      let usersData = [];
      if (response.data?.data) {
        usersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        usersData = response.data;
      }
      
      console.log('Assignable users extracted:', usersData);
      setAssignableUsers(usersData);
    } catch (error: any) {
      console.error('Failed to load assignable users:', error);
    }
  };

  useEffect(() => {
    if (taskId) {
      loadTask();
      loadComments();
      loadAssignableUsers();
    }
  }, [taskId, user?.clinicId]);

  // Handle task update
  const handleSave = async () => {
    if (!taskId) return;

    try {
      setIsSaving(true);
      const updateData = {
        title: editForm.title.trim(),
        description: editForm.description.trim() || undefined,
        status: editForm.status,
        priority: editForm.priority,
        assignedTo: editForm.assignedTo,
      };

      await api.put(`/api/tasks/${taskId}`, updateData);
      
      toast({
        title: "Success",
        description: "Task updated successfully.",
      });
      
      setIsEditing(false);
      // Small delay before reloading to ensure update is completed
      setTimeout(async () => {
        await loadTask(); // Reload task to get updated data
      }, 300);
    } catch (error: any) {
      console.error('Failed to update task:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update task.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle task deletion
  const handleDelete = async () => {
    if (!taskId || !confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await api.delete(`/api/tasks/${taskId}`);
      
      toast({
        title: "Success",
        description: "Task deleted successfully.",
      });
      
      setLocation('/tasks');
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete task.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle adding comment
  const handleAddComment = async () => {
    if (!taskId || !newComment.trim()) return;

    try {
      setIsAddingComment(true);
      await api.post(`/api/tasks/${taskId}/comments`, {
        commentText: newComment.trim(),
      });
      
      setNewComment('');
      await loadComments(); // Reload comments
      await loadTask(); // Reload task to update comment count
      
      toast({
        title: "Success",
        description: "Comment added successfully.",
      });
    } catch (error: any) {
      console.error('Failed to add comment:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add comment.",
        variant: "destructive",
      });
    } finally {
      setIsAddingComment(false);
    }
  };

  // Status badge component
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: 'bg-blue-100 text-blue-800', icon: PlayCircle },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      closed: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  // Priority badge component
  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium}>
        {priority}
      </Badge>
    );
  };

  // Format user name
  const formatUserName = (user: { firstName: string | null; lastName: string | null; email: string }) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Task Not Found</h2>
        <p className="text-gray-600 mb-4">The requested task could not be found.</p>
        <Link href="/tasks">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Link href="/tasks">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tasks
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Details</h1>
            <p className="text-sm text-gray-600">
              Created on {formatDate(task.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={isDeleting}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700"
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    title: task.title,
                    description: task.description || '',
                    status: task.status,
                    priority: task.priority,
                    assignedTo: task.assignedTo,
                    startDate: task.startDate || '',
                    dueDate: task.dueDate || '',
                  });
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Task Information</CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(isEditing ? editForm.status : task.status)}
                  {getPriorityBadge(isEditing ? editForm.priority : task.priority)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label>Title</Label>
                {isEditing ? (
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Task title..."
                  />
                ) : (
                  <p className="text-lg font-medium">{task.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                {isEditing ? (
                  <RichTextEditor
                    value={editForm.description}
                    onChange={(value) => setEditForm({ ...editForm, description: value })}
                    placeholder="Task description..."
                    className="min-h-[120px]"
                  />
                ) : (
                  <div 
                    className="text-gray-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: task.description || '<p class="text-gray-500 italic">No description provided.</p>' 
                    }}
                  />
                )}
              </div>

              {/* Status and Priority (Edit Mode) */}
              {isEditing && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editForm.status || ''}
                      onValueChange={(value: 'open' | 'in_progress' | 'completed' | 'closed') => 
                        setEditForm({ ...editForm, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={editForm.priority || ''}
                      onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                        setEditForm({ ...editForm, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Assigned To (Edit Mode) */}
              {isEditing && (
                <div className="space-y-2">
                  <Label>Assigned To</Label>
                  <Select
                    value={editForm.assignedTo?.toString() || 'unassigned'}
                    onValueChange={(value) => 
                      setEditForm({ 
                        ...editForm, 
                        assignedTo: value === 'unassigned' ? undefined : parseInt(value) 
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee (optional)" />
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
                  </Select>
                </div>
              )}

              {/* Date Fields (Edit Mode) */}
              {isEditing && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={editForm.startDate}
                      onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                      placeholder="Select start date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={editForm.dueDate}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                      placeholder="Select due date"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment */}
              <div className="space-y-3">
                <RichTextEditor
                  value={newComment}
                  onChange={(value) => setNewComment(value)}
                  placeholder="Add a comment..."
                  className="min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isAddingComment}
                    size="sm"
                  >
                    {isAddingComment ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Add Comment
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No comments yet.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-sm">
                            {formatUserName(comment.user)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <div 
                        className="text-gray-700 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: comment.commentText }}
                      />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Meta */}
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Created by</div>
                    <div className="text-gray-600">{formatUserName(task.createdByUser)}</div>
                  </div>
                </div>

                {task.assignedToUser && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="font-medium">Assigned to</div>
                      <div className="text-gray-600">{formatUserName(task.assignedToUser)}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Created</div>
                    <div className="text-gray-600">{formatDate(task.createdAt)}</div>
                  </div>
                </div>

                {task.updatedAt !== task.createdAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="font-medium">Last updated</div>
                      <div className="text-gray-600">{formatDate(task.updatedAt)}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}