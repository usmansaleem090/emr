import { useState, useEffect } from "react";
import { Label } from "@/components/UI/label";
import { Input } from "@/components/UI/input";
import { Switch } from "@/components/UI/switch";
import { Button } from "@/components/UI/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
import { Upload, X, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/apiClient";

interface ClinicSettingsProps {
  clinicId: number;
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export function ClinicSettings({ clinicId, formData, handleInputChange }: ClinicSettingsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load clinic settings on component mount
  useEffect(() => {
    if (clinicId && !settingsLoaded) {
      loadClinicSettings();
    }
  }, [clinicId, settingsLoaded]);

  const loadClinicSettings = async () => {
    if (!clinicId) return;
    
    setIsLoading(true);
    try {
      const response = await api.get(`/api/clinics/${clinicId}/settings`);
      
      if (response.data.success && response.data.data) {
        const settings = response.data.data;
        
        // Update form data with loaded settings
        handleInputChange('practiceLogo', settings.practiceLogo || '');
        handleInputChange('primaryColor', settings.primaryColor || '#0066cc');
        handleInputChange('enableSmsNotifications', settings.enableSmsNotifications ?? true);
        handleInputChange('enableVoiceCalls', settings.enableVoiceCalls ?? false);
        handleInputChange('reminderTimeHours', settings.reminderTimeHours || 24);
        handleInputChange('reminderTimeMinutes', settings.reminderTimeMinutes || 0);
        handleInputChange('acceptedInsurances', settings.acceptedInsurances || []);
        handleInputChange('enableOnlinePayments', settings.enableOnlinePayments ?? false);
        handleInputChange('stripePublicKey', settings.stripePublicKey || '');
        
        setSettingsLoaded(true);
        toast({
          title: "Settings loaded",
          description: "Clinic settings have been loaded successfully.",
        });
      }
    } catch (error: any) {
      console.error('Error loading clinic settings:', error);
      // Don't show error toast if settings don't exist yet (404 is expected for new clinics)
      if (error.response?.status !== 404) {
        toast({
          title: "Error",
          description: "Failed to load clinic settings. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveClinicSettings = async () => {
    if (!clinicId) return;
    
    setIsSaving(true);
    try {
      const settingsData = {
        practiceLogo: formData.practiceLogo,
        primaryColor: formData.primaryColor,
        enableSmsNotifications: formData.enableSmsNotifications,
        enableVoiceCalls: formData.enableVoiceCalls,
        reminderTimeHours: formData.reminderTimeHours,
        reminderTimeMinutes: formData.reminderTimeMinutes,
        acceptedInsurances: formData.acceptedInsurances,
        enableOnlinePayments: formData.enableOnlinePayments,
        stripePublicKey: formData.stripePublicKey,
      };

      // Always use PUT - backend will handle create vs update
      const response = await api.put(`/api/clinics/${clinicId}/settings`, settingsData);

      if (response.data.success) {
        toast({
          title: "Settings saved",
          description: response.data.message || "Clinic settings have been saved successfully.",
        });
        setSettingsLoaded(true);
      }
    } catch (error: any) {
      console.error('Error saving clinic settings:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save clinic settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading clinic settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">     
      {/* Branding Section */}
      <div className="space-y-6">
        <div className="border-b pb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Branding</h3>
         {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={saveClinicSettings} 
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
        
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
                className=" w-1/4"
                pattern="^#[0-9A-F]{6}$"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This color will be used for your clinic's branding and theme
            </p>
          </div>
        </div>
      </div>

      {/* Communication Settings */}
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold">Communication Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure how your clinic communicates with patients
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send appointment reminders and updates via SMS
              </p>
            </div>
            <Switch
              checked={formData.enableSmsNotifications}
              onCheckedChange={(checked) => handleInputChange('enableSmsNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Voice Calls</Label>
              <p className="text-sm text-muted-foreground">
                Enable voice call reminders for appointments
              </p>
            </div>
            <Switch
              checked={formData.enableVoiceCalls}
              onCheckedChange={(checked) => handleInputChange('enableVoiceCalls', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Reminder Time Before Appointment</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reminderTimeHours">Hours</Label>
                <Input
                  id="reminderTimeHours"
                  type="number"
                  min="0"
                  max="72"
                  value={formData.reminderTimeHours}
                  onChange={(e) => handleInputChange('reminderTimeHours', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminderTimeMinutes">Minutes</Label>
                <Input
                  id="reminderTimeMinutes"
                  type="number"
                  min="0"
                  max="59"
                  value={formData.reminderTimeMinutes}
                  onChange={(e) => handleInputChange('reminderTimeMinutes', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Reminder will be sent {formData.reminderTimeHours}h {formData.reminderTimeMinutes}m before appointments
            </p>
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold">Payment Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure payment processing and insurance options
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Online Payments</Label>
              <p className="text-sm text-muted-foreground">
                Accept online payments through Stripe
              </p>
            </div>
            <Switch
              checked={formData.enableOnlinePayments}
              onCheckedChange={(checked) => handleInputChange('enableOnlinePayments', checked)}
            />
          </div>

          {formData.enableOnlinePayments && (
            <div className="space-y-2">
              <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
              <Input
                id="stripePublicKey"
                value={formData.stripePublicKey}
                onChange={(e) => handleInputChange('stripePublicKey', e.target.value)}
                placeholder="pk_live_..."
              />
              <p className="text-sm text-muted-foreground">
                Get this from your Stripe dashboard. Must start with pk_
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Accepted Insurances</Label>
            <div className="space-y-2">
              {['Medicare', 'Medicaid', 'Blue Cross Blue Shield', 'Aetna', 'Cigna', 'UnitedHealth', 'Humana'].map((insurance) => (
                <div key={insurance} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={insurance}
                    checked={formData.acceptedInsurances?.includes(insurance) || false}
                    onChange={(e) => {
                      const current = formData.acceptedInsurances || [];
                      if (e.target.checked) {
                        handleInputChange('acceptedInsurances', [...current, insurance]);
                      } else {
                        handleInputChange('acceptedInsurances', current.filter((i: string) => i !== insurance));
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor={insurance} className="text-sm font-normal">
                    {insurance}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Select the insurance providers your clinic accepts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}