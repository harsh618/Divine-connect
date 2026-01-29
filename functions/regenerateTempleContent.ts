import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin' && user?.app_role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { temple_id } = await req.json();

    if (!temple_id) {
      return Response.json({ error: 'temple_id is required' }, { status: 400 });
    }

    // Fetch temple details
    const temple = await base44.asServiceRole.entities.Temple.get(temple_id);
    
    if (!temple) {
      return Response.json({ error: 'Temple not found' }, { status: 404 });
    }

    // Generate enhanced content using AI
    const prompt = `You are a content writer for a spiritual platform. Rewrite and enhance the content for ${temple.name} temple in ${temple.city}, ${temple.state}.

Primary Deity: ${temple.primary_deity}

Current Description: ${temple.description || 'Not available'}

Current Significance: ${temple.significance || 'Not available'}

Please provide:
1. A rich, engaging description (200-300 words) that captures the spiritual essence, historical importance, and what makes this temple special. Use markdown formatting for better readability.

2. A compelling significance section (150-200 words) explaining the religious and cultural importance of this temple. Use markdown formatting.

3. A concise tagline (2-3 sentences) that answers: Who is the deity? Where is it? Why is it famous?

Format your response as valid JSON:
{
  "description": "...",
  "significance": "...",
  "tagline": "..."
}`;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          description: { type: "string" },
          significance: { type: "string" },
          tagline: { type: "string" }
        },
        required: ["description", "significance", "tagline"]
      }
    });

    // Update temple with new content
    await base44.asServiceRole.entities.Temple.update(temple_id, {
      description: aiResponse.description,
      significance: aiResponse.significance,
      tagline: aiResponse.tagline
    });

    return Response.json({
      success: true,
      data: {
        description: aiResponse.description,
        significance: aiResponse.significance,
        tagline: aiResponse.tagline
      }
    });

  } catch (error) {
    console.error('Error regenerating temple content:', error);
    return Response.json({ 
      error: error.message || 'Failed to regenerate content' 
    }, { status: 500 });
  }
});