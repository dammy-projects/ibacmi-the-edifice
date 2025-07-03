
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

    // For this demo, we'll simulate PDF processing
    // In a real implementation, you would use a PDF library like pdf2pic or similar
    const simulatedPageCount = Math.floor(Math.random() * 20) + 5 // 5-24 pages

    // Update total pages
    await supabaseClient
      .from('flipbook_files')
      .update({ total_pages: simulatedPageCount })
      .eq('id', fileId)

    // Simulate page conversion process
    for (let pageNum = 1; pageNum <= simulatedPageCount; pageNum++) {
      // In real implementation, convert PDF page to image here
      // For demo, we'll create placeholder page entries
      
      const placeholderImageUrl = `https://via.placeholder.com/800x1200/f0f0f0/333333?text=Page+${pageNum}`

      // Create page record
      const { error: pageError } = await supabaseClient
        .from('pages')
        .insert({
          flipbook_id: fileData.flipbook_id,
          page_number: pageNum,
          image_url: placeholderImageUrl,
          text_content: `Page ${pageNum} content from PDF: ${fileData.file_name}`
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

      // Small delay to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Mark as completed
    await supabaseClient
      .from('flipbook_files')
      .update({ 
        conversion_status: 'completed',
        converted_pages: simulatedPageCount
      })
      .eq('id', fileId)

    console.log(`PDF processing completed for file ${fileId}`)

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
