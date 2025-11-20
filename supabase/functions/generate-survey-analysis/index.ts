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

    const defaultPrompt = `You are an expert HR data analyst conducting a comprehensive employee survey analysis for leadership review. Your analysis must be thorough, data-driven, and actionable.

**CRITICAL: This analysis will be presented to senior leadership. Be specific, cite data, and provide clear insights.**

# SURVEY DATA SUMMARY

**Response Statistics:**
- Total Responses: ${surveyData.length}
- Valid Responses: ${validResponses.length}
- Response Rate: ${((validResponses.length / surveyData.length) * 100).toFixed(1)}%

# DETAILED QUESTION ANALYSIS

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

# DEMOGRAPHIC ANALYSIS

## By Continent:
${demographicCorrelations.byContinent.map(c => `
**${c.continent}** (${c.responseCount} avg responses/question)
- Overall Average: ${c.average.toFixed(2)}/5.0
- Top 3 Concerns:
${c.topIssues.map((issue, i) => `  ${i+1}. ${issue.question}: ${issue.avg.toFixed(2)}/5.0`).join('\n')}
`).join('\n')}

## By Division:
${demographicCorrelations.byDivision.map(d => `
**${d.division}** (${d.responseCount} avg responses/question)
- Overall Average: ${d.average.toFixed(2)}/5.0
- Top 3 Concerns:
${d.topIssues.map((issue, i) => `  ${i+1}. ${issue.question}: ${issue.avg.toFixed(2)}/5.0`).join('\n')}
`).join('\n')}

# OPEN-ENDED RESPONSES

${textResponses.length > 0 ? textResponses.map(r => `
**Question: ${r.question}**
Division: ${r.division} | Continent: ${r.continent}
Response: "${r.text}"
`).join('\n---\n') : 'No open-ended responses provided.'}

${multiselectResponses.length > 0 ? `\n# MULTIPLE CHOICE RESPONSES\n\n${multiselectResponses.map(r => `**${r.question}** (${r.division}, ${r.continent}): ${r.selected.join(', ')}`).join('\n')}` : ''}

---

# YOUR ANALYSIS REQUIREMENTS:

## 1. EXECUTIVE SUMMARY (2-3 paragraphs)
Provide a concise overview highlighting:
- Overall employee sentiment (use the average scores)
- 3 biggest strengths (scores 4.0+)
- 3 most critical concerns (scores below 3.5)
- Key demographic differences that require attention

## 2. DETAILED FINDINGS BY CATEGORY

For each major category (Job Satisfaction, Communication, Leadership, Career Development, Work Environment, etc.):
- **Current State**: What does the data show? (cite specific averages)
- **Employee Voice**: What are employees saying in comments? (quote specific feedback)
- **Patterns**: Are there differences between continents/divisions?
- **Severity**: Rate as High/Medium/Low concern based on scores and comment sentiment

## 3. DEMOGRAPHIC INSIGHTS

Compare and contrast:
- **Continent Differences**: How do Europe vs North America ratings differ? Why might this be?
- **Division Differences**: How do Equipment vs Magnetics vs Both divisions compare?
- **Cross-Analysis**: Are there specific continent+division combinations with unique patterns?

## 4. CRITICAL THEMES FROM COMMENTS

Analyze all employee comments to identify:
- Recurring themes mentioned by multiple employees
- Specific issues or concerns raised
- Positive feedback and what's working well
- Suggestions for improvement

## 5. PRIORITY ACTION PLAN

Provide 5-7 specific, actionable recommendations ranked by:
- **Impact**: How many employees are affected?
- **Urgency**: How severe is the issue based on scores and comments?
- **Feasibility**: How quickly can this be addressed?

For each recommendation:
- **Issue**: What's the problem?
- **Evidence**: What data supports this? (cite scores and quotes)
- **Proposed Action**: Specific steps to take
- **Expected Outcome**: What improvement should we see?

## 6. STRENGTHS TO MAINTAIN

Identify what's working well (scores 4.0+) and recommend how to:
- Maintain these strengths
- Apply these successes to weaker areas
- Recognize teams/areas performing well

---

**ANALYSIS GUIDELINES:**
✓ BE SPECIFIC: Use actual scores, percentages, and direct quotes
✓ BE HONEST: Don't sugarcoat low scores or concerning patterns
✓ BE ACTIONABLE: Every insight should lead to a clear recommendation
✓ BE THOROUGH: Analyze BOTH quantitative ratings AND qualitative comments
✓ CONNECT DOTS: Link related issues across questions
✓ CONSIDER CONTEXT: Think about why certain departments/locations might differ
✓ PRIORITIZE: Not all issues are equal - focus on what matters most

**DO NOT:**
✗ Make generic statements without data support
✗ Ignore low-scoring areas
✗ Overlook demographic differences
✗ Miss patterns in employee comments
✗ Provide vague recommendations`;

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
          { role: 'system', content: 'You are a senior HR analytics consultant with 15+ years of experience in organizational development and employee engagement. You specialize in extracting actionable insights from survey data by combining quantitative metrics with qualitative feedback. Your analyses are known for being thorough, honest, and directly useful to leadership teams making strategic decisions. You never provide generic advice - every statement is grounded in the specific data provided.' },
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
