
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { createFFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.8.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { videoUrl, timestamp = 0 } = await req.json()

    if (!videoUrl) {
      throw new Error('No video URL provided')
    }

    console.log('Processing request:', { videoUrl, timestamp })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // First verify if video exists and is accessible
    try {
      const preflightResponse = await fetch(videoUrl, { method: 'HEAD' })
      if (!preflightResponse.ok) {
        throw new Error(`Video not accessible: ${preflightResponse.statusText}`)
      }
      console.log('Video is accessible')
    } catch (error) {
      console.error('Video preflight check failed:', error)
      throw new Error(`Failed to verify video accessibility: ${error.message}`)
    }

    // Download and process video file
    console.log('Downloading video...')
    const response = await fetch(videoUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`)
    }
    const videoBuffer = await response.arrayBuffer()
    console.log('Video downloaded, size:', videoBuffer.byteLength)

    // Initialize FFmpeg
    console.log('Initializing FFmpeg...')
    const ffmpeg = createFFmpeg({
      log: true,
      corePath: 'https://unpkg.com/@ffmpeg/core@0.8.5/dist/ffmpeg-core.js'
    })
    await ffmpeg.load()
    console.log('FFmpeg loaded')

    // Write video file to FFmpeg's virtual filesystem
    console.log('Writing video to FFmpeg filesystem...')
    ffmpeg.FS('writeFile', 'input.mp4', new Uint8Array(videoBuffer))
    console.log('Video written to FFmpeg filesystem')

    // Extract frame at specified timestamp
    console.log(`Extracting frame at timestamp: ${timestamp}`)
    await ffmpeg.run(
      '-ss', timestamp.toString(),
      '-i', 'input.mp4',
      '-vframes', '1',
      '-f', 'image2',
      '-vf', 'scale=1280:-1',
      'thumbnail.jpg'
    )
    console.log('Frame extracted')

    // Read the generated thumbnail
    const thumbnailData = ffmpeg.FS('readFile', 'thumbnail.jpg')
    if (!thumbnailData) {
      throw new Error('Failed to generate thumbnail')
    }
    const thumbnailBlob = new Blob([thumbnailData], { type: 'image/jpeg' })
    console.log('Thumbnail generated, size:', thumbnailData.length)

    // Clean up FFmpeg filesystem
    ffmpeg.FS('unlink', 'input.mp4')
    ffmpeg.FS('unlink', 'thumbnail.jpg')

    // Upload to Supabase Storage
    const fileName = `${crypto.randomUUID()}.jpg`
    const filePath = `thumbnails/${fileName}`

    // Create thumbnails directory if it doesn't exist
    console.log('Checking thumbnails directory...')
    try {
      const { error: dirError } = await supabase.storage
        .from('video_bytes')
        .list('thumbnails')

      if (dirError) {
        console.log('Creating thumbnails directory...')
        const emptyBlob = new Blob([''], { type: 'text/plain' })
        const { error: createDirError } = await supabase.storage
          .from('video_bytes')
          .upload('thumbnails/.keep', emptyBlob)

        if (createDirError) {
          throw new Error(`Failed to create thumbnails directory: ${createDirError.message}`)
        }
        console.log('Thumbnails directory created')
      }
    } catch (error) {
      console.error('Directory operation error:', error)
      throw new Error(`Failed to manage thumbnails directory: ${error.message}`)
    }

    // Upload the thumbnail
    console.log('Uploading thumbnail...')
    const { error: uploadError } = await supabase.storage
      .from('video_bytes')
      .upload(filePath, thumbnailBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Failed to upload thumbnail: ${uploadError.message}`)
    }

    console.log('Thumbnail uploaded successfully')

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('video_bytes')
      .getPublicUrl(filePath)

    console.log('Operation completed successfully')

    return new Response(
      JSON.stringify({ url: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-video-thumbnail:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorDetails = error instanceof Error ? error.stack : String(error)
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})
