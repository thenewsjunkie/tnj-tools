import { useTheme } from "@/components/theme/ThemeProvider";
import SurveyForm from "@/components/survey/SurveyForm";

const Survey = () => {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-4">
      <div className={`digital text-[clamp(1.5rem,5vw,3rem)] leading-none ${
        theme === 'light' ? 'text-red-600' : 'text-neon-red'
      } animate-led-flicker tracking-tight mb-8 mt-20`}>
        TNJ Audience Survey
      </div>

      <div className="w-full max-w-md mx-auto bg-card rounded-lg shadow-lg p-6 mb-8">
        <SurveyForm />
      </div>
    </div>
  );
};

export default Survey;