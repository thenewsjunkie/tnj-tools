
import { createBrowserRouter } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import AdminRoute from "./AdminRoute";
import Reviews from "@/pages/Reviews";
import Alerts from "@/pages/Alerts";
import Settings from "@/pages/Settings";
import Instructions from "@/pages/Instructions";
import QueueHistory from "@/pages/QueueHistory";
import Fritz from "@/pages/Fritz";
import CurrentScore from "@/pages/CurrentScore";
import TotalScore from "@/pages/TotalScore";
import FritzScoreHandler from "@/components/fritz/FritzScoreHandler";
import LowerThird from "@/pages/LowerThird";
import LowerThirds from "@/pages/Admin/LowerThirds";
import Leaderboard from "@/pages/Leaderboard";
import LeaderboardOBS from "@/pages/LeaderboardOBS";
import GiftStats from "@/pages/Admin/GiftStats";
import StreamReview from "@/pages/StreamReview";
import TNJAiOBSPage from "@/pages/TNJAiOBSPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/reviews",
    element: <Reviews />,
  },
  {
    path: "/reviews/stream",
    element: <StreamReview />,
  },
  {
    path: "/alerts",
    element: <Alerts />,
  },
  {
    path: "/alerts/queue/:action",
    element: <Alerts />,
  },
  {
    path: "/alerts/:alertSlug",
    element: <Alerts />,
  },
  {
    path: "/alerts/:alertSlug/:username",
    element: <Alerts />,
  },
  {
    path: "/alerts/:alertSlug/:username/:giftCount",
    element: <Alerts />,
  },
  {
    path: "/fritz",
    element: <Fritz />,
  },
  {
    path: "/fritz/current-score",
    element: <CurrentScore />,
  },
  {
    path: "/fritz/total-score",
    element: <TotalScore />,
  },
  {
    path: "/fritz/:contestant/:action",
    element: <FritzScoreHandler />,
  },
  {
    path: "/lower-third",
    element: <LowerThird />,
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
    path: "/admin",
    element: <AdminRoute><Admin /></AdminRoute>,
  },
  {
    path: "/admin/settings",
    element: <AdminRoute><Settings /></AdminRoute>,
  },
  {
    path: "/admin/instructions",
    element: <AdminRoute><Instructions /></AdminRoute>,
  },
  {
    path: "/admin/queue-history",
    element: <AdminRoute><QueueHistory /></AdminRoute>,
  },
  {
    path: "/admin/lower-thirds",
    element: <AdminRoute><LowerThirds /></AdminRoute>,
  },
  {
    path: "/admin/gift-stats",
    element: <AdminRoute><GiftStats /></AdminRoute>,
  },
  {
    path: "/tnj-ai-obs",
    element: <TNJAiOBSPage />,
  },
]);
