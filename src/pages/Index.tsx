import { Card } from "@/components/ui/card";
import { useTheme } from "@/components/theme/ThemeProvider";
import TNJLinks from "@/components/TNJLinks";

const Index = () => {
  const { theme } = useTheme();
  const bgColor = theme === 'light' ? 'bg-white' : 'bg-black/50';

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className={`${bgColor} border border-gray-200 dark:border-white/10`}>
        <TNJLinks />
      </Card>
    </div>
  );
};

export default Index;