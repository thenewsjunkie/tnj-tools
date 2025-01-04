import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const RouteTracker = () => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    console.log("[Router] Route changed to:", location.pathname);
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [location]);

  if (isTransitioning) {
    return (
      <div 
        className="fixed inset-0 bg-black z-50 transition-opacity duration-100" 
        style={{ opacity: 0.5 }}
      />
    );
  }

  return null;
};

export default RouteTracker;