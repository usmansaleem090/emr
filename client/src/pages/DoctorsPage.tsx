import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Plus, Edit, Trash2, Eye, UserCheck, Clock } from "lucide-react";
import DoctorScheduleModalNew from "@/components/doctors/DoctorScheduleModalNew";
import { Button } from "@/components/UI/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import { Badge } from "@/components/UI/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/UI/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { api } from "@/utils/apiClient";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { useAppSelector } from "@/redux/hooks";

interface Doctor {
  id: number;
  userId: number;
  clinicId: number;
  specialty: string;
  licenseNumber: string;
  status: "active" | "inactive" | "suspended";
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  userType: string;
  roleId?: number;
  roleName?: string;
  clinicName?: string;
  createdAt: string;
  updatedAt: string;
}

const DoctorsPage: React.FC = () => {
  const { user } = useAppSelector((state: any) => state.auth);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load doctors data
  const loadDoctors = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(
        `/api/doctors${user?.clinicId ? `?clinicId=${user.clinicId}` : ""}`,
      );
      setDoctors(response.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load doctors.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete doctor
  const handleDelete = async (doctor: Doctor) => {
    try {
      setDeleteLoading(true);
      await api.delete(`/api/doctors/${doctor.id}`);
      toast({
        title: "Success",
        description: "Doctor deleted successfully.",
      });
      await loadDoctors(); // Reload the doctors list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete doctor.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [user?.clinicId]);

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      suspended: "bg-red-100 text-red-800",
    };

    return (
      <Badge
        className={
          statusColors[status as keyof typeof statusColors] ||
          statusColors.inactive
        }
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading doctors..." />;
  }

  return (
          <div className="container mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Doctors
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage healthcare professionals and their specialties
          </p>
        </div>
        <Link href="/doctors/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Doctor
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {doctors.filter((d) => d.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {doctors.filter((d) => d.status === "inactive").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Specialties</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {new Set(doctors.map((d) => d.specialty)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctors Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Doctors</CardTitle>
          <CardDescription>
            {doctors.length > 0
              ? `${doctors.length} doctor${doctors.length === 1 ? "" : "s"} found`
              : "No doctors found"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {doctors.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No doctors
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new doctor.
              </p>
              <div className="mt-6">
                <Link href="/doctors/add">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Doctor
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">
                      {doctor.firstName} {doctor.lastName}
                    </TableCell>
                    <TableCell>{doctor.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{doctor.specialty}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {doctor.licenseNumber}
                    </TableCell>
                    <TableCell>
                      {doctor.roleName && (
                        <Badge variant="secondary">{doctor.roleName}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(doctor.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/doctors/edit/${doctor.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deleteLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete Dr.{" "}
                                {doctor.firstName} {doctor.lastName}? This
                                action cannot be undone and will also remove
                                their user account.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(doctor)}
                                disabled={deleteLoading}
                              >
                                {deleteLoading ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Debug Modal State */}
      <div
        style={{
          position: "fixed",
          bottom: 10,
          right: 10,
          background: "white",
          padding: "10px",
          border: "1px solid #ccc",
          zIndex: 10000,
          fontSize: "12px",
        }}
      >
        Modal Open: {scheduleModalOpen ? "TRUE" : "FALSE"}
        <br />
        Selected Doctor:{" "}
        {selectedDoctor
          ? `${selectedDoctor.firstName} ${selectedDoctor.lastName}`
          : "NONE"}
        <br />
        Doctor ID: {selectedDoctor?.id || "N/A"}
      </div>

      {/* Schedule Modal */}
      <DoctorScheduleModalNew
        isOpen={scheduleModalOpen}
        onClose={() => {
          console.log("Modal close triggered");
          setScheduleModalOpen(false);
          setSelectedDoctor(null);
        }}
        doctorId={selectedDoctor?.id || 0}
        doctorName={
          selectedDoctor
            ? `${selectedDoctor.firstName} ${selectedDoctor.lastName}`
            : ""
        }
      />
    </div>
  );
};

export default DoctorsPage;
