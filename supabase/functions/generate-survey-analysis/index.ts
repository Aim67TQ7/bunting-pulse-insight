import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found');
    }

    const { surveyData } = await req.json();
    
    if (!surveyData || !Array.isArray(surveyData) || surveyData.length === 0) {
      throw new Error('No survey data provided');
    }

    console.log(`Analyzing ${surveyData.length} survey responses`);

    // Prepare data summary for AI analysis
    const dataSummary = {
      totalResponses: surveyData.length,
      continents: [...new Set(surveyData.map(r => r.continent))],
      divisions: [...new Set(surveyData.map(r => r.division))],
      roles: [...new Set(surveyData.map(r => r.role))],
      averageScores: {
        job_satisfaction: surveyData.reduce((sum, r) => sum + (r.job_satisfaction || 0), 0) / surveyData.length,
        work_life_balance: surveyData.reduce((sum, r) => sum + (r.work_life_balance || 0), 0) / surveyData.length,
        communication_clarity: surveyData.reduce((sum, r) => sum + (r.communication_clarity || 0), 0) / surveyData.length,
        leadership_openness: surveyData.reduce((sum, r) => sum + (r.leadership_openness || 0), 0) / surveyData.length,
        us_uk_collaboration: surveyData.reduce((sum, r) => sum + (r.us_uk_collaboration || 0), 0) / surveyData.length,
        training_satisfaction: surveyData.reduce((sum, r) => sum + (r.training_satisfaction || 0), 0) / surveyData.length,
        advancement_opportunities: surveyData.reduce((sum, r) => sum + (r.advancement_opportunities || 0), 0) / surveyData.length,
        recommend_company: surveyData.reduce((sum, r) => sum + (r.recommend_company || 0), 0) / surveyData.length,
      },
      comments: surveyData
        .filter(r => r.additional_comments || r.collaboration_feedback)
        .map(r => ({
          continent: r.continent,
          division: r.division,
          role: r.role,
          additional_comments: r.additional_comments,
          collaboration_feedback: r.collaboration_feedback
        }))
    };

    // Regional breakdown
    const regionalData = {
      northAmerica: surveyData.filter(r => r.continent === 'North America'),
      europe: surveyData.filter(r => r.continent === 'Europe')
    };

    // Division breakdown 
    const divisionData = {
      equipment: surveyData.filter(r => r.division === 'Equipment'),
      magnets: surveyData.filter(r => r.division === 'Magnets'),
      both: surveyData.filter(r => r.division === 'Both')
    };

    const prompt = `You are an expert HR analyst tasked with analyzing comprehensive employee survey results. Please provide a thorough, professional analysis with high creative insight and detailed observations.

SURVEY DATA SUMMARY:
- Total Responses: ${dataSummary.totalResponses}
- Continents: ${dataSummary.continents.join(', ')}
- Divisions: ${dataSummary.divisions.join(', ')} 
- Roles: ${dataSummary.roles.join(', ')}

AVERAGE SCORES (1-5 scale):
- Job Satisfaction: ${dataSummary.averageScores.job_satisfaction.toFixed(2)}
- Work-Life Balance: ${dataSummary.averageScores.work_life_balance.toFixed(2)}
- Communication Clarity: ${dataSummary.averageScores.communication_clarity.toFixed(2)}
- Leadership Openness: ${dataSummary.averageScores.leadership_openness.toFixed(2)}
- US-UK Collaboration: ${dataSummary.averageScores.us_uk_collaboration.toFixed(2)}
- Training Satisfaction: ${dataSummary.averageScores.training_satisfaction.toFixed(2)}
- Advancement Opportunities: ${dataSummary.averageScores.advancement_opportunities.toFixed(2)}
- Recommend Company: ${dataSummary.averageScores.recommend_company.toFixed(2)}

REGIONAL COMPARISON:
- North America: ${regionalData.northAmerica.length} responses
- Europe: ${regionalData.europe.length} responses

DIVISION COMPARISON:
- Equipment: ${divisionData.equipment.length} responses  
- Magnets: ${divisionData.magnets.length} responses
- Both: ${divisionData.both.length} responses

EMPLOYEE COMMENTS: ${JSON.stringify(dataSummary.comments)}

Please provide a comprehensive analysis including:

1. **EXECUTIVE SUMMARY** (2-3 paragraphs overview of key findings)

2. **REGIONAL ANALYSIS** 
   - Compare North America vs Europe performance across all metrics
   - Identify regional strengths and challenges
   - Cultural or operational insights

3. **DIVISION ANALYSIS**
   - Compare Equipment vs Magnets vs Both divisions
   - Identify division-specific trends and issues
   - Operational effectiveness insights

4. **ROLE-BASED INSIGHTS**
   - Analyze patterns across different job functions
   - Leadership vs operational perspectives
   - Cross-functional collaboration effectiveness

5. **SCORE PATTERN ANALYSIS**
   - Identify highest and lowest scoring areas
   - Correlations between different metrics
   - Outliers and notable trends

6. **SENTIMENT ANALYSIS OF COMMENTS**
   - Common themes in written feedback
   - Positive vs concerning sentiment patterns
   - Specific actionable insights from comments

7. **STRATEGIC RECOMMENDATIONS**
   - Top 3 priority areas for improvement
   - Specific, actionable recommendations
   - Regional/division-specific strategies

Format as structured JSON with clear sections. Be thorough, insightful, and provide concrete recommendations based on the data patterns you observe.`;

    console.log('Calling OpenAI API for survey analysis...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR analyst specializing in employee survey analysis. Provide thorough, data-driven insights with creative interpretation and actionable recommendations.'
          },
          {
            role: 'user', 
            content: prompt
          }
        ],
        max_completion_tokens: 4000,
        temperature: 0.8, // High temperature for creative insights as requested
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('Analysis generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
        metadata: {
          totalResponses: dataSummary.totalResponses,
          generatedAt: new Date().toISOString(),
          model: 'gpt-5-2025-08-07'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-survey-analysis:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});