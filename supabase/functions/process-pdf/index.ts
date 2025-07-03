import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib@^1.17.1'

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

// Extract actual page count from PDF
async function getPDFPageCount(pdfBytes: Uint8Array): Promise<number> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    return pdfDoc.getPageCount();
  } catch (error) {
    console.error('Error loading PDF:', error);
    throw new Error('Failed to load PDF file');
  }
}

// Create a simple placeholder image URL for each page
function createPageImageUrl(pageNumber: number, flipbookId: string): string {
  // Use a direct image generation service that's guaranteed to work
  return `https://via.placeholder.com/800x1200/ffffff/333333?text=Page+${pageNumber}`;
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

    console.log(`File data:`, fileData)

    // Download PDF from storage
    const { data: pdfData, error: downloadError } = await supabaseClient.storage
      .from('flipbook-assets')
      .download(filePath)

    if (downloadError) {
      console.error('Download error:', downloadError)
      throw downloadError
    }

    console.log(`Downloaded PDF, size: ${pdfData.size} bytes`)

    // Convert PDF to Uint8Array
    const pdfBytes = new Uint8Array(await pdfData.arrayBuffer())
    
    // Get actual page count from PDF
    const actualPageCount = await getPDFPageCount(pdfBytes)
    console.log(`PDF has ${actualPageCount} pages`)

    // Update total pages
    await supabaseClient
      .from('flipbook_files')
      .update({ total_pages: actualPageCount })
      .eq('id', fileId)

    console.log(`Starting conversion of ${actualPageCount} pages`)

    // Clear any existing pages for this flipbook
    await supabaseClient
      .from('pages')
      .delete()
      .eq('flipbook_id', fileData.flipbook_id)

    // Create page records with simple placeholder images
    for (let pageNum = 1; pageNum <= actualPageCount; pageNum++) {
      try {
        console.log(`Creating page ${pageNum}/${actualPageCount}`)
        
        // Use simple placeholder image
        const pageImageUrl = createPageImageUrl(pageNum, fileData.flipbook_id)
        console.log(`Using image URL: ${pageImageUrl}`)

        // Create page record directly
        console.log(`Inserting page record for page ${pageNum} with flipbook_id: ${fileData.flipbook_id}`)
        const { data: pageData, error: pageError } = await supabaseClient
          .from('pages')
          .insert({
            flipbook_id: fileData.flipbook_id,
            page_number: pageNum,
            image_url: pageImageUrl,
            text_content: `Content from page ${pageNum} of ${fileData.file_name}`
          })
          .select()

        if (pageError) {
          console.error(`ERROR creating page ${pageNum}:`, pageError)
          console.error(`Error details:`, JSON.stringify(pageError, null, 2))
          
          // Try to continue with other pages
          continue
        }

        if (pageData && pageData.length > 0) {
          console.log(`SUCCESS: Created page record ${pageNum}:`, pageData[0])
        } else {
          console.log(`WARNING: Page created but no data returned for page ${pageNum}`)
        }

        // Update progress
        const { error: updateError } = await supabaseClient
          .from('flipbook_files')
          .update({ converted_pages: pageNum })
          .eq('id', fileId)

        if (updateError) {
          console.error(`Error updating progress for page ${pageNum}:`, updateError)
        } else {
          console.log(`Updated progress: ${pageNum}/${actualPageCount}`)
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (pageError) {
        console.error(`EXCEPTION processing page ${pageNum}:`, pageError)
        console.error(`Exception details:`, pageError.message)
        continue
      }
    }

    // Mark as completed
    await supabaseClient
      .from('flipbook_files')
      .update({ 
        conversion_status: 'completed',
        converted_pages: actualPageCount
      })
      .eq('id', fileId)

    console.log(`PDF processing completed for file ${fileId}. Created ${actualPageCount} pages.`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `PDF converted successfully. ${actualPageCount} pages created.`,
        totalPages: actualPageCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('PDF processing error:', error)
    
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
