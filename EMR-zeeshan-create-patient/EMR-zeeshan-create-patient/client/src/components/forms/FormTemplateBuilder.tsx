import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faTrash,
  faGripVertical,
  faEye,
  faEyeSlash,
  faCopy,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import { Label } from '@/components/UI/label';
import { Switch } from '@/components/UI/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Separator } from '@/components/UI/separator';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { apiClient } from '@/utils/apiClient';
import { useToastNotification } from '@/hooks/useToastNotification';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'date' | 'checkbox' | 'radio' | 'select';
  required: boolean;
  options?: string[];
}

interface FormTemplate {
  id?: number;
  title: string;
  description?: string;
  fields: FormField[];
}

interface FormTemplateBuilderProps {
  template?: FormTemplate | null;
  onSave: () => void;
  onCancel: () => void;
}

const fieldTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Button' },
  { value: 'select', label: 'Dropdown' },
];

const FormTemplateBuilder: React.FC<FormTemplateBuilderProps> = ({
  template,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormTemplate>({
    title: '',
    description: '',
    fields: [],
  });
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { showSuccess, showError } = useToastNotification();

  useEffect(() => {
    if (template) {
      setFormData(template);
    }
  }, [template]);

  const addField = () => {
    const newField: FormField = {
      name: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
    };
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    setSelectedField(newField);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) =>
        i === index ? { ...field, ...updates } : field
      ),
    }));
  };

  const removeField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
    setSelectedField(null);
  };

  const duplicateField = (index: number) => {
    const field = formData.fields[index];
    const newField: FormField = {
      ...field,
      name: `${field.name}_copy_${Date.now()}`,
      label: `${field.label} (Copy)`,
    };
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(formData.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData(prev => ({
      ...prev,
      fields: items,
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      showError('Template title is required');
      return;
    }

    if (formData.fields.length === 0) {
      showError('At least one field is required');
      return;
    }

    try {
      setLoading(true);
      if (template?.id) {
        await apiClient.patch(`/form-templates/${template.id}`, formData);
        showSuccess('Template updated successfully');
      } else {
        await apiClient.post('/form-templates', formData);
        showSuccess('Template created successfully');
      }
      onSave();
    } catch (error) {
      showError('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const renderFieldPreview = (field: FormField) => {
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
              placeholder={`Enter ${field.label.toLowerCase()}`}
              disabled
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
              placeholder={`Enter ${field.label.toLowerCase()}`}
              disabled
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
              disabled
            />
          </div>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.name}
              disabled
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
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={field.name}
                    value={option}
                    disabled
                  />
                  <Label>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );
      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select disabled>
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Builder Panel */}
      <div className="space-y-6">
        {/* Template Info */}
        <Card>
          <CardHeader>
            <CardTitle>Template Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter template title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter template description"
              />
            </div>
          </CardContent>
        </Card>

        {/* Fields Builder */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Form Fields</CardTitle>
              <Button onClick={addField} size="sm">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="fields">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {formData.fields.map((field, index) => (
                      <Draggable key={field.name} draggableId={field.name} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border rounded-lg p-4 ${
                              selectedField?.name === field.name
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div {...provided.dragHandleProps}>
                                  <FontAwesomeIcon
                                    icon={faGripVertical}
                                    className="text-gray-400 cursor-move"
                                  />
                                </div>
                                <Badge variant="outline">{field.type}</Badge>
                                {field.required && (
                                  <Badge variant="destructive">Required</Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedField(field)}
                                >
                                  <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => duplicateField(index)}
                                >
                                  <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeField(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-sm font-medium">{field.label}</div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>
      </div>

      {/* Field Editor & Preview */}
      <div className="space-y-6">
        {/* Field Editor */}
        {selectedField && (
          <Card>
            <CardHeader>
              <CardTitle>Field Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="field-label">Label</Label>
                <Input
                  id="field-label"
                  value={selectedField.label}
                  onChange={(e) => {
                    const fieldIndex = formData.fields.findIndex(f => f.name === selectedField.name);
                    updateField(fieldIndex, { label: e.target.value });
                    setSelectedField({ ...selectedField, label: e.target.value });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field-type">Type</Label>
                <Select
                  value={selectedField.type}
                  onValueChange={(value: any) => {
                    const fieldIndex = formData.fields.findIndex(f => f.name === selectedField.name);
                    updateField(fieldIndex, { type: value });
                    setSelectedField({ ...selectedField, type: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={selectedField.required}
                  onCheckedChange={(checked) => {
                    const fieldIndex = formData.fields.findIndex(f => f.name === selectedField.name);
                    updateField(fieldIndex, { required: checked });
                    setSelectedField({ ...selectedField, required: checked });
                  }}
                />
                <Label htmlFor="required">Required field</Label>
              </div>
              {(selectedField.type === 'radio' || selectedField.type === 'select') && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {(selectedField.options || []).map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(selectedField.options || [])];
                            newOptions[index] = e.target.value;
                            const fieldIndex = formData.fields.findIndex(f => f.name === selectedField.name);
                            updateField(fieldIndex, { options: newOptions });
                            setSelectedField({ ...selectedField, options: newOptions });
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newOptions = selectedField.options?.filter((_, i) => i !== index);
                            const fieldIndex = formData.fields.findIndex(f => f.name === selectedField.name);
                            updateField(fieldIndex, { options: newOptions });
                            setSelectedField({ ...selectedField, options: newOptions });
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOptions = [...(selectedField.options || []), ''];
                        const fieldIndex = formData.fields.findIndex(f => f.name === selectedField.name);
                        updateField(fieldIndex, { options: newOptions });
                        setSelectedField({ ...selectedField, options: newOptions });
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-2" />
                      Add Option
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Preview */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Preview</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <FontAwesomeIcon
                  icon={previewMode ? faEyeSlash : faEye}
                  className="mr-2"
                />
                {previewMode ? 'Hide' : 'Show'} Preview
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {previewMode ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{formData.title}</h3>
                {formData.description && (
                  <p className="text-gray-600 dark:text-gray-400">{formData.description}</p>
                )}
                <Separator />
                <div className="space-y-4">
                  {formData.fields.map((field) => (
                    <div key={field.name}>
                      {renderFieldPreview(field)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Click "Show Preview" to see how your form will look
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="lg:col-span-2 flex justify-end space-x-4 pt-6 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : template?.id ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </div>
  );
};

export default FormTemplateBuilder; 