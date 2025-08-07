import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import { Label } from '@/components/UI/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Checkbox } from '@/components/UI/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/UI/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { apiClient } from '@/utils/apiClient';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'date' | 'checkbox' | 'radio' | 'select';
  required: boolean;
  options?: string[];
}

interface FormTemplate {
  id: number;
  title: string;
  description?: string;
  fields: FormField[];
}

const FormFillPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplate();
  }, [id]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/form-templates/${id}`);
      if (response.data.success) {
        setTemplate(response.data.data);
        // Initialize form data with empty values
        const initialData: Record<string, any> = {};
        response.data.data.fields.forEach((field: FormField) => {
          if (field.type === 'checkbox') {
            initialData[field.name] = false;
          } else if (field.type === 'radio' || field.type === 'select') {
            initialData[field.name] = '';
          } else {
            initialData[field.name] = '';
          }
        });
        setFormData(initialData);
      } else {
        setError('Template not found');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const validateForm = () => {
    if (!template) return false;
    
    for (const field of template.fields) {
      if (field.required) {
        const value = formData[field.name];
        if (value === '' || value === null || value === undefined) {
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const submissionData = {
        formTemplateId: Number(id),
        values: Object.entries(formData).map(([key, value]) => ({
          key,
          value,
        })),
      };

      const response = await apiClient.post('/form-submissions', submissionData);
      
      if (response.data.success) {
        setSubmitted(true);
      } else {
        setError('Failed to submit form');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              required={field.required}
            />
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              required={field.required}
              rows={4}
            />
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type="date"
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              required={field.required}
            />
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={value}
              onCheckedChange={(checked) => handleInputChange(field.name, checked)}
              required={field.required}
            />
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <RadioGroup
              value={value}
              onValueChange={(val) => handleInputChange(field.name, val)}
              required={field.required}
            >
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.name}-${index}`} />
                  <Label htmlFor={`${field.name}-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleInputChange(field.name, val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Form Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={() => navigate('/')}>
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Form Submitted Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Thank you for your submission. Your response has been recorded.
            </p>
            <Button onClick={() => navigate('/')}>
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{template?.title}</CardTitle>
                {template?.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {template.description}
                  </p>
                )}
              </div>
              <Badge variant="outline">
                {template?.fields.length} fields
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
                    <p className="text-red-700 dark:text-red-400">{error}</p>
                  </div>
                </div>
              )}

              {template?.fields.map((field, index) => (
                <div key={field.name} className="space-y-2">
                  {renderField(field)}
                </div>
              ))}

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                      Submit Form
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormFillPage; 