import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData } from "./types";

type StepProps = {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: any) => void;
};

export const ContactStep = ({ formData, handleInputChange }: StepProps) => (
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
);

export const DemographicsStep = ({ formData, handleInputChange }: StepProps) => (
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
);

export const EmploymentStep = ({ formData, handleInputChange }: StepProps) => (
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
);

export const VehicleStep = ({ formData, handleInputChange }: StepProps) => (
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
);