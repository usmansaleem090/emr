import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/UI/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import { Label } from "@/components/UI/label";
import { Input } from "@/components/UI/input";
import { Textarea } from "@/components/UI/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { ArrowLeft, User, UserPlus, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/apiClient";
import { useAppSelector } from "@/redux/hooks";

interface StaffFormData {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  };
  staff: {
    employeeId?: string;
    roleId: string;
    department: string;
    employmentStatus: string;
    startDate: string;
    endDate?: string;
    salary?: string;
    hourlyRate?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
    notes?: string;
    supervisorId?: number;
    clinicId: number;
  };
}

const AddStaffPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [rolesList, setRolesList] = useState([]);
  const user = useAppSelector((state) => state.auth.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>({
    user: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    },
    staff: {
      employeeId: "",
      roleId: "",
      department: "Administration",
      employmentStatus: "Full-time",
      startDate: new Date().toISOString().split("T")[0],
      salary: "",
      hourlyRate: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      address: "",
      dateOfBirth: "",
      gender: "",
      notes: "",
      clinicId: user?.clinicId || 0,
    },
  });

  const departments = [
    "Administration",
    "Reception",
    "Nursing",
    "Medical",
    "Housekeeping",
    "Management",
    "Other",
  ];

  const employmentStatuses = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Intern",
  ];

  const genders = ["Male", "Female", "Other", "Prefer not to say"];

  const relationshipTypes = [
    "Spouse",
    "Parent",
    "Child",
    "Sibling",
    "Friend",
    "Other",
  ];

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      // setLoading(true);
      const response = await api.get("/api/roles");

      if (response?.data) setRolesList(response.data);

      // setRoles(response.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load roles",
        variant: "destructive",
      });
    } finally {
      // setLoading(false);
    }
  };

  const handleInputChange = (
    section: "user" | "staff",
    field: string,
    value: string,
    isNumber?: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: isNumber ? parseInt(value) : value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.user.firstName ||
      !formData.user.lastName ||
      !formData.user.email ||
      !formData.user.password
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required user fields.",
        variant: "destructive",
      });
      return;
    }

    if (
      !formData.staff.roleId ||
      !formData.staff.department
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required staff fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post("/api/clinic-staff", formData);

      toast({
        title: "Success",
        description: "Staff member created successfully.",
      });

      setLocation("/staff");
    } catch (error: any) {
      console.error("Error creating staff member:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to create staff member.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => setLocation("/staff")}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Staff Member</h1>
          <p className="mt-2 text-gray-600">
            Create a new staff member account and profile
          </p>
        </div>
      </div>

              <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              User Account Information
            </CardTitle>
            <CardDescription>
              Basic login credentials and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.user.firstName}
                  onChange={(e) =>
                    handleInputChange("user", "firstName", e.target.value)
                  }
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.user.lastName}
                  onChange={(e) =>
                    handleInputChange("user", "lastName", e.target.value)
                  }
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.user.email}
                  onChange={(e) =>
                    handleInputChange("user", "email", e.target.value)
                  }
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.user.phone}
                  onChange={(e) =>
                    handleInputChange("user", "phone", e.target.value)
                  }
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.user.password}
                onChange={(e) =>
                  handleInputChange("user", "password", e.target.value)
                }
                placeholder="Enter password (minimum 6 characters)"
                required
                minLength={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Staff Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Staff Profile Information
            </CardTitle>
            <CardDescription>
              Position, department, and employment details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={formData.staff.employeeId}
                  onChange={(e) =>
                    handleInputChange("staff", "employeeId", e.target.value)
                  }
                  placeholder="Enter employee ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleId">Position *</Label>
                <Select
                  value={formData.staff.roleId}
                  onValueChange={(value) =>
                    handleInputChange("staff", "roleId", value, true)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesList.map((position) => (
                      <SelectItem
                        key={`${position?.name}-${position?.id}`}
                        value={position?.id}
                      >
                        {position?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.staff.department}
                  onValueChange={(value) =>
                    handleInputChange("staff", "department", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employmentStatus">Employment Status *</Label>
                <Select
                  value={formData.staff.employmentStatus}
                  onValueChange={(value) =>
                    handleInputChange("staff", "employmentStatus", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment status" />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.staff.startDate}
                  onChange={(e) =>
                    handleInputChange("staff", "startDate", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.staff.endDate}
                  onChange={(e) =>
                    handleInputChange("staff", "endDate", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  value={formData.staff.salary}
                  onChange={(e) =>
                    handleInputChange("staff", "salary", e.target.value)
                  }
                  placeholder="Enter annual salary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate</Label>
                <Input
                  id="hourlyRate"
                  value={formData.staff.hourlyRate}
                  onChange={(e) =>
                    handleInputChange("staff", "hourlyRate", e.target.value)
                  }
                  placeholder="Enter hourly rate"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Personal details and emergency contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.staff.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("staff", "dateOfBirth", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.staff.gender}
                  onValueChange={(value) =>
                    handleInputChange("staff", "gender", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.staff.address}
                onChange={(e) =>
                  handleInputChange("staff", "address", e.target.value)
                }
                placeholder="Enter full address"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">
                  Emergency Contact Name
                </Label>
                <Input
                  id="emergencyContactName"
                  value={formData.staff.emergencyContactName}
                  onChange={(e) =>
                    handleInputChange(
                      "staff",
                      "emergencyContactName",
                      e.target.value
                    )
                  }
                  placeholder="Enter emergency contact name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">
                  Emergency Contact Phone
                </Label>
                <Input
                  id="emergencyContactPhone"
                  value={formData.staff.emergencyContactPhone}
                  onChange={(e) =>
                    handleInputChange(
                      "staff",
                      "emergencyContactPhone",
                      e.target.value
                    )
                  }
                  placeholder="Enter emergency contact phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactRelation">Relationship</Label>
                <Select
                  value={formData.staff.emergencyContactRelation}
                  onValueChange={(value) =>
                    handleInputChange(
                      "staff",
                      "emergencyContactRelation",
                      value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipTypes.map((relation) => (
                      <SelectItem key={relation} value={relation}>
                        {relation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.staff.notes}
                onChange={(e) =>
                  handleInputChange("staff", "notes", e.target.value)
                }
                placeholder="Additional notes about the staff member"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/staff")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Staff Member
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default AddStaffPage;