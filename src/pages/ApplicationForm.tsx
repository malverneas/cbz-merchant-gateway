import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useCreateApplication, useSubmitApplication } from '@/hooks/useApplications';
import { useUploadDocument, useDeleteDocument, useApplicationDocuments, DocumentType } from '@/hooks/useDocuments';
import { validateStep, ApplicationFormData } from '@/lib/validations';
import { 
  Building2, 
  User, 
  FileText, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  File,
  Loader2,
  AlertCircle
} from 'lucide-react';

type FormStep = 'business' | 'contact' | 'documents' | 'review';

interface DocumentState {
  businessRegistration: File | null;
  directorId: File | null;
  proofOfAddress: File | null;
}

const steps: { id: FormStep; label: string; icon: React.ElementType }[] = [
  { id: 'business', label: 'Business Info', icon: Building2 },
  { id: 'contact', label: 'Contact Details', icon: User },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'review', label: 'Review', icon: CheckCircle },
];

const documentTypeMap: Record<keyof DocumentState, DocumentType> = {
  businessRegistration: 'business_registration',
  directorId: 'director_id',
  proofOfAddress: 'proof_of_address',
};

const InputWithError: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  disabled?: boolean;
  error?: string;
}> = ({ id, label, value, onChange, placeholder, required, type = 'text', disabled, error }) => (
  <div className="space-y-2">
    <Label htmlFor={id}>
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    <Input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(error && 'border-destructive')}
    />
    {error && (
      <p className="text-sm text-destructive flex items-center gap-1">
        <AlertCircle size={14} />
        {error}
      </p>
    )}
  </div>
);

const FileUploadField: React.FC<{
  label: string;
  description: string;
  file: File | null;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}> = ({ label, description, file, isUploading, onUpload, onRemove }) => (
  <div className="border-2 border-dashed border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
    <div className="text-center">
      {isUploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Uploading...</span>
        </div>
      ) : file ? (
        <div className="flex items-center justify-between bg-muted rounded-lg p-3">
          <div className="flex items-center gap-3">
            <File className="text-primary" size={20} />
            <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {file.name}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onRemove}
            className="h-8 w-8"
          >
            <X size={16} />
          </Button>
        </div>
      ) : (
        <>
          <Upload className="mx-auto text-muted-foreground mb-3" size={32} />
          <h4 className="font-medium text-foreground mb-1">{label}</h4>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
              }}
            />
            <Button variant="outline" size="sm" asChild>
              <span className="cursor-pointer">Choose File</span>
            </Button>
          </label>
        </>
      )}
    </div>
  </div>
);

const ApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const createApplication = useCreateApplication();
  const submitApplication = useSubmitApplication();
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  
  const [currentStep, setCurrentStep] = useState<FormStep>('business');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ApplicationFormData>({
    businessName: '',
    tradingName: '',
    businessType: '',
    registrationNumber: '',
    taxId: '',
    businessAddress: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Zimbabwe',
    websiteUrl: '',
    expectedMonthlyVolume: '',
    businessDescription: '',
    contactName: user?.name || '',
    contactEmail: user?.email || '',
    contactPhone: '',
  });

  const [documents, setDocuments] = useState<DocumentState>({
    businessRegistration: null,
    directorId: null,
    proofOfAddress: null,
  });

  // Fetch uploaded documents if we have an application ID
  const { data: uploadedDocs } = useApplicationDocuments(applicationId || undefined);

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const updateFormData = <K extends keyof ApplicationFormData>(field: K, value: ApplicationFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNext = async () => {
    // Validate current step
    if (currentStep === 'business') {
      const result = validateStep('business', formData);
      if (!result.valid) {
        setErrors(result.errors);
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields correctly.',
          variant: 'destructive',
        });
        return;
      }
    }

    if (currentStep === 'contact') {
      const result = validateStep('contact', formData);
      if (!result.valid) {
        setErrors(result.errors);
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields correctly.',
          variant: 'destructive',
        });
        return;
      }

      // Create draft application if not exists
      if (!applicationId) {
        try {
          const app = await createApplication.mutateAsync({
            business_name: formData.businessName,
            trading_name: formData.tradingName || null,
            business_type: formData.businessType,
            registration_number: formData.registrationNumber,
            tax_id: formData.taxId || null,
            business_address: formData.businessAddress,
            city: formData.city,
            province: formData.province || null,
            postal_code: formData.postalCode || null,
            country: formData.country,
            website_url: formData.websiteUrl || null,
            expected_monthly_volume: formData.expectedMonthlyVolume || null,
            business_description: formData.businessDescription || null,
            contact_name: formData.contactName,
            contact_email: formData.contactEmail,
            contact_phone: formData.contactPhone,
          });
          setApplicationId(app.id);
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to save application. Please try again.',
            variant: 'destructive',
          });
          return;
        }
      }
    }

    setErrors({});
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleFileUpload = async (docType: keyof DocumentState, file: File) => {
    if (!applicationId) {
      toast({
        title: 'Error',
        description: 'Please complete the previous steps first.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Maximum file size is 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingDoc(docType);
    
    try {
      await uploadDocument.mutateAsync({
        file,
        applicationId,
        type: documentTypeMap[docType],
      });
      
      setDocuments(prev => ({ ...prev, [docType]: file }));
      
      toast({
        title: 'Document Uploaded',
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload document.',
        variant: 'destructive',
      });
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleFileRemove = async (docType: keyof DocumentState) => {
    const docTypeDb = documentTypeMap[docType];
    const doc = uploadedDocs?.find(d => d.type === docTypeDb);
    
    if (doc) {
      try {
        await deleteDocument.mutateAsync(doc);
        setDocuments(prev => ({ ...prev, [docType]: null }));
        toast({
          title: 'Document Removed',
          description: 'Document has been removed.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to remove document.',
          variant: 'destructive',
        });
      }
    } else {
      setDocuments(prev => ({ ...prev, [docType]: null }));
    }
  };

  const handleSubmit = async () => {
    if (!applicationId) {
      toast({
        title: 'Error',
        description: 'Application not found.',
        variant: 'destructive',
      });
      return;
    }

    // Check required documents
    const requiredDocs = ['business_registration', 'director_id', 'proof_of_address'];
    const uploadedTypes = uploadedDocs?.map(d => d.type) || [];
    const missingDocs = requiredDocs.filter(doc => !uploadedTypes.includes(doc));

    if (missingDocs.length > 0) {
      toast({
        title: 'Missing Documents',
        description: 'Please upload all required documents before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await submitApplication.mutateAsync(applicationId);
      
      toast({
        title: 'Application Submitted!',
        description: 'Your merchant application has been submitted for review.',
      });
      
      navigate('/applications');
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update local document state based on uploaded docs
  useEffect(() => {
    if (uploadedDocs) {
      const newDocs: DocumentState = {
        businessRegistration: null,
        directorId: null,
        proofOfAddress: null,
      };
      
      uploadedDocs.forEach(doc => {
        if (doc.type === 'business_registration') {
          newDocs.businessRegistration = { name: doc.name } as File;
        } else if (doc.type === 'director_id') {
          newDocs.directorId = { name: doc.name } as File;
        } else if (doc.type === 'proof_of_address') {
          newDocs.proofOfAddress = { name: doc.name } as File;
        }
      });
      
      setDocuments(newDocs);
    }
  }, [uploadedDocs]);


  return (
    <DashboardLayout allowedRoles={['merchant']}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft size={18} className="mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-foreground">New Merchant Application</h1>
          <p className="text-muted-foreground">Complete all steps to submit your application</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'h-12 w-12 rounded-xl flex items-center justify-center transition-all',
                      isActive ? 'gradient-primary text-primary-foreground shadow-md' :
                      isCompleted ? 'bg-success text-success-foreground' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                    </div>
                    <span className={cn(
                      'text-xs mt-2 font-medium',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      'flex-1 h-1 mx-2 rounded-full',
                      index < currentStepIndex ? 'bg-success' : 'bg-muted'
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {steps.find(s => s.id === currentStep)?.label}
            </CardTitle>
            <CardDescription>
              {currentStep === 'business' && 'Enter your business registration details'}
              {currentStep === 'contact' && 'Provide contact information for your business'}
              {currentStep === 'documents' && 'Upload required documents for verification'}
              {currentStep === 'review' && 'Review your application before submitting'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Business Info Step */}
            {currentStep === 'business' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <InputWithError
                    id="businessName"
                    label="Business Name"
                    value={formData.businessName}
                    onChange={(v) => updateFormData('businessName', v)}
                    placeholder="Enter business name"
                    required
                    error={errors.businessName}
                  />
                  <InputWithError
                    id="tradingName"
                    label="Trading Name"
                    value={formData.tradingName || ''}
                    onChange={(v) => updateFormData('tradingName', v)}
                    placeholder="Trading as (if different)"
                    error={errors.tradingName}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <InputWithError
                    id="businessType"
                    label="Business Type"
                    value={formData.businessType}
                    onChange={(v) => updateFormData('businessType', v)}
                    placeholder="e.g., Retail, Wholesale"
                    required
                    error={errors.businessType}
                  />
                  <InputWithError
                    id="registrationNumber"
                    label="Registration Number"
                    value={formData.registrationNumber}
                    onChange={(v) => updateFormData('registrationNumber', v)}
                    placeholder="e.g., REG-2024-001"
                    required
                    error={errors.registrationNumber}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <InputWithError
                    id="taxId"
                    label="Tax ID (TIN)"
                    value={formData.taxId || ''}
                    onChange={(v) => updateFormData('taxId', v)}
                    placeholder="e.g., TIN-123456"
                    error={errors.taxId}
                  />
                  <InputWithError
                    id="websiteUrl"
                    label="Website"
                    value={formData.websiteUrl || ''}
                    onChange={(v) => updateFormData('websiteUrl', v)}
                    placeholder="www.yourbusiness.co.zw"
                    error={errors.websiteUrl}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessAddress">
                    Business Address <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="businessAddress"
                    value={formData.businessAddress}
                    onChange={(e) => updateFormData('businessAddress', e.target.value)}
                    placeholder="Enter full business address"
                    rows={2}
                    className={cn(errors.businessAddress && 'border-destructive')}
                  />
                  {errors.businessAddress && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.businessAddress}
                    </p>
                  )}
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <InputWithError
                    id="city"
                    label="City"
                    value={formData.city}
                    onChange={(v) => updateFormData('city', v)}
                    placeholder="e.g., Harare"
                    required
                    error={errors.city}
                  />
                  <InputWithError
                    id="province"
                    label="Province"
                    value={formData.province || ''}
                    onChange={(v) => updateFormData('province', v)}
                    placeholder="e.g., Harare Province"
                    error={errors.province}
                  />
                  <InputWithError
                    id="country"
                    label="Country"
                    value={formData.country}
                    onChange={(v) => updateFormData('country', v)}
                    disabled
                    error={errors.country}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <InputWithError
                    id="postalCode"
                    label="Postal Code"
                    value={formData.postalCode || ''}
                    onChange={(v) => updateFormData('postalCode', v)}
                    placeholder="e.g., 00263"
                    error={errors.postalCode}
                  />
                  <InputWithError
                    id="expectedMonthlyVolume"
                    label="Expected Monthly Volume"
                    value={formData.expectedMonthlyVolume || ''}
                    onChange={(v) => updateFormData('expectedMonthlyVolume', v)}
                    placeholder="e.g., $10,000 - $50,000"
                    error={errors.expectedMonthlyVolume}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessDescription">Business Description</Label>
                  <Textarea
                    id="businessDescription"
                    value={formData.businessDescription || ''}
                    onChange={(e) => updateFormData('businessDescription', e.target.value)}
                    placeholder="Briefly describe your business activities..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Contact Details Step */}
            {currentStep === 'contact' && (
              <div className="space-y-4">
                <InputWithError
                  id="contactName"
                  label="Contact Person"
                  value={formData.contactName}
                  onChange={(v) => updateFormData('contactName', v)}
                  placeholder="Full name"
                  required
                  error={errors.contactName}
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <InputWithError
                    id="contactEmail"
                    label="Email Address"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(v) => updateFormData('contactEmail', v)}
                    placeholder="email@business.co.zw"
                    required
                    error={errors.contactEmail}
                  />
                  <InputWithError
                    id="contactPhone"
                    label="Phone Number"
                    value={formData.contactPhone}
                    onChange={(v) => updateFormData('contactPhone', v)}
                    placeholder="+263 77 123 4567"
                    required
                    error={errors.contactPhone}
                  />
                </div>
              </div>
            )}

            {/* Documents Step */}
            {currentStep === 'documents' && (
              <div className="space-y-4">
                {!applicationId && (
                  <div className="bg-muted/50 rounded-lg p-4 text-center text-muted-foreground">
                    <AlertCircle className="mx-auto mb-2" size={24} />
                    <p>Please complete the previous steps to upload documents.</p>
                  </div>
                )}
                {applicationId && (
                  <>
                    <FileUploadField
                      label="Business Registration Certificate"
                      description="Upload your company registration document (PDF or Image, max 10MB)"
                      file={documents.businessRegistration}
                      isUploading={uploadingDoc === 'businessRegistration'}
                      onUpload={(file) => handleFileUpload('businessRegistration', file)}
                      onRemove={() => handleFileRemove('businessRegistration')}
                    />
                    <FileUploadField
                      label="Director ID Copy"
                      description="National ID or Passport of the company director"
                      file={documents.directorId}
                      isUploading={uploadingDoc === 'directorId'}
                      onUpload={(file) => handleFileUpload('directorId', file)}
                      onRemove={() => handleFileRemove('directorId')}
                    />
                    <FileUploadField
                      label="Proof of Address"
                      description="Utility bill or bank statement (not older than 3 months)"
                      file={documents.proofOfAddress}
                      isUploading={uploadingDoc === 'proofOfAddress'}
                      onUpload={(file) => handleFileUpload('proofOfAddress', file)}
                      onRemove={() => handleFileRemove('proofOfAddress')}
                    />
                  </>
                )}
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <div className="space-y-6">
                <div className="bg-muted/50 rounded-xl p-5">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Building2 size={18} className="text-primary" />
                    Business Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Business Name:</span>
                      <p className="font-medium text-foreground">{formData.businessName || '-'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trading Name:</span>
                      <p className="font-medium text-foreground">{formData.tradingName || '-'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Business Type:</span>
                      <p className="font-medium text-foreground">{formData.businessType || '-'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Registration Number:</span>
                      <p className="font-medium text-foreground">{formData.registrationNumber || '-'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tax ID:</span>
                      <p className="font-medium text-foreground">{formData.taxId || '-'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Website:</span>
                      <p className="font-medium text-foreground">{formData.websiteUrl || '-'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground">Address:</span>
                      <p className="font-medium text-foreground">
                        {formData.businessAddress}, {formData.city}
                        {formData.province && `, ${formData.province}`}
                        {formData.postalCode && ` ${formData.postalCode}`}, {formData.country}
                      </p>
                    </div>
                    {formData.businessDescription && (
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Description:</span>
                        <p className="font-medium text-foreground">{formData.businessDescription}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-5">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <User size={18} className="text-primary" />
                    Contact Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Contact Person:</span>
                      <p className="font-medium text-foreground">{formData.contactName || '-'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium text-foreground">{formData.contactEmail || '-'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <p className="font-medium text-foreground">{formData.contactPhone || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-5">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-primary" />
                    Uploaded Documents
                  </h4>
                  <div className="space-y-2 text-sm">
                    {[
                      { key: 'businessRegistration', label: 'Business Registration' },
                      { key: 'directorId', label: 'Director ID' },
                      { key: 'proofOfAddress', label: 'Proof of Address' },
                    ].map(({ key, label }) => {
                      const file = documents[key as keyof DocumentState];
                      return (
                        <div key={key} className="flex items-center gap-2">
                          {file ? (
                            <>
                              <CheckCircle size={16} className="text-success" />
                              <span className="text-foreground">{file.name}</span>
                            </>
                          ) : (
                            <>
                              <X size={16} className="text-destructive" />
                              <span className="text-muted-foreground">{label} - Not uploaded</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
              >
                <ArrowLeft size={18} className="mr-2" />
                Back
              </Button>
              
              {currentStep === 'review' ? (
                <Button 
                  variant="hero" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  onClick={handleNext}
                  disabled={createApplication.isPending}
                >
                  {createApplication.isPending ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ApplicationForm;
