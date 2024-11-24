import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ScreenShare = () => {
  const { code } = useParams();
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const checkCode = async () => {
      if (!code) {
        setIsValid(false);
        return;
      }

      const { data, error } = await supabase
        .from("screen_share_sessions")
        .select()
        .eq("share_code", code)
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Error checking share code:", error);
        setIsValid(false);
        return;
      }

      // Check if the session exists and hasn't expired
      const isValidSession = data && new Date(data.expires_at) > new Date();
      setIsValid(isValidSession);

      // If session is expired, update is_active to false
      if (data && !isValidSession) {
        await supabase
          .from("screen_share_sessions")
          .update({ is_active: false })
          .eq("id", data.id);
      }
    };

    checkCode();
  }, [code]);

  if (isValid === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Invalid or expired share code</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white">Screen share viewer for code: {code}</p>
    </div>
  );
};

export default ScreenShare;