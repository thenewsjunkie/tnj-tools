import { Outlet } from "react-router-dom";
import ConditionalGlobalQueueManager from "@/components/alerts/ConditionalGlobalQueueManager";

const AppLayout = () => {
  return (
    <>
      <ConditionalGlobalQueueManager />
      <Outlet />
    </>
  );
};

export default AppLayout;