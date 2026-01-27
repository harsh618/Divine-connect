import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get temples that need content updates (missing or outdated descriptions)
    const temples = await base44.asServiceRole.entities.Temple.filter({ 
      is_deleted: false 
    }, '-created_date', 10);
    
    // Filter temples that need description updates
    const templesToUpdate = temples.filter(t => 
      !t.description || 
      !t.significance || 
      !t.history ||
      t.description.length < 100
    );
    
    if (templesToUpdate.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'All temples have complete descriptions',
        updated: 0 
      });
    }
    
    // Create a conversation with the temple content agent
    const conversation = await base44.agents.createConversation({
      agent_name: 'temple_content_agent',
      metadata: {
        name: `Daily Temple Content Update - ${new Date().toISOString().split('T')[0]}`,
        description: 'Automated daily update for temple descriptions and upcoming events'
      }
    });
    
    // Send message to agent to update temples
    const templeNames = templesToUpdate.slice(0, 3).map(t => t.name).join(', ');
    
    await base44.agents.addMessage(conversation, {
      role: 'user',
      content: `Please research and update the following temples with comprehensive descriptions, historical significance, and upcoming festivals/tithis: ${templeNames}. 
      
For each temple:
1. Write a detailed description (at least 200 words)
2. Add historical significance
3. List upcoming festivals and important dates based on Hindu calendar
4. Include any special occasions related to the main deity

Use web search to find accurate, authentic information.`
    });
    
    return Response.json({ 
      success: true, 
      message: `Started content update for ${templesToUpdate.length} temples`,
      conversationId: conversation.id,
      temples: templeNames
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});