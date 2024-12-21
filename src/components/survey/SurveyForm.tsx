import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { ContactStep, DemographicsStep, EmploymentStep, VehicleStep } from "./SurveyStep";
import { FormData, SurveyStepProps } from "./types";

const initialFormData: FormData = {
  email: "",
  age: 0,
  gender: "",
  employment_status: "full_time",
  income_bracket: "25k_50k",
  marital_status: "single",
  children_count: 0,
  car_make: "",
  car_year: new Date().getFullYear(),
  zip_code: "",
  education_level: "",
  home_ownership: "",
  preferred_social_media: [],
  shopping_preferences: [],
  favorite_stores: [],
  media_consumption_habits: {}
};

const SurveyForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const steps: SurveyStepProps[] = [
    {
      id: "contact",
      title: "Contact Information",
      component: <ContactStep formData={formData} handleInputChange={handleInputChange} />
    },
    {
      id: "demographics",
      title: "About You",
      component: <DemographicsStep formData={formData} handleInputChange={handleInputChange} />
    },
    {
      id: "employment",
      title: "Employment & Income",
      component: <EmploymentStep formData={formData} handleInputChange={handleInputChange} />
    },
    {
      id: "vehicle",
      title: "Vehicle Information",
      component: <VehicleStep formData={formData} handleInputChange={handleInputChange} />
    }
  ];

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from('survey_responses')
        .insert([formData]);

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Survey Submitted",
        description: "Thank you for participating in our audience survey!",
      });
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting your survey. Please try again.",
        variant: "destructive",
      });
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4 py-8">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold">Thank You!</h2>
        <p className="text-muted-foreground">
          Your response helps us understand our audience better.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
        <p className="text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>

      <div className="min-h-[200px]">
        {steps[currentStep].component}
      </div>

      <Progress value={progress} className="w-full" />

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => prev - 1)}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button onClick={handleSubmit}>
            Submit
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={() => setCurrentStep(prev => prev + 1)}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SurveyForm;