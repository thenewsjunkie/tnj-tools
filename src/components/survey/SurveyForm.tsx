import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";

type FormData = {
  email: string;
  age: number;
  gender: string;
  employment_status: "full_time" | "part_time" | "self_employed" | "unemployed" | "student" | "retired";
  income_bracket: "under_25k" | "25k_50k" | "50k_75k" | "75k_100k" | "100k_150k" | "over_150k";
  marital_status: "single" | "married" | "divorced" | "widowed" | "separated" | "domestic_partnership";
  children_count: number;
  car_make: string;
  car_year: number;
  zip_code: string;
  education_level: string;
  home_ownership: string;
  preferred_social_media: string[];
  shopping_preferences: string[];
  favorite_stores: string[];
  media_consumption_habits: Record<string, any>;
};

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

  const steps: SurveyStep[] = [
    {
      id: "contact",
      title: "Contact Information",
      component: (
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
          <Input
            type="text"
            placeholder="ZIP Code"
            value={formData.zip_code}
            onChange={(e) => handleInputChange("zip_code", e.target.value)}
          />
        </div>
      )
    },
    {
      id: "demographics",
      title: "About You",
      component: (
        <div className="space-y-4">
          <Input
            type="number"
            placeholder="Age"
            value={formData.age}
            onChange={(e) => handleInputChange("age", parseInt(e.target.value))}
          />
          <Select
            value={formData.gender}
            onValueChange={(value) => handleInputChange("gender", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    },
    {
      id: "employment",
      title: "Employment & Income",
      component: (
        <div className="space-y-4">
          <Select
            value={formData.employment_status}
            onValueChange={(value) => handleInputChange("employment_status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Employment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="self_employed">Self Employed</SelectItem>
              <SelectItem value="unemployed">Unemployed</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={formData.income_bracket}
            onValueChange={(value) => handleInputChange("income_bracket", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Annual Income" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under_25k">Under $25,000</SelectItem>
              <SelectItem value="25k_50k">$25,000 - $50,000</SelectItem>
              <SelectItem value="50k_75k">$50,000 - $75,000</SelectItem>
              <SelectItem value="75k_100k">$75,000 - $100,000</SelectItem>
              <SelectItem value="100k_150k">$100,000 - $150,000</SelectItem>
              <SelectItem value="over_150k">Over $150,000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    },
    {
      id: "family",
      title: "Family Status",
      component: (
        <div className="space-y-4">
          <Select
            value={formData.marital_status}
            onValueChange={(value) => handleInputChange("marital_status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Marital Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
              <SelectItem value="separated">Separated</SelectItem>
              <SelectItem value="domestic_partnership">Domestic Partnership</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Number of Children"
            value={formData.children_count}
            onChange={(e) => handleInputChange("children_count", parseInt(e.target.value))}
          />
        </div>
      )
    },
    {
      id: "vehicle",
      title: "Vehicle Information",
      component: (
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Car Make"
            value={formData.car_make}
            onChange={(e) => handleInputChange("car_make", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Car Year"
            value={formData.car_year}
            onChange={(e) => handleInputChange("car_year", parseInt(e.target.value))}
          />
        </div>
      )
    }
  ];

const SurveyForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => {
      if (field === 'age' || field === 'children_count' || field === 'car_year') {
        return { ...prev, [field]: parseInt(value) || 0 };
      }
      return { ...prev, [field]: value };
    });
  };

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
