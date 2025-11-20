import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('Lovable AI key not configured');

    const { surveyData, testMode = false, model, customPrompt } = await req.json();
    if (!surveyData?.length) throw new Error('No survey data');

    const validResponses = surveyData.filter((r: any) => r.responses_jsonb?.length > 0);
    
    // Process all responses with full context
    const ratingQuestions = new Map<string, { 
      label: string; 
      ratings: number[]; 
      feedbackByRating: Map<number, string[]>;
      demographicBreakdown: Array<{ rating: number; continent: string; division: string; feedback?: string }>;
    }>();
    
    validResponses.forEach((r: any) => {
      r.responses_jsonb.filter((resp: any) => resp.question_type === 'rating').forEach((resp: any) => {
        const questionId = resp.question_id;
        if (!ratingQuestions.has(questionId)) {
          ratingQuestions.set(questionId, { 
            label: resp.question_labels?.en || questionId, 
            ratings: [],
            feedbackByRating: new Map(),
            demographicBreakdown: []
          });
        }
        
        const qData = ratingQuestions.get(questionId)!;
        const rating = resp.answer_value?.rating;
        const feedback = resp.answer_value?.feedback;
        
        if (rating) {
          qData.ratings.push(rating);
          qData.demographicBreakdown.push({
            rating,
            continent: r.continent || 'Unknown',
            division: r.division || 'Unknown',
            feedback: feedback || undefined
          });
          
          if (feedback) {
            if (!qData.feedbackByRating.has(rating)) {
              qData.feedbackByRating.set(rating, []);
            }
            qData.feedbackByRating.get(rating)!.push(feedback);
          }
        }
      });
    });
    
    const questionAverages = Array.from(ratingQuestions.entries()).map(([id, data]) => ({
      question_id: id,
      label: data.label,
      average: data.ratings.reduce((s, r) => s + r, 0) / data.ratings.length,
      count: data.ratings.length,
      distribution: {
        '5': data.ratings.filter(r => r === 5).length,
        '4': data.ratings.filter(r => r === 4).length,
        '3': data.ratings.filter(r => r === 3).length,
        '2': data.ratings.filter(r => r === 2).length,
        '1': data.ratings.filter(r => r === 1).length,
      },
      feedbackByRating: Array.from(data.feedbackByRating.entries()).map(([rating, comments]) => ({
        rating,
        comments: comments.slice(0, 5) // Top 5 comments per rating
      })),
      demographicBreakdown: data.demographicBreakdown
    }));
    
    // Extract text/open-ended responses with full context
    const textResponses = validResponses.flatMap((r: any) => 
      r.responses_jsonb.filter((resp: any) => resp.question_type === 'text' && resp.answer_value?.text)
        .map((resp: any) => ({ 
          question: resp.question_labels?.en || resp.question_id,
          text: resp.answer_value.text,
          continent: r.continent || 'Unknown',
          division: r.division || 'Unknown'
        }))
    );
    
    // Extract multiselect responses
    const multiselectResponses = validResponses.flatMap((r: any) =>
      r.responses_jsonb.filter((resp: any) => resp.question_type === 'multiselect' && resp.answer_value?.selected)
        .map((resp: any) => ({
          question: resp.question_labels?.en || resp.question_id,
          selected: resp.answer_value.selected,
          continent: r.continent || 'Unknown',
          division: r.division || 'Unknown'
        }))
    );

    // Calculate demographic correlations with more detail
    const demographicCorrelations = {
      byContinent: Array.from(
        validResponses.reduce((map, r) => {
          const continent = r.continent || 'Unknown';
          if (!map.has(continent)) {
            map.set(continent, { 
              ratings: [], 
              count: 0,
              questionBreakdown: new Map<string, number[]>()
            });
          }
          const data = map.get(continent)!;
          r.responses_jsonb.filter((resp: any) => resp.question_type === 'rating').forEach((resp: any) => {
            if (resp.answer_value?.rating) {
              data.ratings.push(resp.answer_value.rating);
              data.count++;
              
              const qLabel = resp.question_labels?.en || resp.question_id;
              if (!data.questionBreakdown.has(qLabel)) {
                data.questionBreakdown.set(qLabel, []);
              }
              data.questionBreakdown.get(qLabel)!.push(resp.answer_value.rating);
            }
          });
          return map;
        }, new Map())
      ).map(([continent, data]: [string, any]) => ({
        continent,
        average: data.ratings.reduce((s: number, r: number) => s + r, 0) / data.ratings.length,
        responseCount: Math.round(data.count / questionAverages.length),
        topIssues: Array.from(data.questionBreakdown.entries())
          .map(([q, ratings]: [string, number[]]) => ({
            question: q,
            avg: ratings.reduce((s, r) => s + r, 0) / ratings.length
          }))
          .sort((a, b) => a.avg - b.avg)
          .slice(0, 3)
      })),
      
      byDivision: Array.from(
        validResponses.reduce((map, r) => {
          const division = r.division || 'Unknown';
          if (!map.has(division)) {
            map.set(division, { 
              ratings: [], 
              count: 0,
              questionBreakdown: new Map<string, number[]>()
            });
          }
          const data = map.get(division)!;
          r.responses_jsonb.filter((resp: any) => resp.question_type === 'rating').forEach((resp: any) => {
            if (resp.answer_value?.rating) {
              data.ratings.push(resp.answer_value.rating);
              data.count++;
              
              const qLabel = resp.question_labels?.en || resp.question_id;
              if (!data.questionBreakdown.has(qLabel)) {
                data.questionBreakdown.set(qLabel, []);
              }
              data.questionBreakdown.get(qLabel)!.push(resp.answer_value.rating);
            }
          });
          return map;
        }, new Map())
      ).map(([division, data]: [string, any]) => ({
        division,
        average: data.ratings.reduce((s: number, r: number) => s + r, 0) / data.ratings.length,
        responseCount: Math.round(data.count / questionAverages.length),
        topIssues: Array.from(data.questionBreakdown.entries())
          .map(([q, ratings]: [string, number[]]) => ({
            question: q,
            avg: ratings.reduce((s, r) => s + r, 0) / ratings.length
          }))
          .sort((a, b) => a.avg - b.avg)
          .slice(0, 3)
      }))
    };

    const defaultPrompt = `You are an advanced analytics engine responsible for generating executive-grade insights from the employee_survey_responses dataset.
Your task is to perform a full organizational health analysis using all available fields.

# CORE REQUIREMENTS

## Load & Parse Survey Data

Source table: employee_survey_responses

Each row includes a responses_jsonb field containing:
- rating questions (0–5 scale)
- text responses
- demographic fields, including: continent, division

Extract all ratings, text comments, and demographic metadata.
Gracefully ignore null or missing values.
Build a clean analysis-ready dataframe.

## Compute Key Metrics

eNPS using the recommend_company rating:
- Promoters: 9–10
- Passives: 7–8
- Detractors: 0–6
- Formula: (Promoters - Detractors) / Total Respondents * 100

Category averages across all rating questions.
Text sentiment highlights (positive, negative, recurring themes).
Identify top strengths and top weaknesses (ranked).

# SURVEY DATA PROVIDED

**Response Statistics:**
- Total Responses: ${surveyData.length}
- Valid Responses: ${validResponses.length}
- Response Rate: ${((validResponses.length / surveyData.length) * 100).toFixed(1)}%

## Rating Questions (1-5 scale, where 1=Strongly Disagree, 5=Strongly Agree)

${questionAverages.map(q => `
### ${q.label}
- **Average Score: ${q.average.toFixed(2)}/5.0** (${q.count} responses)
- **Distribution:** 
  * 5 Stars: ${q.distribution['5']} (${((q.distribution['5']/q.count)*100).toFixed(0)}%)
  * 4 Stars: ${q.distribution['4']} (${((q.distribution['4']/q.count)*100).toFixed(0)}%)
  * 3 Stars: ${q.distribution['3']} (${((q.distribution['3']/q.count)*100).toFixed(0)}%)
  * 2 Stars: ${q.distribution['2']} (${((q.distribution['2']/q.count)*100).toFixed(0)}%)
  * 1 Star: ${q.distribution['1']} (${((q.distribution['1']/q.count)*100).toFixed(0)}%)

${q.feedbackByRating.length > 0 ? `**Employee Comments by Rating:**\n${q.feedbackByRating.map(fb => `  Rating ${fb.rating}/5:\n${fb.comments.map(c => `    - "${c}"`).join('\n')}`).join('\n')}` : ''}
`).join('\n')}

## Demographic Analysis

### By Continent:
${demographicCorrelations.byContinent.map(c => `
**${c.continent}** (${c.responseCount} avg responses/question)
- Overall Average: ${c.average.toFixed(2)}/5.0
- Top 3 Concerns:
${c.topIssues.map((issue, i) => `  ${i+1}. ${issue.question}: ${issue.avg.toFixed(2)}/5.0`).join('\n')}
`).join('\n')}

### By Division:
${demographicCorrelations.byDivision.map(d => `
**${d.division}** (${d.responseCount} avg responses/question)
- Overall Average: ${d.average.toFixed(2)}/5.0
- Top 3 Concerns:
${d.topIssues.map((issue, i) => `  ${i+1}. ${issue.question}: ${issue.avg.toFixed(2)}/5.0`).join('\n')}
`).join('\n')}

## Open-Ended Responses

${textResponses.length > 0 ? textResponses.map(r => `
**Question: ${r.question}**
Division: ${r.division} | Continent: ${r.continent}
Response: "${r.text}"
`).join('\n---\n') : 'No open-ended responses provided.'}

${multiselectResponses.length > 0 ? `\n## Multiple Choice Responses\n\n${multiselectResponses.map(r => `**${r.question}** (${r.division}, ${r.continent}): ${r.selected.join(', ')}`).join('\n')}` : ''}

---

# YOUR ANALYSIS TASK

Generate a Comprehensive Leadership Report with the following sections:

## 1. Executive Summary

High-level view of employee sentiment.
Direct but professional commentary on organizational health.

## 2. Key Sentiment Themes

- Strengths
- Weaknesses
- Systemic friction points
- Any indicators of burnout risk, operational drag, or communication gaps.

## 3. eNPS Analysis

- Numeric score
- What it means
- What's driving it
- How it compares to similar manufacturing organizations.

## 4. Quantitative Findings

- Highest-rated categories
- Lowest-rated categories
- Any notable deltas across demographics

## 5. SWOT Analysis (Employee Experience Lens)

- Strengths
- Weaknesses
- Opportunities
- Threats

## 6. Leadership Recommendations

Provide a prioritized, actionable list of fixes such as:
- Communication cadence improvements
- Process/automation target areas
- Equipment/tooling enhancements
- Workload balancing
- Cross-functional coordination

## 7. Continental Summary

Produce brief summaries (no cross-splitting to avoid isolating respondents):
- Summary by continent

Each summary should include:
- Overall sentiment
- Key strengths
- Key weaknesses
- Notable operational or communication patterns

## 8. Divisional Summary

Produce brief summaries:
- Summary by division

Each summary should include:
- Overall sentiment
- Key strengths
- Key weaknesses
- Notable operational or communication patterns

# TONE REQUIREMENTS

- Direct, candid, and strategic.
- No sugar-coating, but diplomatically phrased for executives.
- Forward-thinking and risk-aware.
- Use clear bullet points and short paragraphs.
- Highlight alignment or friction with long-term direction.

# OUTPUT FORMAT

The final output must be delivered as clean Markdown with the following heading structure:

# Employee Experience Report
## Executive Summary
## Key Sentiment Themes
## eNPS Analysis
## Quantitative Findings
## SWOT Analysis
## Recommendations for Leadership
## Continental Summary
## Divisional Summary

**DO NOT:**
- Output code
- Reference internal SQL or parsing steps
- Present only the final polished analysis

**DO:**
- Be specific and cite actual data from the survey
- Quote employee comments directly when relevant
- Use percentages and averages to support your conclusions
- Identify patterns across demographics
- Provide actionable, prioritized recommendations`;

    // Use custom prompt if provided in test mode, otherwise use default
    const prompt = (testMode && customPrompt) ? customPrompt : defaultPrompt;
    
    // Use specified model in test mode, otherwise use default
    const modelToUse = (testMode && model) ? model : 'google/gemini-2.5-flash';

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: 'system', content: 'You are an advanced analytics engine and strategic business consultant specializing in organizational health diagnostics. Your expertise spans employee engagement, operational efficiency, and workforce sentiment analysis. You deliver executive-grade insights that are candid, data-driven, and actionable. You identify systemic issues, recognize patterns across demographics, and provide prioritized recommendations that balance immediate fixes with long-term strategic improvements. Your tone is direct and professional, avoiding corporate jargon while maintaining diplomatic phrasing suitable for C-suite audiences.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 8000,
        temperature: 1
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }
    const data = await aiResponse.json();
    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ success: true, analysis }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
