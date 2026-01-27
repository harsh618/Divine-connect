import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get temples that need operational details updates
    const temples = await base44.asServiceRole.entities.Temple.filter({ 
      is_deleted: false 
    }, '-created_date', 10);
    
    // Filter temples missing operational details
    const templesToUpdate = temples.filter(t => 
      !t.opening_hours || 
      !t.dress_code || 
      !t.location ||
      t.opening_hours === '' ||
      t.location === ''
    );
    
    if (templesToUpdate.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'All temples have complete operational details',
        updated: 0 
      });
    }
    
    // Create a conversation with the temple details agent
    const conversation = await base44.agents.createConversation({
      agent_name: 'temple_details_agent',
      metadata: {
        name: `Daily Temple Details Update - ${new Date().toISOString().split('T')[0]}`,
        description: 'Automated daily update for temple operational information'
      }
    });
    
    // Send message to agent to update temples
    const templeNames = templesToUpdate.slice(0, 3).map(t => `${t.name} (${t.city}, ${t.state})`).join(', ');
    
    await base44.agents.addMessage(conversation, {
      role: 'user',
      content: `Please research and update the operational details for these temples: ${templeNames}
      
For each temple, find and update:
1. **Opening Hours**: Daily darshan timings, aarti schedules
2. **Location**: Full address with landmarks, how to reach
3. **Dress Code**: Required attire, restrictions
4. **Live Darshan URL**: If the temple offers online darshan

Search the official temple websites and trusted tourism sources for accurate information.`
    });
    
    return Response.json({ 
      success: true, 
      message: `Started details update for ${templesToUpdate.length} temples`,
      conversationId: conversation.id,
      temples: templeNames
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});