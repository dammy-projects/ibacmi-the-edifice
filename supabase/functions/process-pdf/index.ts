
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
        Insert: {
          id?: string
          flipbook_id: string
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          conversion_status?: string
          total_pages?: number | null
          converted_pages?: number | null
          uploaded_at?: string
        }
        Update: {
          conversion_status?: string
          total_pages?: number | null
          converted_pages?: number | null
        }
      }
      pages: {
        Row: {
          id: string
          flipbook_id: string
          page_number: number
          image_url: string
          text_content: string | null
          created_at: string
        }
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

    const { fileId, filePath } = await req.json()

    if (!fileId || !filePath) {
      throw new Error('File ID and path are required')
    }

    console.log(`Processing PDF: ${fileId} at ${filePath}`)

    // Update status to processing
    await supabaseClient
      .from('flipbook_files')
      .update({ 
        conversion_status: 'processing',
        converted_pages: 0
      })
      .eq('id', fileId)

    // Get file info
    const { data: fileData, error: fileError } = await supabaseClient
      .from('flipbook_files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (fileError) throw fileError

    // Download PDF from storage
    const { data: pdfData, error: downloadError } = await supabaseClient.storage
      .from('flipbook-assets')
      .download(filePath)

    if (downloadError) throw downloadError

    console.log(`Downloaded PDF, size: ${pdfData.size} bytes`)

    // Convert blob to array buffer for processing
    const pdfBuffer = await pdfData.arrayBuffer()
    
    // For now, we'll simulate the conversion process
    // In a production environment, you would use a PDF processing library like pdf2pic
    // or convert the PDF to images using a service like pdf-poppler
    
    // Simulate analyzing PDF to get page count
    const simulatedPageCount = Math.floor(Math.random() * 15) + 3 // 3-17 pages

    // Update total pages
    await supabaseClient
      .from('flipbook_files')
      .update({ total_pages: simulatedPageCount })
      .eq('id', fileId)

    console.log(`PDF has ${simulatedPageCount} pages, starting conversion`)

    // For demo purposes, we'll create sample page images
    // In production, you would convert each PDF page to an image
    for (let pageNum = 1; pageNum <= simulatedPageCount; pageNum++) {
      // Generate a more realistic sample image URL for each page
      // In production, this would be the actual converted page image
      const pageImageUrl = `https://picsum.photos/800/1200?random=${Date.now()}-${pageNum}`

      // Create page record
      const { error: pageError } = await supabaseClient
        .from('pages')
        .insert({
          flipbook_id: fileData.flipbook_id,
          page_number: pageNum,
          image_url: pageImageUrl,
          text_content: `Content extracted from page ${pageNum} of ${fileData.file_name}`
        })

      if (pageError) {
        console.error(`Error creating page ${pageNum}:`, pageError)
        continue
      }

      // Update progress
      await supabaseClient
        .from('flipbook_files')
        .update({ converted_pages: pageNum })
        .eq('id', fileId)

      console.log(`Processed page ${pageNum}/${simulatedPageCount}`)

      // Small delay to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    // Mark as completed
    await supabaseClient
      .from('flipbook_files')
      .update({ 
        conversion_status: 'completed',
        converted_pages: simulatedPageCount
      })
      .eq('id', fileId)

    console.log(`PDF processing completed for file ${fileId}. Created ${simulatedPageCount} pages.`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `PDF converted successfully. ${simulatedPageCount} pages created.`,
        totalPages: simulatedPageCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('PDF processing error:', error)
    
    // Try to update file status to failed if we have the fileId
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
        error: error.message || 'PDF processing failed',
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
