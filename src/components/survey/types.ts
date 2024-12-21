export type FormData = {
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

export type SurveyStepProps = {
  title: string;
  component: React.ReactNode;
  id: string;
};