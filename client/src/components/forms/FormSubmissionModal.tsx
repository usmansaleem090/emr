import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faCalendarAlt,
  faUser,
  faFileAlt,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Separator } from '@/components/UI/separator';
import { Label } from '@/components/UI/label';

interface FormTemplate {
  id: number;
  title: string;
  description?: string;
  fields: FormField[];
}

interface FormField {
  name: string;
  label: string;
  type: string;
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

interface FormSubmissionModalProps {
  submission: FormSubmission | null;
  open: boolean;
  onClose: () => void;
}

const FormSubmissionModal: React.FC<FormSubmissionModalProps> = ({
  submission,
  open,
  onClose,
}) => {
  if (!submission || !open) return null;

  const renderFieldValue = (fieldName: string, value: any, fieldType?: string) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">Not provided</span>;
    }

    switch (fieldType) {
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className={`w-4 h-4 ${value ? 'text-green-600' : 'text-gray-400'}`}
            />
            <span>{value ? 'Yes' : 'No'}</span>
          </div>
        );
      case 'date':
        return <span>{new Date(value).toLocaleDateString()}</span>;
      case 'textarea':
        return (
          <div className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
            {value}
          </div>
        );
      default:
        return <span>{String(value)}</span>;
    }
  };

  const getFieldType = (fieldName: string) => {
    return submission.template?.fields.find(f => f.name === fieldName)?.type || 'text';
  };

  const getFieldLabel = (fieldName: string) => {
    return submission.template?.fields.find(f => f.name === fieldName)?.label || fieldName;
  };

  const isFieldRequired = (fieldName: string) => {
    return submission.template?.fields.find(f => f.name === fieldName)?.required || false;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faFileAlt} className="text-blue-600 text-xl" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Form Submission Details
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ID: {submission.id}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Template Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faFileAlt} className="text-blue-600" />
                <span>Template Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Template Name
                </Label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {submission.template?.title || 'Unknown Template'}
                </p>
              </div>
              {submission.template?.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Description
                  </Label>
                  <p className="text-gray-700 dark:text-gray-300">
                    {submission.template.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submission Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-green-600" />
                <span>Submission Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Submitted At
                    </Label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      User ID
                    </Label>
                    <Badge variant="outline">{submission.userId}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Responses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faCheckCircle} className="text-purple-600" />
                <span>Form Responses</span>
                <Badge variant="secondary">{submission.values.length} fields</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submission.values.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FontAwesomeIcon icon={faFileAlt} className="text-4xl mb-4" />
                    <p>No responses recorded</p>
                  </div>
                ) : (
                  submission.values.map((field, index) => {
                    const fieldLabel = getFieldLabel(field.key);
                    const fieldType = getFieldType(field.key);
                    const isRequired = isFieldRequired(field.key);
                    
                    return (
                      <div key={field.key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm font-medium text-gray-900 dark:text-white">
                              {fieldLabel}
                            </Label>
                            {isRequired && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">{fieldType}</Badge>
                          </div>
                        </div>
                        <div className="text-gray-700 dark:text-gray-300">
                          {renderFieldValue(field.key, field.value, fieldType)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormSubmissionModal; 