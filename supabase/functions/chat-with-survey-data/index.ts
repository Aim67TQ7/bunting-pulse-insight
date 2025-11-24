import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  messages: Message[];
  filters?: {
    continent?: string;
    division?: string;
    role?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, filters }: RequestBody = await req.json();
    
    if (!messages || messages.length === 0) {
      throw new Error('No messages provided');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query survey responses with filters
    let query = supabase
      .from('employee_survey_responses')
      .select('id, responses_jsonb, continent, division, role, created_at, submitted_at')
      .eq('is_draft', false);

    if (filters?.continent) {
      query = query.eq('continent', filters.continent);
    }
    if (filters?.division) {
      query = query.eq('division', filters.division);
    }
    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    const { data: responses, error } = await query.order('submitted_at', { ascending: false }).limit(200);

    if (error) {
      console.error('Database query error:', error);
      throw new Error('Failed to fetch survey data');
    }

    if (!responses || responses.length === 0) {
      throw new Error('No survey responses found with the applied filters');
    }

    // Structure data for GPT-4o with citations
    const structuredData = responses.map((r, idx) => {
      const responseData = r.responses_jsonb as Record<string, any> || {};
      return {
        id: `[R-${String(idx + 1).padStart(3, '0')}]`,
        actualId: r.id,
        continent: r.continent || 'Unknown',
        division: r.division || 'Unknown',
        role: r.role || 'Unknown',
        responses: responseData
      };
    });

    // Calculate aggregated statistics
    const totalResponses = structuredData.length;
    const continentBreakdown = structuredData.reduce((acc, r) => {
      acc[r.continent] = (acc[r.continent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const divisionBreakdown = structuredData.reduce((acc, r) => {
      acc[r.division] = (acc[r.division] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Build system prompt with data context
    const systemPrompt = `You are an expert survey data analyst. You have access to employee survey data and must provide insights based ONLY on this data.

CRITICAL RULES:
1. ALWAYS cite specific response IDs when making claims (format: [R-001])
2. Provide statistics, percentages, and trends
3. Be objective and data-driven
4. If asked about something not in the data, say so clearly
5. Use multiple citations to support important claims

DATA OVERVIEW:
- Total Responses: ${totalResponses}
- Continents: ${Object.entries(continentBreakdown).map(([k, v]) => `${k} (${v})`).join(', ')}
- Divisions: ${Object.entries(divisionBreakdown).map(([k, v]) => `${k} (${v})`).join(', ')}

SAMPLE RESPONSES (with IDs for citation):
${structuredData.slice(0, 50).map(r => 
  `${r.id} [${r.continent}, ${r.division}, ${r.role}]: ${JSON.stringify(r.responses).substring(0, 300)}...`
).join('\n')}

When answering questions:
- Start with an overview/summary
- Provide specific examples with citations
- Include relevant statistics
- Suggest follow-up questions if appropriate`;

    // Prepare messages for OpenAI
    const openAIMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10) // Keep last 10 messages for context
    ];

    // Call OpenAI API with streaming
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: openAIMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    // Return the streaming response
    return new Response(openAIResponse.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in chat-with-survey-data:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
