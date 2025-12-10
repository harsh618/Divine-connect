import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templeName, deity, city, state, language = 'english' } = await req.json();

    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const languageMap = {
      english: 'English',
      hindi: 'Hindi',
      sanskrit: 'Sanskrit',
      tamil: 'Tamil',
      telugu: 'Telugu'
    };

    const prompt = `Generate comprehensive spiritual stories and historical significance about ${templeName} temple dedicated to ${deity} in ${city}, ${state}.

Please provide in ${languageMap[language]}:

1. HISTORICAL LEGENDS: Detailed origin stories (katha) with specific dates and historical context where available
2. SCRIPTURAL QUOTES: Include direct quotes from Hindu scriptures (Vedas, Puranas, Bhagavad Gita, etc.) with exact citations including text name, chapter, and verse number
3. DIVINE EXPERIENCES: Famous miracles, answered prayers, or divine manifestations reported at this temple
4. CULTURAL SIGNIFICANCE: The temple's role in regional culture, festivals, and traditions
5. ARCHITECTURAL & SPIRITUAL IMPORTANCE: Unique features and their spiritual symbolism

For each story section:
- Provide direct quotes in quotation marks with full citation
- Include verifiable historical references with sources
- Mention any famous saints, scholars, or devotees associated with the temple
- Add relevant festival celebrations and their significance

Format the response as engaging narrative suitable for devotees seeking spiritual knowledge.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a knowledgeable Hindu scholar and storyteller who provides accurate historical and spiritual information about temples with proper citations and references.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const citations = data.citations || [];

    // Parse the content into structured format
    const sections = content.split('\n\n').filter(s => s.trim());
    const stories = [];
    let currentStory = null;

    for (const section of sections) {
      const lines = section.split('\n');
      const firstLine = lines[0].trim();
      
      // Check if this is a heading (contains numbers or keywords)
      if (firstLine.match(/^\d+\./) || 
          firstLine.toUpperCase().includes('LEGEND') || 
          firstLine.toUpperCase().includes('STORY') ||
          firstLine.toUpperCase().includes('HISTORY') ||
          firstLine.toUpperCase().includes('SIGNIFICANCE')) {
        
        if (currentStory) {
          stories.push(currentStory);
        }
        
        currentStory = {
          heading: firstLine.replace(/^\d+\.\s*/, '').replace(/[:#]/g, '').trim(),
          content: lines.slice(1).join('\n').trim(),
          quotes: [],
          references: []
        };
      } else if (currentStory) {
        currentStory.content += '\n\n' + section;
      }
    }

    if (currentStory) {
      stories.push(currentStory);
    }

    // Extract quotes and references from content
    stories.forEach(story => {
      const quoteMatches = story.content.match(/"([^"]+)"\s*(?:\(([^)]+)\)|\[([^\]]+)\])?/g);
      if (quoteMatches) {
        story.quotes = quoteMatches.map(match => {
          const cleanMatch = match.replace(/"/g, '');
          return cleanMatch;
        });
      }

      const refMatches = story.content.match(/\[(\d+)\]|\(Source:([^)]+)\)|\(Ref:([^)]+)\)/g);
      if (refMatches) {
        story.references = refMatches.map(ref => ref.replace(/[\[\]\(\)]/g, ''));
      }
    });

    return Response.json({
      success: true,
      data: {
        title: `Sacred Stories of ${templeName}`,
        stories: stories,
        scriptural_references: citations.join('\n'),
        citations: citations,
        language: languageMap[language]
      }
    });

  } catch (error) {
    console.error('Error generating temple stories:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});