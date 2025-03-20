
import { Link } from "react-router-dom";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  BellRing, 
  Music, 
  Clock, 
  Gift, 
  Star, 
  BarChart, 
  MessageCircle, 
  Command, 
  Settings,
  Users,
  ImagePlus
} from "lucide-react";

const Index = () => {
  const { theme } = useTheme();
  const { isAdmin } = useAuth();

  const cards = [
    {
      title: "Alerts",
      description: "Manage stream alerts and effects",
      icon: <BellRing className="h-6 w-6" />,
      to: "/alerts",
    },
    {
      title: "Fritz",
      description: "Manage Fritz contestants and scores",
      icon: <Music className="h-6 w-6" />,
      to: "/fritz",
    },
    {
      title: "Stopwatch",
      description: "Countdown timer for stream segments",
      icon: <Clock className="h-6 w-6" />,
      to: "/admin",
    },
    {
      title: "Gift Stats",
      description: "Track gifts and top givers",
      icon: <Gift className="h-6 w-6" />,
      to: "/admin/gift-stats",
      adminOnly: true,
    },
    {
      title: "Reviews",
      description: "Manage movie and product reviews",
      icon: <Star className="h-6 w-6" />,
      to: "/reviews",
    },
    {
      title: "Leaderboard",
      description: "View gift leaderboard",
      icon: <BarChart className="h-6 w-6" />,
      to: "/leaderboard",
    },
    {
      title: "Chat",
      description: "Text-to-speech for stream chat",
      icon: <MessageCircle className="h-6 w-6" />,
      to: "/admin",
    },
    {
      title: "Lower Thirds",
      description: "Manage lower third overlays",
      icon: <Command className="h-6 w-6" />,
      to: isAdmin ? "/admin/lower-thirds" : "/lower-third",
    },
    {
      title: "Settings",
      description: "Configure application settings",
      icon: <Settings className="h-6 w-6" />,
      to: "/admin/settings",
      adminOnly: true,
    },
    {
      title: "Share The Show",
      description: "Manage social media links",
      icon: <Users className="h-6 w-6" />,
      to: "/sharetheshow",
    },
    {
      title: "TNJ GIFs",
      description: "Upload and browse animated GIFs",
      icon: <ImagePlus className="h-6 w-6" />,
      to: "/tnjgifs",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">TNJ Dashboard</h1>
            <p className="text-muted-foreground">
              News Junkie Stream Tools
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards
            .filter((card) => !card.adminOnly || isAdmin)
            .map((card) => (
              <Link
                key={card.title}
                to={card.to}
                className="no-underline"
              >
                <div className="bg-card rounded-xl border shadow-sm h-full p-6 hover:border-primary transition-colors">
                  <div className="flex flex-col h-full">
                    <div className="mb-4 rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center text-primary">
                      {card.icon}
                    </div>
                    <h2 className="text-xl font-semibold">{card.title}</h2>
                    <p className="text-muted-foreground">{card.description}</p>
                  </div>
                </div>
              </Link>
            ))}
        </div>

        {!isAdmin && (
          <div className="mt-6 text-center">
            <Link to="/login">
              <Button variant="outline">Admin Login</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
