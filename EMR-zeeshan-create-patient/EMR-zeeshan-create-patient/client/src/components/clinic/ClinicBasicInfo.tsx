import { Label } from "@/components/UI/label";
import { Input } from "@/components/UI/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
import { TIME_ZONES } from "@/types/clinic";

interface ClinicBasicInfoProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  errors: any;
}

export function ClinicBasicInfo({ formData, handleInputChange, errors }: ClinicBasicInfoProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clinicName">Clinic Name *</Label>
          <Input
            id="clinicName"
            value={formData.clinicName}
            onChange={(e) => handleInputChange('clinicName', e.target.value)}
            placeholder="Enter clinic name"
            className={errors.clinicName ? 'border-red-500' : ''}
            required
          />
          {errors.clinicName && <p className="text-sm text-red-500">{errors.clinicName}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Clinic Type *</Label>
          <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select clinic type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Practice</SelectItem>
              <SelectItem value="group">Group Practice</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="123 Main St, City, State 12345"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="clinicEmail">Clinic Email</Label>
          <Input
            id="clinicEmail"
            type="email"
            value={formData.clinicEmail}
            onChange={(e) => handleInputChange('clinicEmail', e.target.value)}
            placeholder="contact@clinic.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="timeZone">Time Zone</Label>
          <Select value={formData.timeZone} onValueChange={(value) => handleInputChange('timeZone', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select time zone" />
            </SelectTrigger>
            <SelectContent>
              {TIME_ZONES.map(tz => (
                <SelectItem key={tz} value={tz}>
                  {tz.replace('America/', '').replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.type === 'group' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="groupNpi">Group NPI</Label>
            <Input
              id="groupNpi"
              value={formData.groupNpi}
              onChange={(e) => handleInputChange('groupNpi', e.target.value)}
              placeholder="1234567890"
              maxLength={10}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID</Label>
            <Input
              id="taxId"
              value={formData.taxId}
              onChange={(e) => handleInputChange('taxId', e.target.value)}
              placeholder="12-3456789"
            />
          </div>
        </div>
      )}
    </div>
  );
}