import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, displayDate } = await req.json();
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{
          role: 'user',
          content: `Check if ${displayDate} (${date}) has any Hindu festival, vrat, ekadashi, purnima, amavasya, or auspicious day. If yes, provide: 1) A concise title (max 4 words), 2) A brief description (max 20 words). If no significant event, return null for both. Respond only with valid JSON: {"title": "...", "description": "..."} or {"title": null, "description": null}`
        }],
        temperature: 0.1,
        max_tokens: 150
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{"title": null, "description": null}';
    
    // Parse the JSON response
    const result = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim());
    
    return Response.json({
      date,
      displayDate,
      title: result.title,
      description: result.description,
      hasEvent: !!(result.title && result.description)
    });
    
  } catch (error) {
    return Response.json({ 
      error: error.message,
      title: null,
      description: null,
      hasEvent: false
    }, { status: 500 });
  }
});