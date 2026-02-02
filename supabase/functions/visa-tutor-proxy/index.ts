import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://seedglobaleducation.com/api/assist/visa-tutor';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization token from the request
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'list';

    let apiUrl: string;
    let method = 'GET';
    let body: BodyInit | null = null;
    const headers: Record<string, string> = {
      'Authorization': authHeader,
    };

    switch (action) {
      case 'list': {
        // List all licenses with optional filters
        const params = new URLSearchParams();
        const search = url.searchParams.get('search');
        const activationStatus = url.searchParams.get('activation_status');
        const usageStatus = url.searchParams.get('usage_status');
        const visaStatus = url.searchParams.get('visa_status');
        const limit = url.searchParams.get('limit') || '100';
        const offset = url.searchParams.get('offset') || '0';

        if (search) params.append('search', search);
        if (activationStatus) params.append('activation_status', activationStatus);
        if (usageStatus) params.append('usage_status', usageStatus);
        if (visaStatus) params.append('visa_status', visaStatus);
        params.append('limit', limit);
        params.append('offset', offset);

        apiUrl = `${BASE_URL}/?${params.toString()}`;
        break;
      }

      case 'license_details': {
        const licenseNumber = url.searchParams.get('license_number');
        if (!licenseNumber) {
          return new Response(
            JSON.stringify({ success: false, error: 'license_number is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        apiUrl = `${BASE_URL}/license_details.php?license_number=${encodeURIComponent(licenseNumber)}`;
        break;
      }

      case 'session_details': {
        const licenseNumber = url.searchParams.get('license_number');
        const sessionId = url.searchParams.get('session_id');
        if (!licenseNumber) {
          return new Response(
            JSON.stringify({ success: false, error: 'license_number is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const params = new URLSearchParams({ license_number: licenseNumber });
        if (sessionId) params.append('session_id', sessionId);
        apiUrl = `${BASE_URL}/session_details.php?${params.toString()}`;
        break;
      }

      case 'reassign': {
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ success: false, error: 'POST method required for reassign' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        apiUrl = `${BASE_URL}/reassign.php`;
        method = 'POST';
        headers['Content-Type'] = 'application/json';
        body = await req.text();
        break;
      }

      case 'bulk_upload': {
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ success: false, error: 'POST method required for bulk_upload' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        apiUrl = `${BASE_URL}/bulk_upload.php`;
        method = 'POST';
        // Forward the multipart form data as-is
        const contentType = req.headers.get('content-type');
        if (contentType) {
          headers['Content-Type'] = contentType;
        }
        body = await req.arrayBuffer();
        break;
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Forward the request to the backend API
    const response = await fetch(apiUrl, {
      method,
      headers,
      body,
    });

    // Handle binary responses (e.g., file downloads)
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/vnd.openxmlformats') || 
        contentType.includes('application/octet-stream')) {
      const blob = await response.blob();
      return new Response(blob, {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
          'Content-Disposition': response.headers.get('Content-Disposition') || '',
        },
      });
    }

    // Safe JSON parsing
    const rawText = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch {
      const snippet = rawText.slice(0, 600);
      console.error('Visa Tutor Proxy Upstream Non-JSON Response', {
        apiUrl,
        status: response.status,
        contentType,
        snippet,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Upstream returned non-JSON response',
          upstream: {
            url: apiUrl,
            status: response.status,
            contentType,
            body_snippet: snippet,
          },
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Visa Tutor Proxy Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to process visa tutor request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
