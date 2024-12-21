import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";
import SurveyForm from "@/components/survey/SurveyForm";

const Index = () => {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-4">
      <nav className="fixed top-0 right-0 p-4 flex items-center gap-4">
        <div className="flex items-center">
          <ThemeToggle />
        </div>
        <Link 
          to="/login" 
          className={`${
            theme === 'light' ? 'text-black' : 'text-white'
          } hover:text-neon-red transition-colors px-4 py-2 border border-white/20 rounded`}
        >
          Login
        </Link>
      </nav>
      
      <div className={`digital text-[clamp(2rem,10vw,6rem)] leading-none ${
        theme === 'light' ? 'text-red-600' : 'text-neon-red'
      } animate-led-flicker tracking-tight mb-8 mt-20`}>
        TNJ Tools
      </div>

      <div className="w-full max-w-md mx-auto bg-card rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-center mb-6">
          Audience Survey
        </h2>
        <SurveyForm />
      </div>
      
      <div className={`fixed bottom-8 ${theme === 'light' ? 'text-black' : 'text-white/50'} text-sm`}>
        tnjtools.com
      </div>
    </div>
  );
};

export default Index;