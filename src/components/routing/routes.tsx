
import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import AdminRoute from "./AdminRoute";

const AppLayout = lazy(() => import("@/components/layout/AppLayout"));
const Index = lazy(() => import("@/pages/Index"));
const Login = lazy(() => import("@/pages/Login"));
const Admin = lazy(() => import("@/pages/Admin"));
const Reviews = lazy(() => import("@/pages/Reviews"));
const Alerts = lazy(() => import("@/pages/Alerts"));
const Settings = lazy(() => import("@/pages/Settings"));
const Instructions = lazy(() => import("@/pages/Instructions"));
const QueueHistory = lazy(() => import("@/pages/QueueHistory"));
const Fritz = lazy(() => import("@/pages/Fritz"));
const CurrentScore = lazy(() => import("@/pages/CurrentScore"));
const TotalScore = lazy(() => import("@/pages/TotalScore"));
const FritzScoreHandler = lazy(() => import("@/components/fritz/FritzScoreHandler"));
const LowerThird = lazy(() => import("@/pages/LowerThird"));
const LowerThirds = lazy(() => import("@/pages/Admin/LowerThirds"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const LeaderboardOBS = lazy(() => import("@/pages/LeaderboardOBS"));
const GiftStats = lazy(() => import("@/pages/Admin/GiftStats"));
const StreamReview = lazy(() => import("@/pages/StreamReview"));
const TNJAiOBSPage = lazy(() => import("@/pages/TNJAiOBSPage"));
const ShareTheShow = lazy(() => import("@/pages/ShareTheShow"));
const EditShowMember = lazy(() => import("@/pages/EditShowMember"));
const TNJGifs = lazy(() => import("@/pages/TNJGifs"));
const TNJGifsEmbed = lazy(() => import("@/pages/TNJGifsEmbed"));
const ManageGifs = lazy(() => import("@/pages/Admin/ManageGifs"));
const ManagePolls = lazy(() => import("@/pages/Admin/ManagePolls"));
const PollEmbed = lazy(() => import("@/pages/PollEmbed"));
const RealtimeAI = lazy(() => import("@/pages/RealtimeAI"));
const GreenScreen = lazy(() => import("@/pages/GreenScreen"));
const Resources = lazy(() => import("@/pages/Resources"));
const TopicResources = lazy(() => import("@/pages/TopicResources"));
const TopicArchive = lazy(() => import("@/pages/TopicArchive"));
const LowerThirdGenerator = lazy(() => import("@/pages/LowerThirdGenerator"));
const InsertGenerator = lazy(() => import("@/pages/InsertGenerator"));
const FullTruth = lazy(() => import("@/pages/FullTruth"));
const FullTruthBuilder = lazy(() => import("@/pages/FullTruthBuilder"));
const FullTruthViewer = lazy(() => import("@/pages/FullTruthViewer"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<div className="p-8 text-muted-foreground">Loading...</div>}>
        <AppLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "reviews",
        element: <Reviews />,
      },
      {
        path: "reviews/stream",
        element: <StreamReview />,
      },
      {
        path: "alerts",
        element: <Alerts />,
      },
      {
        path: "alerts/queue/:action",
        element: <Alerts />,
      },
      {
        path: "alerts/:alertSlug",
        element: <Alerts />,
      },
      {
        path: "alerts/:alertSlug/:username",
        element: <Alerts />,
      },
      {
        path: "alerts/:alertSlug/:username/:giftCount",
        element: <Alerts />,
      },
      {
        path: "fritz",
        element: <Fritz />,
      },
      {
        path: "fritz/current-score",
        element: <CurrentScore />,
      },
      {
        path: "fritz/total-score",
        element: <TotalScore />,
      },
      {
        path: "fritz/:contestant/:action",
        element: <FritzScoreHandler />,
      },
      {
        path: "lower-third",
        element: <LowerThird />,
      },
      {
        path: "leaderboard",
        element: <Leaderboard />,
      },
      {
        path: "leaderboard/obs",
        element: <LeaderboardOBS />,
      },
      {
        path: "tnjgifs",
        element: <TNJGifs />,
      },
      {
        path: "tnjgifs-embed",
        element: <TNJGifsEmbed />,
      },
      {
        path: "poll/:id",
        element: <PollEmbed />,
      },
      {
        path: "admin",
        element: <AdminRoute><Admin /></AdminRoute>,
      },
      {
        path: "admin/settings",
        element: <AdminRoute><Settings /></AdminRoute>,
      },
      {
        path: "admin/instructions",
        element: <AdminRoute><Instructions /></AdminRoute>,
      },
      {
        path: "admin/queue-history",
        element: <AdminRoute><QueueHistory /></AdminRoute>,
      },
      {
        path: "admin/lower-thirds",
        element: <AdminRoute><LowerThirds /></AdminRoute>,
      },
      {
        path: "admin/gift-stats",
        element: <AdminRoute><GiftStats /></AdminRoute>,
      },
      {
        path: "admin/manage-gifs",
        element: <AdminRoute><ManageGifs /></AdminRoute>,
      },
      {
        path: "admin/manage-polls",
        element: <AdminRoute><ManagePolls /></AdminRoute>,
      },
      {
        path: "tnj-ai-obs",
        element: <TNJAiOBSPage />,
      },
      {
        path: "sharetheshow",
        element: <ShareTheShow />,
      },
      {
        path: "sharetheshow/edit",
        element: <EditShowMember />,
      },
      {
        path: "realtime-ai",
        element: <RealtimeAI />,
      },
      {
        path: "green-screen",
        element: <GreenScreen />,
      },
      {
        path: "resources",
        element: <Resources />,
      },
      {
        path: "lower-third-generator",
        element: <LowerThirdGenerator />,
      },
      {
        path: "insert-generator",
        element: <InsertGenerator />,
      },
      {
        path: "admin/topic-resources/:date/:topicId",
        element: <AdminRoute><TopicResources /></AdminRoute>,
      },
      {
        path: "admin/topic-archive",
        element: <AdminRoute><TopicArchive /></AdminRoute>,
      },
      {
        path: "full-truth",
        element: <FullTruth />,
      },
      {
        path: "full-truth/new",
        element: <AdminRoute><FullTruthBuilder /></AdminRoute>,
      },
      {
        path: "full-truth/edit/:id",
        element: <AdminRoute><FullTruthBuilder /></AdminRoute>,
      },
      {
        path: "full-truth/view/:slug",
        element: <FullTruthViewer />,
      },
    ]
  }
]);
