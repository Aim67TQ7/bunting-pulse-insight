import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');
    if (!ANTHROPIC_API_KEY) throw new Error('Anthropic API key not configured');

    const { surveyData, testMode = false, model, customPrompt } = await req.json();
    if (!surveyData?.length) throw new Error('No survey data');

    const validResponses = surveyData.filter((r: any) => r.responses_jsonb?.length > 0);
    
    // Process all responses with full context
    const ratingQuestions = new Map<string, { 
      label: string; 
      ratings: number[]; 
      feedbackByRating: Map<number, string[]>;
    }>();
    
    let enpsData: { rating: number; count: number }[] = [];
    
    validResponses.forEach((r: any) => {
      r.responses_jsonb.filter((resp: any) => resp.question_type === 'rating').forEach((resp: any) => {
        const questionId = resp.question_id;
        if (!ratingQuestions.has(questionId)) {
          ratingQuestions.set(questionId, { 
            label: resp.question_labels?.en || questionId, 
            ratings: [],
            feedbackByRating: new Map()
          });
        }
        
        const qData = ratingQuestions.get(questionId)!;
        const rating = resp.answer_value?.rating;
        const feedback = resp.answer_value?.feedback;
        
        if (rating) {
          qData.ratings.push(rating);
          
          // Track eNPS from recommend_company question
          if (questionId === 'recommend_company' || resp.question_labels?.en?.toLowerCase().includes('recommend')) {
            enpsData.push({ rating, count: 1 });
          }
          
          if (feedback) {
            if (!qData.feedbackByRating.has(rating)) {
              qData.feedbackByRating.set(rating, []);
            }
            qData.feedbackByRating.get(rating)!.push(feedback);
          }
        }
      });
    });
    
    // Calculate eNPS (1-5 scale: Promoters=5, Passives=3-4, Detractors=1-2)
    const promoters = enpsData.filter(d => d.rating === 5).length;
    const passives = enpsData.filter(d => d.rating >= 3 && d.rating <= 4).length;
    const detractors = enpsData.filter(d => d.rating <= 2).length;
    const totalEnpsResponses = enpsData.length;
    const enpsScore = totalEnpsResponses > 0 
      ? Math.round(((promoters - detractors) / totalEnpsResponses) * 100) 
      : null;
    
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
      // Sample top 3 representative comments per question (not per rating)
      sampleComments: Array.from(data.feedbackByRating.entries())
        .flatMap(([rating, comments]) => comments.map(c => ({ rating, comment: c })))
        .slice(0, 3)
    })).sort((a, b) => a.average - b.average); // Sort by average (lowest first)
    
    // Sample top 15 most substantive text responses
    const allTextResponses = validResponses.flatMap((r: any) => 
      r.responses_jsonb.filter((resp: any) => resp.question_type === 'text' && resp.answer_value?.text)
        .map((resp: any) => ({ 
          question: resp.question_labels?.en || resp.question_id,
          text: resp.answer_value.text,
          continent: r.continent || 'Unknown',
          division: r.division || 'Unknown',
          length: resp.answer_value.text.length
        }))
    );
    // Sort by length (longer = more substantive) and take top 15
    const textResponses = allTextResponses
      .sort((a, b) => b.length - a.length)
      .slice(0, 15)
      .map(({ length, ...rest }) => rest);
    
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

    const defaultPrompt = `# ANALYSIS TASK

You are an advanced analytics engine responsible for generating executive-grade insights from employee survey data.

## Your Mission
Perform a full organizational health analysis and deliver a comprehensive leadership report.

## Key Metrics Already Calculated for You

**eNPS Score: ${enpsScore !== null ? `${enpsScore}` : 'N/A'}**
${enpsScore !== null ? `- Promoters (Rating 5): ${promoters} (${Math.round((promoters/totalEnpsResponses)*100)}%)
- Passives (Rating 3-4): ${passives} (${Math.round((passives/totalEnpsResponses)*100)}%)
- Detractors (Rating 1-2): ${detractors} (${Math.round((detractors/totalEnpsResponses)*100)}%)
- Total eNPS Responses: ${totalEnpsResponses}` : ''}

**Overall Survey Statistics:**
- Total Responses: ${surveyData.length}
- Valid Responses: ${validResponses.length}
- Response Rate: ${((validResponses.length / surveyData.length) * 100).toFixed(1)}%

**Lowest-Rated Questions (Bottom 3):**
${questionAverages.slice(0, 3).map((q, i) => `${i+1}. ${q.label}: ${q.average.toFixed(2)}/5.0`).join('\n')}

**Highest-Rated Questions (Top 3):**
${questionAverages.slice(-3).reverse().map((q, i) => `${i+1}. ${q.label}: ${q.average.toFixed(2)}/5.0`).join('\n')}

---

# REQUIRED OUTPUT STRUCTURE

Deliver a polished Markdown report with these exact sections:

## 1. Executive Summary
Brief high-level overview of organizational health (2-3 paragraphs).

## 2. Key Sentiment Themes
**Strengths:** What's working well
**Weaknesses:** Critical pain points
**Systemic Issues:** Recurring patterns, burnout indicators, operational drag

## 3. eNPS Analysis
Interpret the eNPS score of ${enpsScore}:
- What does this score mean?
- What's driving it (cite specific data)?
- How does it compare to manufacturing industry benchmarks?

## 4. Quantitative Findings
**Highest-Rated Areas:** (cite specific averages)
**Lowest-Rated Areas:** (cite specific averages)
**Demographic Patterns:** Notable differences by continent/division

## 5. SWOT Analysis
From an employee experience lens:
- Strengths
- Weaknesses  
- Opportunities
- Threats

## 6. Leadership Recommendations
Prioritized action plan (5-7 items) covering:
- Communication improvements
- Process/automation opportunities
- Equipment/tooling needs
- Workload management
- Cross-functional coordination

## 7. Continental Summary
Brief analysis for each continent with sentiment, strengths, weaknesses.

## 8. Divisional Summary
Brief analysis for each division with sentiment, strengths, weaknesses.

---

# TONE & STYLE REQUIREMENTS

- **Direct and candid** - No corporate fluff
- **Data-driven** - Cite specific averages, percentages, quotes
- **Diplomatic** - Suitable for C-suite presentation
- **Forward-thinking** - Focus on strategic improvements
- **Actionable** - Every recommendation must be concrete

---

# DATA APPENDIX

## All Rating Questions (1-5 scale, 1=Strongly Disagree, 5=Strongly Agree)

${questionAverages.map(q => `
**${q.label}**
- Average: ${q.average.toFixed(2)}/5.0 (${q.count} responses)
- Distribution: 5★=${q.distribution['5']}, 4★=${q.distribution['4']}, 3★=${q.distribution['3']}, 2★=${q.distribution['2']}, 1★=${q.distribution['1']}
${q.sampleComments.length > 0 ? `- Sample Comments:\n${q.sampleComments.map(sc => `  [${sc.rating}★] "${sc.comment}"`).join('\n')}` : ''}
`).join('\n')}

## Demographic Breakdown

**By Continent:**
${demographicCorrelations.byContinent.map(c => `
- **${c.continent}**: Avg ${c.average.toFixed(2)}/5.0 (${c.responseCount} responses/question)
  Top concerns: ${c.topIssues.map(issue => `${issue.question} (${issue.avg.toFixed(2)})`).join(', ')}
`).join('')}

**By Division:**
${demographicCorrelations.byDivision.map(d => `
- **${d.division}**: Avg ${d.average.toFixed(2)}/5.0 (${d.responseCount} responses/question)
  Top concerns: ${d.topIssues.map(issue => `${issue.question} (${issue.avg.toFixed(2)})`).join(', ')}
`).join('')}

## Sample Open-Ended Responses (15 most substantive)

${textResponses.length > 0 ? textResponses.map(r => `
**Q: ${r.question}** [${r.division}, ${r.continent}]
"${r.text}"
`).join('\n') : 'No open-ended responses provided.'}

${multiselectResponses.length > 0 ? `\n## Multiple Choice Selections\n${multiselectResponses.slice(0, 20).map(r => `- **${r.question}** [${r.division}, ${r.continent}]: ${r.selected.join(', ')}`).join('\n')}` : ''}`;

    // Use custom prompt if provided in test mode, otherwise use default
    const prompt = (testMode && customPrompt) ? customPrompt : defaultPrompt;
    
    console.log('Starting 2-part analysis: GPT-4o -> Claude');
    
    // ============ PART 1: GPT-4o Initial Analysis ============
    console.log('Part 1: Running GPT-4o initial analysis...');
    const gpt4oResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a senior HR analytics consultant. Analyze employee survey data and deliver a comprehensive, data-driven executive report. Be candid, strategic, and cite specific metrics.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 8000
      })
    });

    if (!gpt4oResponse.ok) {
      const errorText = await gpt4oResponse.text();
      console.error('GPT-4o API error:', gpt4oResponse.status, errorText);
      throw new Error(`GPT-4o API error: ${gpt4oResponse.status}`);
    }
    const gpt4oData = await gpt4oResponse.json();
    const initialAnalysis = gpt4oData.choices[0].message.content;
    console.log('Part 1 complete. Analysis length:', initialAnalysis.length, 'characters');

    // ============ PART 2: Claude Deep Dive Analysis ============
    console.log('Part 2: Running Claude deep dive analysis with higher temperature...');
    
    const claudePrompt = `You are an expert organizational psychologist conducting a deep-dive analysis of employee survey results.

You have been provided with an initial analysis from a colleague (shown below). Your task is to enhance and expand EACH SECTION with deeper insights:

**CRITICAL INSTRUCTIONS:**
1. Maintain the EXACT same section structure and headers from the initial analysis
2. For each section (Executive Summary, Key Sentiment Themes, eNPS Analysis, Quantitative Findings, SWOT Analysis, Leadership Recommendations, Continental Summary, Divisional Summary):
   - Keep the section header exactly as-is
   - Add your comprehensive insights, deeper analysis, and strategic context WITHIN each section
   - Identify hidden patterns, root causes, and psychological dynamics
   - Provide specific, actionable recommendations with implementation strategies

3. DO NOT create separate "PART 1" and "PART 2" sections
4. DO NOT add meta-commentary like "I've enhanced the analysis" or "Building on the initial analysis"
5. Simply provide the enhanced version with all sections enriched with your deeper insights

---

## INITIAL ANALYSIS TO ENHANCE:

${initialAnalysis}

---

## YOUR ENHANCED COMPREHENSIVE ANALYSIS:

Please provide the complete enhanced report maintaining the exact same section structure but with significantly deeper insights, root cause analysis, and strategic recommendations integrated into each section.`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 8000,
        temperature: 0.7,
        messages: [
          { role: 'user', content: claudePrompt }
        ]
      })
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', claudeResponse.status, errorText);
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }
    const claudeData = await claudeResponse.json();
    let analysis = claudeData.content[0].text;
    console.log('Part 2 complete. Enhanced analysis length:', analysis.length, 'characters');
    
    // Remove AI-generated meta-commentary at the end
    const metaCommentPatterns = [
      /\n\n?If you (want|would like|need).*$/s,
      /\n\n?Would you like.*$/s,
      /\n\n?I can (also|additionally|further).*$/s,
      /\n\n?Let me know if.*$/s,
      /\n\n?Please let me know.*$/s,
      /\n\n?Feel free to.*$/s
    ];
    
    for (const pattern of metaCommentPatterns) {
      analysis = analysis.replace(pattern, '');
    }
    
    analysis = analysis.trim();
    console.log('2-part analysis complete. Total length:', analysis.length, 'characters');

    return new Response(JSON.stringify({ success: true, analysis }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
