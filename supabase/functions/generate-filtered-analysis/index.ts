import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface QuestionStats {
  n: number;
  mean: number;
  median: number;
  dist: { [score: number]: number };
}

interface Comment {
  rating?: number | null;
  text: string;
}

interface AIAnalysis {
  executive_summary: string;
  key_strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
  detailed_analysis: string;
}

const QUESTION_LABELS: { [key: string]: string } = {
  role_satisfaction: "Role Satisfaction",
  recommend_company: "Would Recommend Company",
  strategic_confidence: "Strategic Confidence",
  manager_alignment: "Manager Alignment",
  performance_awareness: "Performance Awareness",
  leadership_openness: "Leadership Openness",
  information_relay: "Information Relay",
  training_satisfaction: "Training Satisfaction",
  advancement_opportunities: "Advancement Opportunities",
  workplace_safety: "Workplace Safety",
  team_support: "Team Support",
  team_morale: "Team Morale",
  pride_in_work: "Pride in Work",
  company_pride: "Company Pride",
  workload_manageability: "Workload Manageability",
  work_life_balance: "Work-Life Balance",
  tools_equipment_quality: "Tools & Equipment Quality",
  manual_processes_focus: "Manual Processes Focus",
  communication_clarity: "Communication Clarity",
  company_value_alignment: "Company Value Alignment",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured');
    }

    const { surveyData, region, division } = await req.json();
    
    if (!surveyData?.length) {
      throw new Error('No survey data provided');
    }

    console.log(`Processing ${surveyData.length} responses for region: ${region || 'All'}, division: ${division || 'All'}`);

    // Filter data by region and division
    let filteredData = surveyData;
    
    if (region && region !== 'All') {
      filteredData = filteredData.filter((r: any) => 
        r.continent?.toLowerCase().includes(region.toLowerCase())
      );
    }
    
    if (division && division !== 'All') {
      filteredData = filteredData.filter((r: any) => 
        r.division?.toLowerCase() === division.toLowerCase()
      );
    }

    if (filteredData.length === 0) {
      throw new Error('No responses match the selected filters');
    }

    console.log(`Filtered to ${filteredData.length} responses`);

    // Calculate statistics for each question
    const overallStats: { [key: string]: QuestionStats } = {};
    const commentsByQuestion: { [key: string]: Comment[] } = {};

    // Initialize comments structure
    for (const q of Object.keys(QUESTION_LABELS)) {
      commentsByQuestion[q] = [];
    }
    commentsByQuestion["additional_comments"] = [];

    // Process responses
    for (const response of filteredData) {
      const parsed = response.responses_jsonb || [];
      
      for (const item of parsed) {
        const qid = item.question_id;
        const answer = item.answer_value || {};
        const qtype = item.question_type;

        if (qtype === 'rating' && answer.rating !== undefined) {
          if (!overallStats[qid]) {
            overallStats[qid] = { n: 0, mean: 0, median: 0, dist: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
          }
          overallStats[qid].dist[answer.rating]++;
          overallStats[qid].n++;
          
          if (answer.feedback && answer.feedback.trim()) {
            if (commentsByQuestion[qid]) {
              commentsByQuestion[qid].push({
                rating: answer.rating,
                text: answer.feedback.trim()
              });
            }
          }
        } else if (qtype === 'text' && answer.text && answer.text.trim()) {
          if (commentsByQuestion[qid]) {
            commentsByQuestion[qid].push({
              rating: null,
              text: answer.text.trim()
            });
          }
        }
      }

      // Additional comments
      if (response.additional_comments && response.additional_comments.trim()) {
        commentsByQuestion["additional_comments"].push({
          rating: null,
          text: response.additional_comments.trim()
        });
      }
    }

    // Calculate means and medians
    for (const [qid, stats] of Object.entries(overallStats)) {
      if (stats.n > 0) {
        const ratings: number[] = [];
        for (let score = 1; score <= 5; score++) {
          for (let i = 0; i < stats.dist[score]; i++) {
            ratings.push(score);
          }
        }
        
        const sum = ratings.reduce((a, b) => a + b, 0);
        stats.mean = Math.round((sum / stats.n) * 100) / 100;
        
        const sorted = [...ratings].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        stats.median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      }
    }

    // Prepare stats summary for Claude
    const statsSummary = Object.entries(overallStats)
      .filter(([, s]) => s.n > 0)
      .sort(([, a], [, b]) => b.mean - a.mean)
      .map(([q, s]) => `${QUESTION_LABELS[q] || q}: ${s.mean.toFixed(2)} (n=${s.n})`)
      .join("\n");

    // Get sample comments for Claude
    const topComments = Object.entries(commentsByQuestion)
      .filter(([, comments]) => comments.length > 0)
      .slice(0, 8)
      .map(([q, comments]) => {
        const label = QUESTION_LABELS[q] || q;
        const sampleComments = comments.slice(0, 3).map(c => 
          c.rating ? `[${c.rating}/5] ${c.text}` : c.text
        ).join(" | ");
        return `${label}: ${sampleComments}`;
      })
      .join("\n\n");

    // Build the filter context
    const filterContext = [
      region && region !== 'All' ? region : null,
      division && division !== 'All' ? `${division} Division` : null
    ].filter(Boolean).join(' - ') || 'All Regions & Divisions';

    const prompt = `You are a senior organizational development consultant analyzing employee survey data for ${filterContext} at Bunting.

SURVEY STATISTICS (${filteredData.length} responses):
${statsSummary}

SAMPLE EMPLOYEE COMMENTS:
${topComments}

Provide a strategic analysis in JSON format with these exact keys:
{
  "executive_summary": "2-3 paragraph executive overview of the survey findings. Be specific about scores and patterns. Maintain a positive, forward-looking tone while addressing areas for improvement.",
  "key_strengths": ["strength 1 with specific score references", "strength 2", "strength 3"],
  "areas_for_improvement": ["area 1 with specific recommendations", "area 2", "area 3"],
  "recommendations": ["actionable recommendation 1", "recommendation 2", "recommendation 3", "recommendation 4"],
  "detailed_analysis": "3-4 paragraphs providing deeper context on patterns, workforce dynamics, and strategic implications. Reference specific scores and comments where relevant."
}

Focus on actionable, practical insights. Be direct and strategic. Reference specific scores where relevant. Maintain a constructive, forward-looking tone that emphasizes opportunities for growth.`;

    console.log('Calling Claude API...');

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    const content = claudeData.content[0];
    
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON');
    }

    const analysis: AIAnalysis = JSON.parse(jsonMatch[0]);

    console.log('Analysis generated successfully');

    return new Response(JSON.stringify({
      success: true,
      analysis,
      metadata: {
        totalResponses: filteredData.length,
        region: region || 'All',
        division: division || 'All',
        generatedAt: new Date().toISOString(),
        model: 'claude-sonnet-4-20250514',
        questionStats: overallStats
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in generate-filtered-analysis:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
