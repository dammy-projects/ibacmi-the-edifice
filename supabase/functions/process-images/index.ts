import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      flipbook_files: {
        Row: {
          id: string
          flipbook_id: string
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          conversion_status: string
          total_pages: number | null
          converted_pages: number | null
          uploaded_at: string
        }
        Update: {
          conversion_status?: string
          total_pages?: number | null
          converted_pages?: number | null
        }
      }
      pages: {
        Insert: {
          id?: string
          flipbook_id: string
          page_number: number
          image_url: string
          text_content?: string | null
          created_at?: string
        }
      }
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { fileId, flipbookId, images } = await req.json()

    if (!fileId || !flipbookId || !images || !Array.isArray(images)) {
      throw new Error('File ID, flipbook ID, and images array are required')
    }

    console.log(`Processing ${images.length} images for flipbook: ${flipbookId}`)

    // Update status to processing
    await supabaseClient
      .from('flipbook_files')
      .update({ 
        conversion_status: 'processing',
        converted_pages: 0
      })
      .eq('id', fileId)

    // Clear any existing pages for this flipbook
    await supabaseClient
      .from('pages')
      .delete()
      .eq('flipbook_id', flipbookId)

    console.log(`Creating ${images.length} pages from uploaded images`)

    // Create page records from uploaded images
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const pageNumber = i + 1;
      
      try {
        // Get public URL for the uploaded image
        const { data: publicUrlData } = supabaseClient.storage
          .from('flipbook-assets')
          .getPublicUrl(image.fileName)

        console.log(`Creating page ${pageNumber} with image: ${publicUrlData.publicUrl}`)

        // Create page record
        const { data: pageData, error: pageError } = await supabaseClient
          .from('pages')
          .insert({
            flipbook_id: flipbookId,
            page_number: pageNumber,
            image_url: publicUrlData.publicUrl,
            text_content: `Page ${pageNumber} - ${image.originalName}`
          })
          .select()

        if (pageError) {
          console.error(`Error creating page ${pageNumber}:`, pageError)
          continue
        }

        console.log(`Successfully created page ${pageNumber}:`, pageData)

        // Update progress
        await supabaseClient
          .from('flipbook_files')
          .update({ converted_pages: pageNumber })
          .eq('id', fileId)

        console.log(`Updated progress: ${pageNumber}/${images.length}`)

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (pageError) {
        console.error(`Error processing page ${pageNumber}:`, pageError)
        continue
      }
    }

    // Mark as completed
    await supabaseClient
      .from('flipbook_files')
      .update({ 
        conversion_status: 'completed',
        converted_pages: images.length
      })
      .eq('id', fileId)

    console.log(`Image processing completed for flipbook ${flipbookId}. Created ${images.length} pages.`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Images processed successfully. ${images.length} pages created.`,
        totalPages: images.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Image processing error:', error)
    
    // Try to update file status to failed
    try {
      const { fileId } = await req.json()
      if (fileId) {
        const supabaseClient = createClient<Database>(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        
        await supabaseClient
          .from('flipbook_files')
          .update({ conversion_status: 'failed' })
          .eq('id', fileId)
      }
    } catch (updateError) {
      console.error('Failed to update error status:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Image processing failed',
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})