import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faDownload,
  faSearch,
  faFilter,
  faCalendarAlt,
  faUser,
  faFileAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/UI/table';

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

interface FormSubmissionsTableProps {
  submissions: FormSubmission[];
  onViewSubmission: (submission: FormSubmission) => void;
  loading?: boolean;
}

const FormSubmissionsTable: React.FC<FormSubmissionsTableProps> = ({
  submissions,
  onViewSubmission,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'template'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get unique templates for filter
  const templates = Array.from(
    new Set(submissions.map(s => s.template?.title || 'Unknown Template'))
  );

  // Filter and sort submissions
  const filteredSubmissions = submissions
    .filter(submission => {
      const matchesSearch = submission.template?.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        submission.submittedAt.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTemplate = selectedTemplate === 'all' || 
        submission.template?.title === selectedTemplate;
      
      return matchesSearch && matchesTemplate;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      } else if (sortBy === 'template') {
        comparison = (a.template?.title || '').localeCompare(b.template?.title || '');
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: 'date' | 'template') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const exportSubmissions = () => {
    const csvContent = [
      ['Template', 'Submitted At', 'User ID', 'Values'],
      ...filteredSubmissions.map(submission => [
        submission.template?.title || 'Unknown',
        new Date(submission.submittedAt).toLocaleString(),
        submission.userId.toString(),
        JSON.stringify(submission.values),
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center">
              <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
              Form Submissions ({filteredSubmissions.length})
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={exportSubmissions}>
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template} value={template}>
                    {template}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-') as ['date' | 'template', 'asc' | 'desc'];
              setSortBy(field);
              setSortOrder(order);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (Newest)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                <SelectItem value="template-asc">Template (A-Z)</SelectItem>
                <SelectItem value="template-desc">Template (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('template')}
                    className="h-auto p-0 font-semibold"
                  >
                    Template
                    {sortBy === 'template' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('date')}
                    className="h-auto p-0 font-semibold"
                  >
                    Submitted
                    {sortBy === 'date' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <FontAwesomeIcon icon={faFileAlt} className="text-4xl text-gray-400" />
                      <p className="text-gray-500">No submissions found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faFileAlt} className="text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {submission.template?.title || 'Unknown Template'}
                          </div>
                          {submission.template?.description && (
                            <div className="text-sm text-gray-500">
                              {submission.template.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(submission.submittedAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                        <Badge variant="outline">ID: {submission.userId}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {submission.values.length} fields
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewSubmission(submission)}
                      >
                        <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormSubmissionsTable; 