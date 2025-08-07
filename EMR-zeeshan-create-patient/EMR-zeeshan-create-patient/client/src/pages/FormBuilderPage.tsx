import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faShare,
  faCopy,
  faSearch,
  faFilter,
  faDownload,
  faFileAlt,
  faUsers,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { apiClient } from '@/utils/apiClient';
import { useToastNotification } from '@/hooks/useToastNotification';
import FormTemplateBuilder from '@/components/forms/FormTemplateBuilder';
import FormSubmissionsTable from '@/components/forms/FormSubmissionsTable';
import FormSubmissionModal from '@/components/forms/FormSubmissionModal';

interface FormTemplate {
  id: number;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: string;
  createdBy: number;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'date' | 'checkbox' | 'radio' | 'select';
  required: boolean;
  options?: string[];
}

interface FormSubmission {
  id: number;
  formTemplateId: number;
  values: { key: string; value: any }[];
  userId: number;
  submittedAt: string;
  template?: FormTemplate;
}

const FormBuilderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);
  
  const { showSuccess, showError } = useToastNotification();

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/form-templates');
      if (response.data.success) {
        setTemplates(response.data.data);
      }
    } catch (error) {
      showError('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/form-submissions');
      if (response.data.success) {
        setSubmissions(response.data.data);
      }
    } catch (error) {
      showError('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchSubmissions();
  }, []);

  const handleDeleteTemplate = async (id: number) => {
    try {
      await apiClient.delete(`/form-templates/${id}`);
      showSuccess('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      showError('Failed to delete template');
    }
  };

  const handleViewSubmission = async (submission: FormSubmission) => {
    try {
      const response = await apiClient.get(`/form-submissions/${submission.id}`);
      if (response.data.success) {
        setSelectedSubmission(response.data.data);
        setShowSubmissionModal(true);
      }
    } catch (error) {
      showError('Failed to fetch submission details');
    }
  };

  const handleShareTemplate = (template: FormTemplate) => {
    const shareUrl = `${window.location.origin}/forms/${template.id}/fill`;
    navigator.clipboard.writeText(shareUrl);
    showSuccess('Share link copied to clipboard');
  };

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      title: 'Total Templates',
      value: templates.length,
      icon: faFileAlt,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Submissions',
      value: submissions.length,
      icon: faUsers,
      color: 'bg-green-500',
    },
    {
      title: 'This Month',
      value: submissions.filter(s => {
        const date = new Date(s.submittedAt);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length,
      icon: faCalendarAlt,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Form Builder</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create and manage dynamic forms for your clinic
          </p>
        </div>
        <Button
          onClick={() => setShowTemplateBuilder(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Create Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="theme-transition">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <FontAwesomeIcon icon={stat.icon} className="text-white text-lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Form Templates</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFilter} />
              Filter
            </Button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="theme-transition hover:shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingTemplate(template);
                          setShowTemplateBuilder(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShareTemplate(template)}
                      >
                        <FontAwesomeIcon icon={faShare} className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {template.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Fields:</span>
                      <Badge variant="secondary">{template.fields.length}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Created:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && !loading && (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faFileAlt} className="text-4xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No templates found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create your first form template to get started
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <FormSubmissionsTable
            submissions={submissions}
            onViewSubmission={handleViewSubmission}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      {/* Template Builder Modal */}
      <Dialog open={showTemplateBuilder} onOpenChange={setShowTemplateBuilder}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
          </DialogHeader>
          <FormTemplateBuilder
            template={editingTemplate}
            onSave={() => {
              setShowTemplateBuilder(false);
              setEditingTemplate(null);
              fetchTemplates();
            }}
            onCancel={() => {
              setShowTemplateBuilder(false);
              setEditingTemplate(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Submission Details Modal */}
      <FormSubmissionModal
        submission={selectedSubmission}
        open={showSubmissionModal}
        onClose={() => {
          setShowSubmissionModal(false);
          setSelectedSubmission(null);
        }}
      />
    </div>
  );
};

export default FormBuilderPage; 