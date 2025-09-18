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

    // Enhanced data processing with null handling and comprehensive metrics
    const validResponses = surveyData.filter(r => r.continent && r.division && r.role);
    const responseRate = (validResponses.length / surveyData.length) * 100;
    
    const calculateAverage = (field: string) => {
      const validValues = surveyData.filter(r => r[field] !== null && r[field] !== undefined).map(r => r[field]);
      return validValues.length > 0 ? validValues.reduce((sum, val) => sum + val, 0) / validValues.length : null;
    };

    const getResponseCount = (field: string) => {
      return surveyData.filter(r => r[field] !== null && r[field] !== undefined).length;
    };

    const dataSummary = {
      totalResponses: surveyData.length,
      validResponses: validResponses.length,
      responseRate: responseRate,
      continents: [...new Set(surveyData.map(r => r.continent).filter(Boolean))],
      divisions: [...new Set(surveyData.map(r => r.division).filter(Boolean))],
      roles: [...new Set(surveyData.map(r => r.role).filter(Boolean))],
      averageScores: {
        job_satisfaction: calculateAverage('job_satisfaction'),
        work_life_balance: calculateAverage('work_life_balance'),
        communication_clarity: calculateAverage('communication_clarity'),
        leadership_openness: calculateAverage('leadership_openness'),
        us_uk_collaboration: calculateAverage('us_uk_collaboration'),
        training_satisfaction: calculateAverage('training_satisfaction'),
        advancement_opportunities: calculateAverage('advancement_opportunities'),
        recommend_company: calculateAverage('recommend_company'),
      },
      responseCounts: {
        job_satisfaction: getResponseCount('job_satisfaction'),
        work_life_balance: getResponseCount('work_life_balance'),
        communication_clarity: getResponseCount('communication_clarity'),
        leadership_openness: getResponseCount('leadership_openness'),
        us_uk_collaboration: getResponseCount('us_uk_collaboration'),
        training_satisfaction: getResponseCount('training_satisfaction'),
        advancement_opportunities: getResponseCount('advancement_opportunities'),
        recommend_company: getResponseCount('recommend_company'),
      },
      comments: surveyData
        .filter(r => (r.additional_comments && r.additional_comments.trim() !== '') || 
                    (r.collaboration_feedback && r.collaboration_feedback.trim() !== ''))
        .map(r => ({
          continent: r.continent,
          division: r.division,
          role: r.role,
          additional_comments: r.additional_comments,
          collaboration_feedback: r.collaboration_feedback
        })),
      communicationPreferences: surveyData
        .filter(r => r.communication_preferences && r.communication_preferences.length > 0)
        .flatMap(r => r.communication_preferences),
      informationPreferences: surveyData
        .filter(r => r.information_preferences && r.information_preferences.length > 0)
        .flatMap(r => r.information_preferences),
      motivationFactors: surveyData
        .filter(r => r.motivation_factors && r.motivation_factors.length > 0)
        .flatMap(r => r.motivation_factors)
    };

    // Enhanced prompt for comprehensive analysis with statistical awareness
    const prompt = `You are an expert HR analyst tasked with analyzing employee survey results. Provide a thorough, professional analysis with high creative insight and detailed observations. Be transparent about data limitations while still providing valuable insights.

SURVEY DATA SUMMARY:
- Total Responses: ${dataSummary.totalResponses}
- Valid Complete Responses: ${dataSummary.validResponses} (${dataSummary.responseRate.toFixed(1)}% response quality)
- Continents Represented: ${dataSummary.continents.join(', ')}
- Divisions Represented: ${dataSummary.divisions.join(', ')} 
- Role Types: ${dataSummary.roles.join(', ')}

AVERAGE SCORES (1-5 scale) with Response Counts:
${Object.entries(dataSummary.averageScores).map(([key, value]) => 
  `- ${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value ? value.toFixed(2) : 'No responses'} (${dataSummary.responseCounts[key]} responses)`
).join('\n')}

DEMOGRAPHIC BREAKDOWN:
- Communication Preferences: ${JSON.stringify(dataSummary.communicationPreferences)}
- Information Preferences: ${JSON.stringify(dataSummary.informationPreferences)}  
- Motivation Factors: ${JSON.stringify(dataSummary.motivationFactors)}

EMPLOYEE COMMENTS (${dataSummary.comments.length} total):
${JSON.stringify(dataSummary.comments)}

ANALYSIS REQUIREMENTS:
Please provide a comprehensive analysis in the following structured format. Address data limitations transparently while extracting maximum insights:

**EXECUTIVE SUMMARY** (2-3 paragraphs)
- Key findings and overall employee sentiment
- Statistical significance notes given sample size
- Primary areas of strength and concern

**DETAILED INSIGHTS**

*Regional Analysis*
- Compare performance across represented continents
- Identify geographic patterns and cultural considerations
- Note any regional strengths or challenges

*Division Analysis*  
- Compare performance across business divisions
- Identify division-specific trends and operational insights
- Highlight cross-division collaboration effectiveness

*Role-Based Analysis*
- Analyze patterns across different job functions
- Compare leadership vs operational perspectives
- Assess cross-functional collaboration

*Score Pattern Analysis*
- Identify highest and lowest scoring metrics
- Analyze correlations between different areas
- Highlight notable patterns or outliers
- Address statistical confidence given sample size

*Comment Sentiment Analysis*
- Extract key themes from written feedback
- Identify positive vs concerning sentiment patterns
- Provide specific quotes that illustrate trends
- Analyze feedback by demographic segments

**STRATEGIC RECOMMENDATIONS**

*Immediate Priority Actions* (Top 3)
1. [Specific, actionable recommendation with rationale]
2. [Specific, actionable recommendation with rationale]  
3. [Specific, actionable recommendation with rationale]

*Long-term Strategic Initiatives*
- Targeted improvements for each geographic region
- Division-specific enhancement strategies
- Role-based development programs
- Communication and collaboration improvements

*Data Collection Recommendations*
- Suggest additional metrics to track
- Recommend survey frequency and timing
- Identify areas needing deeper investigation

**CONFIDENCE AND LIMITATIONS**
- Assess statistical confidence of findings given sample size
- Note areas where additional data would strengthen insights
- Provide guidance on interpreting results responsibly

Format your response as clear, well-structured text with headers and bullet points. Focus on actionable insights while being honest about what the current data can and cannot tell us.`;

    console.log('Calling OpenAI API for survey analysis...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR analyst specializing in employee survey analysis. Provide thorough, data-driven insights with creative interpretation and actionable recommendations. Be transparent about statistical limitations while maximizing insights from available data.'
          },
          {
            role: 'user', 
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.8, // High temperature for creative and insightful analysis
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Enhanced validation for analysis quality
    if (!analysis || analysis.trim().length < 100) {
      console.error('Analysis too short or empty:', analysis);
      throw new Error('Generated analysis is too short or empty. Please try again.');
    }

    // Check for common error patterns
    if (analysis.toLowerCase().includes('i cannot') || 
        analysis.toLowerCase().includes('i\'m unable') ||
        analysis.toLowerCase().includes('error')) {
      console.error('Analysis contains error indicators:', analysis);
      throw new Error('Analysis generation encountered issues. Please try again.');
    }

    console.log('Analysis generated successfully, length:', analysis.length);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
        metadata: {
          totalResponses: dataSummary.totalResponses,
          validResponses: dataSummary.validResponses,
          responseRate: dataSummary.responseRate,
          commentsCount: dataSummary.comments.length,
          generatedAt: new Date().toISOString(),
          model: 'gpt-4o',
          analysisLength: analysis.length
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