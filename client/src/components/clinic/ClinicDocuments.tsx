import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/UI/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import { Badge } from "@/components/UI/badge";
import { 
  Upload, 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  MoreVertical,
  File,
  Image,
  FileSpreadsheet,
  Plus,
  X,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/apiClient";

interface ClinicDocument {
  id: string;
  clinicId: number;
  title: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedBy: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ClinicDocumentsProps {
  clinicId?: number | null;
  clinicName?: string;
}

export function ClinicDocuments({ clinicId, clinicName }: ClinicDocumentsProps) {
  const [documents, setDocuments] = useState<ClinicDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<ClinicDocument | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Upload form states
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // Edit form states
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log('ClinicDocuments useEffect triggered, clinicId:', clinicId);
    if (clinicId) {
      loadDocuments();
    } else {
      console.log('No clinicId provided, setting loading to false');
      setIsLoading(false);
    }
  }, [clinicId]);

  const loadDocuments = async () => {
    if (!clinicId) {
      console.log('loadDocuments called but no clinicId available');
      return;
    }
    
    console.log('Loading documents for clinic:', clinicId);
    
    try {
      setIsLoading(true);
      const response = await api.get(`/api/clinic/${clinicId}/documents`);
      console.log('Documents API response:', response.data);
      const docs = response.data.data || [];
      console.log('Setting documents:', docs, 'Document count:', docs.length);
      setDocuments(docs);
    } catch (error: any) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <Image className="w-4 h-4" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      // Auto-populate title with first filename if empty
      if (!uploadTitle && files.length === 1) {
        setUploadTitle(files[0].name.replace(/\.[^/.]+$/, ""));
      } else if (files.length > 1) {
        setUploadTitle("Multiple documents");
      }
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !uploadTitle.trim()) {
      toast({
        title: "Error",
        description: "Please select files and provide a title",
        variant: "destructive",
      });
      return;
    }

    if (!clinicId) {
      // For new clinics, just store temporarily 
      toast({
        title: "Note",
        description: "Documents will be uploaded after clinic creation",
      });
      setIsUploadDialogOpen(false);
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload files one by one if multiple, or single upload
      if (selectedFiles.length === 1) {
        const formData = new FormData();
        formData.append('file', selectedFiles[0]);
        formData.append('title', uploadTitle.trim());
        formData.append('description', uploadDescription.trim());

        await api.post(`/api/clinic/${clinicId}/documents`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Multiple files - upload each with auto-generated titles
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const formData = new FormData();
          formData.append('file', file);
          formData.append('title', file.name.replace(/\.[^/.]+$/, ""));
          formData.append('description', uploadDescription.trim());

          await api.post(`/api/clinic/${clinicId}/documents`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      }

      toast({
        title: "Success",
        description: `${selectedFiles.length} document${selectedFiles.length > 1 ? 's' : ''} uploaded successfully`,
      });

      // Reset form
      setUploadTitle("");
      setUploadDescription("");
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsUploadDialogOpen(false);
      
      // Reload documents
      await loadDocuments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload documents",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (document: ClinicDocument) => {
    setEditingDocument(document);
    setEditTitle(document.title);
    setEditDescription(document.description || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateDocument = async () => {
    if (!editingDocument || !editTitle.trim()) {
      toast({
        title: "Error",
        description: "Please provide a valid title",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.put(`/api/clinic/${clinicId}/documents/${editingDocument.id}`, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
      });

      toast({
        title: "Success",
        description: "Document updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingDocument(null);
      await loadDocuments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update document",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (document: ClinicDocument) => {
    try {
      const response = await api.get(`/api/clinic/${clinicId}/documents/${document.id}/download`, {
        responseType: 'blob',
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;
      
      // Get file extension from the document's file type or path
      const extension = document.filePath.split('.').pop() || 'file';
      link.setAttribute('download', `${document.title}.${extension}`);
      
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (document: ClinicDocument) => {
    if (!window.confirm(`Are you sure you want to delete "${document.title}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/clinic/${clinicId}/documents/${document.id}`);
      
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      await loadDocuments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            Upload and manage clinic documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documents {clinicName && `- ${clinicName}`}
            </CardTitle>
            <CardDescription>
              Upload and manage clinic documents, certificates, and files for {clinicName || 'this clinic'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadDocuments} variant="outline" size="sm">
              <Loader2 className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
                <DialogDescription>
                  Upload a document for this clinic. Supported formats: PDF, Word, Excel, Images, Text files.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Files</Label>
                  <Input
                    id="file"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                    multiple
                    className="mt-1"
                  />
                  {selectedFiles.length > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Selected {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}:
                      <ul className="list-disc list-inside mt-1 max-h-20 overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                          <li key={index} className="truncate">
                            {file.name} ({formatFileSize(file.size)})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Enter document title"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Optional description"
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={isUploading || selectedFiles.length === 0 || !uploadTitle.trim()}>
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents uploaded</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first document to get started
            </p>
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800 font-medium">Clinic Information</p>
              <p className="text-xs text-blue-600">
                Clinic ID: {clinicId} | Documents: {documents.length} | Status: {isLoading ? 'Loading...' : 'Ready'}
              </p>
              {clinicName && <p className="text-xs text-blue-600">Name: {clinicName}</p>}
            </div>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {getFileIcon(document.fileType)}
                      <div>
                        <div className="font-medium">{document.title}</div>
                        {document.description && (
                          <div className="text-sm text-muted-foreground">
                            {document.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {document.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(document.fileSize)}</TableCell>
                  <TableCell>
                    {new Date(document.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(document)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(document)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(document)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Edit Document Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update the document title and description
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter document title"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateDocument} disabled={!editTitle.trim()}>
              <Edit className="w-4 h-4 mr-2" />
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}