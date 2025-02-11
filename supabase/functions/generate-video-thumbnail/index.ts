
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { decode } from "https://deno.land/x/imagescript@1.2.17/mod.ts";
import { FFmpeg } from "https://esm.sh/@ffmpeg/ffmpeg";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { videoUrl, timestamp = 0 } = await req.json()

    if (!videoUrl) {
      throw new Error('No video URL provided')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Download video file
    const response = await fetch(videoUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch video')
    }
    const videoBuffer = await response.arrayBuffer()

    // Initialize FFmpeg
    const ffmpeg = new FFmpeg()
    await ffmpeg.load()

    // Write video file to FFmpeg's virtual filesystem
    await ffmpeg.writeFile('input.mp4', new Uint8Array(videoBuffer))

    // Extract frame at specified timestamp
    await ffmpeg.exec([
      '-ss', timestamp.toString(),
      '-i', 'input.mp4',
      '-vframes', '1',
      '-f', 'image2',
      'thumbnail.jpg'
    ])

    // Read the generated thumbnail
    const thumbnailData = await ffmpeg.readFile('thumbnail.jpg')
    const thumbnailBlob = new Blob([thumbnailData], { type: 'image/jpeg' })

    // Generate unique filename
    const fileName = `${crypto.randomUUID()}.jpg`
    const filePath = `thumbnails/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('video_bytes')
      .upload(filePath, thumbnailBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600'
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('video_bytes')
      .getPublicUrl(filePath)

    return new Response(
      JSON.stringify({ url: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating thumbnail:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
