
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7'

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

    console.log('Fetching video from:', videoUrl)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Download video file
    const response = await fetch(videoUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`)
    }
    const videoBuffer = await response.arrayBuffer()

    console.log('Video downloaded, size:', videoBuffer.byteLength)

    // Initialize FFmpeg
    const ffmpeg = new FFmpeg()
    await ffmpeg.load()

    console.log('FFmpeg loaded')

    // Write video file to FFmpeg's virtual filesystem
    await ffmpeg.writeFile('input.mp4', new Uint8Array(videoBuffer))

    console.log('Video written to FFmpeg filesystem')

    // Extract frame at specified timestamp
    await ffmpeg.exec([
      '-ss', timestamp.toString(),
      '-i', 'input.mp4',
      '-vframes', '1',
      '-f', 'image2',
      '-vf', 'scale=1280:-1', // Scale to 1280px width, maintain aspect ratio
      'thumbnail.jpg'
    ])

    console.log('Frame extracted')

    // Read the generated thumbnail
    const thumbnailData = await ffmpeg.readFile('thumbnail.jpg')
    const thumbnailBlob = new Blob([thumbnailData], { type: 'image/jpeg' })

    console.log('Thumbnail generated')

    // Upload to Supabase Storage
    const fileName = `${crypto.randomUUID()}.jpg`
    const filePath = `thumbnails/${fileName}`

    // Ensure thumbnails directory exists (create it if it doesn't)
    try {
      const { data: dirData, error: dirError } = await supabase.storage
        .from('video_bytes')
        .list('thumbnails')

      if (dirError) {
        // If directory doesn't exist, create it with an empty file
        const emptyBlob = new Blob([''], { type: 'text/plain' })
        await supabase.storage
          .from('video_bytes')
          .upload('thumbnails/.keep', emptyBlob)
      }
    } catch (error) {
      console.log('Directory check/creation error:', error)
      // Continue anyway as the upload might still work
    }

    // Upload the thumbnail
    const { error: uploadError } = await supabase.storage
      .from('video_bytes')
      .upload(filePath, thumbnailBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true // Use upsert in case the file already exists
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    console.log('Thumbnail uploaded to storage')

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
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})
