import { Route } from "react-router-dom";
import AdminRoute from "./AdminRoute";

// Pages
import Index from "@/pages/Index";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
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

export const publicRoutes = (
  <>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/reviews" element={<Reviews />} />
    <Route path="/reviews/stream" element={<StreamReview />} />
    <Route path="/alerts" element={<Alerts />} />
    <Route path="/alerts/queue/:action" element={<Alerts />} />
    <Route path="/alerts/:alertSlug" element={<Alerts />} />
    <Route path="/alerts/:alertSlug/:username" element={<Alerts />} />
    <Route path="/alerts/:alertSlug/:username/:giftCount" element={<Alerts />} />
    <Route path="/fritz" element={<Fritz />} />
    <Route path="/fritz/current-score" element={<CurrentScore />} />
    <Route path="/fritz/total-score" element={<TotalScore />} />
    <Route path="/fritz/:contestant/:action" element={<FritzScoreHandler />} />
    <Route path="/lower-third" element={<LowerThird />} />
    <Route path="/leaderboard" element={<Leaderboard />} />
    <Route path="/leaderboard/obs" element={<LeaderboardOBS />} />
  </>
);

export const adminRoutes = (
  <>
    <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
    <Route path="/admin/settings" element={<AdminRoute><Settings /></AdminRoute>} />
    <Route path="/admin/instructions" element={<AdminRoute><Instructions /></AdminRoute>} />
    <Route path="/admin/queue-history" element={<AdminRoute><QueueHistory /></AdminRoute>} />
    <Route path="/admin/lower-thirds" element={<AdminRoute><LowerThirds /></AdminRoute>} />
    <Route path="/admin/gift-stats" element={<AdminRoute><GiftStats /></AdminRoute>} />
  </>
);