import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Label } from "@/components/UI/label";

interface ClinicTypeDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  label?: string;
}

export const ClinicTypeDropdown: React.FC<ClinicTypeDropdownProps> = ({
  value,
  onValueChange,
  error,
  label = "Clinic Type *"
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="type">{label}</Label>
      <Select
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder="Select clinic type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="single">Single Practice</SelectItem>
          <SelectItem value="group">Group Practice</SelectItem>
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}; 