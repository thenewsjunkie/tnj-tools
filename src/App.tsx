import { createBrowserRouter } from "react-router-dom";
import Alerts from "@/pages/Alerts";
import CurrentScore from "@/pages/CurrentScore";
import Instructions from "@/pages/Instructions";
import Index from "@/pages/Index";
import Fritz from "@/pages/Fritz";
import Notes from "@/pages/Notes";
import QueueHistory from "@/pages/QueueHistory";
import Reviews from "@/pages/Reviews";
import Settings from "@/pages/Settings";
import Leaderboard from "@/pages/Leaderboard";
import LeaderboardOBS from "@/pages/LeaderboardOBS";
import StreamReview from "@/pages/StreamReview";
import Login from "@/pages/Login";
import TotalScore from "@/pages/TotalScore";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin",
    element: <Settings />,
  },
  {
    path: "/admin/instructions",
    element: <Instructions />,
  },
  {
    path: "/admin/alerts",
    element: <Alerts />,
  },
  {
    path: "/admin/current-score",
    element: <CurrentScore />,
  },
  {
    path: "/admin/fritz",
    element: <Fritz />,
  },
  {
    path: "/admin/notes",
    element: <Notes />,
  },
  {
    path: "/admin/queue-history",
    element: <QueueHistory />,
  },
  {
    path: "/admin/reviews",
    element: <Reviews />,
  },
  {
    path: "/leaderboard",
    element: <Leaderboard />,
  },
  {
    path: "/leaderboard/obs",
    element: <LeaderboardOBS />,
  },
  {
    path: "/stream-review",
    element: <StreamReview />,
  },
  {
    path: "/total-score",
    element: <TotalScore />,
  },
]);

export default router;
