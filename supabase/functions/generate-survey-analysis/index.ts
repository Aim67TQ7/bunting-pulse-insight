import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

    const { surveyData, testMode = false, model, customPrompt } = await req.json();
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

    // Calculate demographic correlations
    const demographicCorrelations = {
      byContinent: Array.from(
        validResponses.reduce((map, r) => {
          const continent = r.continent || 'Unknown';
          if (!map.has(continent)) {
            map.set(continent, { ratings: [], count: 0 });
          }
          const data = map.get(continent)!;
          r.responses.filter((resp: any) => resp.question_type === 'rating').forEach((resp: any) => {
            if (resp.answer_value?.rating) {
              data.ratings.push(resp.answer_value.rating);
              data.count++;
            }
          });
          return map;
        }, new Map<string, { ratings: number[], count: number }>())
      ).map(([continent, data]) => ({
        continent,
        average: data.ratings.reduce((s, r) => s + r, 0) / data.ratings.length,
        responseCount: Math.round(data.count / questionAverages.length)
      })),
      
      byDivision: Array.from(
        validResponses.reduce((map, r) => {
          const division = r.division || 'Unknown';
          if (!map.has(division)) {
            map.set(division, { ratings: [], count: 0 });
          }
          const data = map.get(division)!;
          r.responses.filter((resp: any) => resp.question_type === 'rating').forEach((resp: any) => {
            if (resp.answer_value?.rating) {
              data.ratings.push(resp.answer_value.rating);
              data.count++;
            }
          });
          return map;
        }, new Map<string, { ratings: number[], count: number }>())
      ).map(([division, data]) => ({
        division,
        average: data.ratings.reduce((s, r) => s + r, 0) / data.ratings.length,
        responseCount: Math.round(data.count / questionAverages.length)
      }))
    };

    const defaultPrompt = `You are an expert HR data analyst conducting a comprehensive employee survey analysis. Your role is to identify meaningful trends, patterns, and insights while remaining strictly objective and data-driven.

**Survey Data:**
- Total Responses: ${surveyData.length}
- Valid Responses: ${validResponses.length}

**Rating Questions (1-5 scale):**
${questionAverages.map(q => `- ${q.label}: ${q.average.toFixed(2)} average (${q.count} responses)`).join('\n')}

**Top 5 Strengths:**
${[...questionAverages].sort((a, b) => b.average - a.average).slice(0, 5).map(q => `- ${q.label}: ${q.average.toFixed(2)}`).join('\n')}

**Top 5 Areas for Improvement:**
${[...questionAverages].sort((a, b) => a.average - b.average).slice(0, 5).map(q => `- ${q.label}: ${q.average.toFixed(2)}`).join('\n')}

**Demographic Breakdown:**
By Continent:
${demographicCorrelations.byContinent.map(c => `  • ${c.continent}: ${c.average.toFixed(2)} average rating (${c.responseCount} avg responses per question)`).join('\n')}

By Division:
${demographicCorrelations.byDivision.map(d => `  • ${d.division}: ${d.average.toFixed(2)} average rating (${d.responseCount} avg responses per question)`).join('\n')}

**Employee Comments (Sample):**
${textResponses.slice(0, 15).map(c => `- Division: ${c.division || 'N/A'} - "${c.text.substring(0, 150)}"`).join('\n')}

**Analysis Requirements:**
1. **Executive Summary**: Provide a concise overview of key findings
2. **Trend Analysis**: Identify patterns across questions (e.g., are communication scores consistently low? Do safety and equipment ratings correlate?)
3. **Demographic Analysis**: 
   - Identify significant differences between continents (North America vs Europe)
   - Compare division performance (Equipment vs Magnetics vs Both)
   - Note if certain issues are continent-specific or division-specific
   - Look for correlation patterns (e.g., "Equipment division in North America shows...")
4. **SWOT Analysis**:
   - Strengths: What's working well? (scores 4.0+)
   - Weaknesses: What needs attention? (scores below 3.5)
   - Opportunities: What trends suggest potential for improvement?
   - Threats: What patterns indicate risk areas?
5. **Actionable Recommendations**: Provide 3-5 specific, prioritized actions based on the data
6. **Priority Focus Areas**: List the top 3 areas requiring immediate attention

**Critical Guidelines:**
- Base ALL statements on the actual data provided
- Use specific numbers and percentages from the data
- Identify correlations between related questions
- ALWAYS analyze demographic differences when they exist
- Highlight if one continent/division scores significantly different from another
- Look for patterns like "Europe rates communication higher" or "Equipment division has safety concerns"
- Consider cultural or operational differences that might explain geographic variations
- Note any divisions mentioned in comments if patterns emerge
- DO NOT make assumptions beyond what the data shows
- DO NOT suggest factors not evident in the survey
- Highlight both positive trends and concerning patterns
- Be detailed and thorough in your analysis`;

    // Use custom prompt if provided in test mode, otherwise use default
    const prompt = (testMode && customPrompt) ? customPrompt : defaultPrompt;
    
    // Use specified model in test mode, otherwise use default
    const modelToUse = (testMode && model) ? model : 'gpt-4o';

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: 'system', content: 'You are an expert HR data analyst specializing in employee engagement surveys. Your analyses are thorough, insightful, and strictly objective. You identify trends and patterns while ensuring every statement is supported by the actual data provided.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 3000,
        temperature: 0.85
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
