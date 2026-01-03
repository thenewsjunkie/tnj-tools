import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Capturing screenshot for URL:", url);

    // Fetch screenshot from thum.io (don't encode URL - thum.io expects raw URL)
    const thumbUrl = `https://image.thum.io/get/width/600/${url}`;
    console.log("Fetching from thum.io:", thumbUrl);

    const imageResponse = await fetch(thumbUrl);

    if (!imageResponse.ok) {
      console.error("Failed to fetch screenshot from thum.io:", imageResponse.status);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to capture screenshot" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageBlob = await imageResponse.arrayBuffer();
    console.log("Screenshot fetched, size:", imageBlob.byteLength, "bytes");

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate unique filename
    const timestamp = Date.now();
    const urlHash = btoa(url).replace(/[^a-zA-Z0-9]/g, "").substring(0, 20);
    const fileName = `${urlHash}_${timestamp}.png`;

    console.log("Uploading to storage as:", fileName);

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("resource_thumbnails")
      .upload(fileName, imageBlob, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Failed to upload screenshot:", uploadError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to store screenshot" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("resource_thumbnails")
      .getPublicUrl(fileName);

    console.log("Screenshot stored successfully:", publicUrlData.publicUrl);

    return new Response(
      JSON.stringify({ success: true, thumbnailUrl: publicUrlData.publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error capturing screenshot:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
