import { Label } from "@/components/UI/label";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { Upload, X } from "lucide-react";

interface ClinicBrandingProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export function ClinicBranding({ formData, handleInputChange }: ClinicBrandingProps) {
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleInputChange('practiceLogo', reader.result); // base64 string
    };
    reader.readAsDataURL(file); // reads as base64
  }
};


  const removeLogo = () => {
    handleInputChange('practiceLogo', '');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="practiceLogo">Practice Logo</Label>
        <div className="flex items-center space-x-4">
          {formData.practiceLogo ? (
            <div className="flex items-center space-x-2">
              <img 
                src={formData.practiceLogo} 
                alt="Practice Logo" 
                className="h-16 w-16 object-cover rounded border"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeLogo}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              <input
                type="file"
                id="logoUpload"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Label htmlFor="logoUpload" className="cursor-pointer">
                <Button type="button" variant="outline" asChild>
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </span>
                </Button>
              </Label>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Upload your practice logo. Recommended size: 200x200px
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="primaryColor">Primary Color</Label>
        <div className="flex items-center space-x-4">
          <Input
            id="primaryColor"
            type="color"
            value={formData.primaryColor}
            onChange={(e) => handleInputChange('primaryColor', e.target.value)}
            className="w-20 h-10 p-1 border rounded"
          />
          <Input
            value={formData.primaryColor}
            onChange={(e) => handleInputChange('primaryColor', e.target.value)}
            placeholder="#0066cc"
            className="flex-1"
            pattern="^#[0-9A-F]{6}$"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          This color will be used for your clinic's branding and theme
        </p>
      </div>
    </div>
  );
}