import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

    const { surveyData } = await req.json();
    if (!surveyData?.length) throw new Error('No survey data');

    const validResponses = surveyData.filter((r: any) => r.responses?.length > 0);
    const ratingQuestions = new Map<string, { label: string; ratings: number[] }>();
    
    validResponses.forEach((r: any) => {
      r.responses.filter((resp: any) => resp.question_type === 'rating').forEach((resp: any) => {
        if (!ratingQuestions.has(resp.question_id)) {
          ratingQuestions.set(resp.question_id, { label: resp.question_labels?.en || resp.question_id, ratings: [] });
        }
        if (resp.answer_value?.rating) ratingQuestions.get(resp.question_id)!.ratings.push(resp.answer_value.rating);
      });
    });
    
    const questionAverages = Array.from(ratingQuestions.entries()).map(([id, data]) => ({
      question_id: id,
      label: data.label,
      average: data.ratings.reduce((s, r) => s + r, 0) / data.ratings.length,
      count: data.ratings.length
    }));
    
    const textResponses = validResponses.flatMap((r: any) => 
      r.responses.filter((resp: any) => resp.question_type === 'text' && resp.answer_value?.text)
        .map((resp: any) => ({ text: resp.answer_value.text, division: r.division }))
    );

    const prompt = `Analyze this employee survey data:

Total: ${surveyData.length} responses
Questions (1-5 scale):
${questionAverages.map(q => `- ${q.label}: ${q.average.toFixed(2)}`).join('\n')}

Top 5 Strengths:
${[...questionAverages].sort((a, b) => b.average - a.average).slice(0, 5).map(q => `- ${q.label}: ${q.average.toFixed(2)}`).join('\n')}

Top 5 Concerns:
${[...questionAverages].sort((a, b) => a.average - b.average).slice(0, 5).map(q => `- ${q.label}: ${q.average.toFixed(2)}`).join('\n')}

Sample Comments:
${textResponses.slice(0, 15).map(c => `- ${c.text.substring(0, 100)}`).join('\n')}

Provide: Executive Summary, SWOT Analysis (Strengths/Weaknesses/Opportunities/Threats), Key Recommendations, Priority Actions`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert HR analyst. Provide clear, actionable insights.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!openAIResponse.ok) throw new Error('OpenAI API error');
    const data = await openAIResponse.json();
    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ success: true, analysis }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
