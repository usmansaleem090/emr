import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/redux/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/apiClient";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  Save,
  User,
  Stethoscope,
  Plus,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import DoctorScheduleModalNew from "@/components/doctors/DoctorScheduleModalNew";
import { ClinicStaffManagement } from "@/components/clinic/ClinicStaffManagement";

interface ClinicData {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  type: string;
  groupNpi: string;
  taxId: string;
  timeZone: string;
  practiceSpecialties: string[];
  practiceLogo: string;
  primaryColor: string;
  enableSmsNotifications: boolean;
  enableVoiceCalls: boolean;
  reminderTimeHours: number;
  reminderTimeMinutes: number;
  acceptedInsurances: string[];
  enableOnlinePayments: boolean;
  stripePublicKey: string;
  user?: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    status: string;
  };
}

interface Doctor {
  id: number;
  userId: number;
  clinicId: number;
  specialty: string;
  licenseNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: string;
  roleId: number | null;
  roleName: string | null;
  clinicName: string;
}

export default function ClinicProfilePage() {
  const { user } = useAppSelector((state: any) => state.auth);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("clinic-info");
  const [showAddDoctorForm, setShowAddDoctorForm] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<number | null>(null);
  const [scheduleDoctorId, setScheduleDoctorId] = useState<number | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [addDoctorFormData, setAddDoctorFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    specialty: "",
    licenseNumber: "",
    status: "active",
  });
  const [editDoctorFormData, setEditDoctorFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    specialty: "",
    licenseNumber: "",
    status: "active",
  });

  const [formData, setFormData] = useState({
    // Admin Account Fields
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    password: "",

    // Clinic Basic Info
    clinicName: "",
    address: "",
    clinicPhone: "",
    clinicEmail: "",
    type: "single",
    groupNpi: "",
    taxId: "",
    timeZone: "America/New_York",
  });

  useEffect(() => {
    if (user?.clinicId) {
      loadClinicProfile();
      loadDoctors();
    }
  }, [user?.clinicId]);

  const loadClinicProfile = async () => {
    if (!user?.clinicId) return;

    try {
      setLoading(true);
      console.log("Loading clinic profile for user:", user);
      console.log("Clinic ID:", user.clinicId);

      const response = await api.get(`/api/clinics/${user.clinicId}`);
      console.log("API Response:", response);

      const clinicData = response.data;
      console.log("Clinic Data:", clinicData);

      setClinic(clinicData);

      // Populate form with clinic data
      setFormData({
        username: clinicData.user?.username || "",
        email: clinicData.user?.email || "",
        firstName: clinicData.user?.firstName || "",
        lastName: clinicData.user?.lastName || "",
        phone: clinicData.user?.phone || "",
        password: "", // Don't pre-fill password
        clinicName: clinicData.name || "",
        address: clinicData.address || "",
        clinicPhone: clinicData.phone || "",
        clinicEmail: clinicData.email || "",
        type: clinicData.type || "single",
        groupNpi: clinicData.groupNpi || "",
        taxId: clinicData.taxId || "",
        timeZone: clinicData.timeZone || "America/New_York",
      });
    } catch (error) {
      console.error("Failed to load clinic profile:", error);
      toast({
        title: "Error",
        description: "Failed to load clinic profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.clinicId || !clinic) return;

    try {
      setSaving(true);

      // Update clinic basic info
      const clinicUpdateData = {
        name: formData.clinicName,
        address: formData.address,
        phone: formData.clinicPhone,
        email: formData.clinicEmail,
        type: formData.type,
        groupNpi: formData.groupNpi,
        taxId: formData.taxId,
        timeZone: formData.timeZone,
      };

      await api.put(`/api/clinics/${user.clinicId}`, clinicUpdateData);

      // Update admin user info if provided
      if (clinic.user) {
        const userUpdateData: any = {
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        };

        // Only include password if it's provided
        if (formData.password.trim()) {
          userUpdateData.password = formData.password;
        }

        await api.put(`/api/users/${clinic.user.id}`, userUpdateData);
      }

      toast({
        title: "Success",
        description: "Clinic profile updated successfully",
      });

      // Reload the profile to get updated data
      loadClinicProfile();
    } catch (error: any) {
      console.error("Failed to update clinic profile:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update clinic profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const loadDoctors = async () => {
    try {
      setDoctorsLoading(true);
      const response = await api.get("/api/doctors");
      setDoctors(response.data || []);
    } catch (error) {
      console.error("Failed to load doctors:", error);
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      });
    } finally {
      setDoctorsLoading(false);
    }
  };

  const handleDeleteDoctor = async (doctorId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this doctor? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await api.delete(`/api/doctors/${doctorId}`);
      toast({
        title: "Success",
        description: "Doctor deleted successfully",
      });
      loadDoctors(); // Reload the doctors list
    } catch (error: any) {
      console.error("Failed to delete doctor:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete doctor",
        variant: "destructive",
      });
    }
  };

  const handleAddDoctor = async () => {
    try {
      const doctorData = {
        username: addDoctorFormData.username,
        email: addDoctorFormData.email,
        firstName: addDoctorFormData.firstName,
        lastName: addDoctorFormData.lastName,
        phone: addDoctorFormData.phone,
        password: addDoctorFormData.password,
        userType: "Doctor",
        clinicId: user.clinicId,
        specialty: addDoctorFormData.specialty,
        licenseNumber: addDoctorFormData.licenseNumber,
        status: addDoctorFormData.status,
      };

      await api.post("/api/doctors", doctorData);

      toast({
        title: "Success",
        description: "Doctor added successfully",
      });

      // Reset form and close
      setAddDoctorFormData({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        password: "",
        specialty: "",
        licenseNumber: "",
        status: "active",
      });
      setShowAddDoctorForm(false);
      loadDoctors(); // Reload the doctors list
    } catch (error: any) {
      console.error("Failed to add doctor:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add doctor",
        variant: "destructive",
      });
    }
  };

  const handleAddDoctorInputChange = (field: string, value: string) => {
    setAddDoctorFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditDoctorInputChange = (field: string, value: string) => {
    setEditDoctorFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setEditDoctorFormData({
      username: doctor.email, // Using email as username for display
      email: doctor.email,
      firstName: doctor.firstName || "",
      lastName: doctor.lastName || "",
      phone: doctor.phone || "",
      specialty: doctor.specialty,
      licenseNumber: doctor.licenseNumber,
      status: doctor.status,
    });
    setEditingDoctorId(doctor.id);
    setShowAddDoctorForm(false); // Hide add form if open
  };

  const handleUpdateDoctor = async () => {
    if (!editingDoctorId) return;

    try {
      const updateData = {
        firstName: editDoctorFormData.firstName,
        lastName: editDoctorFormData.lastName,
        phone: editDoctorFormData.phone,
        specialty: editDoctorFormData.specialty,
        licenseNumber: editDoctorFormData.licenseNumber,
        status: editDoctorFormData.status,
      };

      await api.put(`/api/doctors/${editingDoctorId}`, updateData);

      toast({
        title: "Success",
        description: "Doctor updated successfully",
      });

      // Reset form and close
      setEditingDoctorId(null);
      setEditDoctorFormData({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        specialty: "",
        licenseNumber: "",
        status: "active",
      });
      loadDoctors(); // Reload the doctors list
    } catch (error: any) {
      console.error("Failed to update doctor:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update doctor",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingDoctorId(null);
    setEditDoctorFormData({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      specialty: "",
      licenseNumber: "",
      status: "active",
    });
  };

  const handleViewSchedule = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setScheduleModalOpen(true);
    // Close other forms when opening schedule
    setShowAddDoctorForm(false);
    setEditingDoctorId(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return <LoadingSpinner message="Loading clinic profile..." />;
  }

  if (!clinic) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Clinic Found
          </h2>
          <p className="text-gray-600">
            Your account is not associated with a clinic.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Clinic Management
        </h1>
        <p className="text-gray-600">Manage your clinic profile and doctors</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clinic-info" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Clinic Information
          </TabsTrigger>
          <TabsTrigger value="doctors" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Doctors Management
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Staff Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clinic-info" className="space-y-6">
          {/* Admin Account Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Admin Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    placeholder="admin username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="admin@clinic.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    placeholder="Last name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">New Password (optional)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Leave blank to keep current password"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinic Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Clinic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Clinic Name *</Label>
                  <Input
                    id="clinicName"
                    value={formData.clinicName}
                    onChange={(e) =>
                      handleInputChange("clinicName", e.target.value)
                    }
                    placeholder="Medical Center Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Clinic Type</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="single">Single Practice</option>
                    <option value="group">Group Practice</option>
                    <option value="hospital">Hospital</option>
                    <option value="clinic">Clinic</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinicPhone">Phone *</Label>
                  <Input
                    id="clinicPhone"
                    value={formData.clinicPhone}
                    onChange={(e) =>
                      handleInputChange("clinicPhone", e.target.value)
                    }
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinicEmail">Email *</Label>
                  <Input
                    id="clinicEmail"
                    type="email"
                    value={formData.clinicEmail}
                    onChange={(e) =>
                      handleInputChange("clinicEmail", e.target.value)
                    }
                    placeholder="info@clinic.com"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="123 Medical Drive, City, State 12345"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="groupNpi">Group NPI</Label>
                  <Input
                    id="groupNpi"
                    value={formData.groupNpi}
                    onChange={(e) =>
                      handleInputChange("groupNpi", e.target.value)
                    }
                    placeholder="1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange("taxId", e.target.value)}
                    placeholder="12-3456789"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                !formData.clinicName ||
                !formData.address ||
                !formData.username
              }
              className="flex items-center gap-2"
            >
              {saving ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="doctors" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Doctors Management
              </h2>
              <p className="text-gray-600">Manage doctors in your clinic</p>
            </div>
            <Button
              onClick={() => setShowAddDoctorForm(!showAddDoctorForm)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {showAddDoctorForm ? "Cancel" : "Add Doctor"}
            </Button>
          </div>

          {/* Add Doctor Form */}
          {showAddDoctorForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Doctor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctorUsername">Username *</Label>
                    <Input
                      id="doctorUsername"
                      value={addDoctorFormData.username}
                      onChange={(e) =>
                        handleAddDoctorInputChange("username", e.target.value)
                      }
                      placeholder="doctor_username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctorEmail">Email *</Label>
                    <Input
                      id="doctorEmail"
                      type="email"
                      value={addDoctorFormData.email}
                      onChange={(e) =>
                        handleAddDoctorInputChange("email", e.target.value)
                      }
                      placeholder="doctor@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctorFirstName">First Name</Label>
                    <Input
                      id="doctorFirstName"
                      value={addDoctorFormData.firstName}
                      onChange={(e) =>
                        handleAddDoctorInputChange("firstName", e.target.value)
                      }
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctorLastName">Last Name</Label>
                    <Input
                      id="doctorLastName"
                      value={addDoctorFormData.lastName}
                      onChange={(e) =>
                        handleAddDoctorInputChange("lastName", e.target.value)
                      }
                      placeholder="Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctorPhone">Phone</Label>
                    <Input
                      id="doctorPhone"
                      value={addDoctorFormData.phone}
                      onChange={(e) =>
                        handleAddDoctorInputChange("phone", e.target.value)
                      }
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctorPassword">Password *</Label>
                    <Input
                      id="doctorPassword"
                      type="password"
                      value={addDoctorFormData.password}
                      onChange={(e) =>
                        handleAddDoctorInputChange("password", e.target.value)
                      }
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctorSpecialty">Specialty *</Label>
                    <Input
                      id="doctorSpecialty"
                      value={addDoctorFormData.specialty}
                      onChange={(e) =>
                        handleAddDoctorInputChange("specialty", e.target.value)
                      }
                      placeholder="e.g., Cardiology"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctorLicense">License Number *</Label>
                    <Input
                      id="doctorLicense"
                      value={addDoctorFormData.licenseNumber}
                      onChange={(e) =>
                        handleAddDoctorInputChange(
                          "licenseNumber",
                          e.target.value,
                        )
                      }
                      placeholder="MD123456"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDoctorForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddDoctor}
                    disabled={
                      !addDoctorFormData.username ||
                      !addDoctorFormData.email ||
                      !addDoctorFormData.password ||
                      !addDoctorFormData.specialty ||
                      !addDoctorFormData.licenseNumber
                    }
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Doctor
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Edit Doctor Form */}
          {editingDoctorId && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Edit Doctor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editDoctorEmail">Email (readonly)</Label>
                    <Input
                      id="editDoctorEmail"
                      type="email"
                      value={editDoctorFormData.email}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editDoctorFirstName">First Name</Label>
                    <Input
                      id="editDoctorFirstName"
                      value={editDoctorFormData.firstName}
                      onChange={(e) =>
                        handleEditDoctorInputChange("firstName", e.target.value)
                      }
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editDoctorLastName">Last Name</Label>
                    <Input
                      id="editDoctorLastName"
                      value={editDoctorFormData.lastName}
                      onChange={(e) =>
                        handleEditDoctorInputChange("lastName", e.target.value)
                      }
                      placeholder="Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editDoctorPhone">Phone</Label>
                    <Input
                      id="editDoctorPhone"
                      value={editDoctorFormData.phone}
                      onChange={(e) =>
                        handleEditDoctorInputChange("phone", e.target.value)
                      }
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editDoctorSpecialty">Specialty *</Label>
                    <Input
                      id="editDoctorSpecialty"
                      value={editDoctorFormData.specialty}
                      onChange={(e) =>
                        handleEditDoctorInputChange("specialty", e.target.value)
                      }
                      placeholder="e.g., Cardiology"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editDoctorLicense">License Number *</Label>
                    <Input
                      id="editDoctorLicense"
                      value={editDoctorFormData.licenseNumber}
                      onChange={(e) =>
                        handleEditDoctorInputChange(
                          "licenseNumber",
                          e.target.value,
                        )
                      }
                      placeholder="MD123456"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateDoctor}
                    disabled={
                      !editDoctorFormData.specialty ||
                      !editDoctorFormData.licenseNumber
                    }
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Update Doctor
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Doctors List
              </CardTitle>
            </CardHeader>
            <CardContent>
              {doctorsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner message="Loading doctors..." />
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-8">
                  <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Doctors Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    No doctors have been added to your clinic yet.
                  </p>
                  <Button
                    onClick={() => setShowAddDoctorForm(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add First Doctor
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Stethoscope className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {doctor.firstName && doctor.lastName
                              ? `Dr. ${doctor.firstName} ${doctor.lastName}`
                              : `Dr. ${doctor.email.split("@")[0]}`}
                          </div>
                          <div className="text-sm text-gray-600">
                            {doctor.specialty} • License: {doctor.licenseNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doctor.email} • {doctor.phone || "No phone"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            doctor.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {doctor.status}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSchedule(doctor)}
                          className="flex items-center gap-1"
                        >
                          <Calendar className="h-3 w-3" />
                          Schedule
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDoctor(doctor)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDoctor(doctor.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Schedule Modal */}
              <DoctorScheduleModalNew
                isOpen={scheduleModalOpen}
                onClose={() => {
                  setScheduleModalOpen(false);
                  setSelectedDoctor(null);
                }}
                type={'doctor'}
                clinicId={user?.clinicId || 0}
                doctorId={selectedDoctor?.userId || 0}
                doctorName={
                  selectedDoctor
                    ? `${selectedDoctor.firstName} ${selectedDoctor.lastName}`
                    : ""
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <ClinicStaffManagement clinicId={user?.clinicId || 0} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
