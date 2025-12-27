import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { temple_name, temple_location, primary_deity } = await req.json();

    const prompt = `List the upcoming festivals and important dates for ${temple_name} in ${temple_location}, which is dedicated to ${primary_deity}.

Please provide:
1. Major upcoming festivals in the next 6 months (with approximate dates)
2. Special celebration days specific to this temple
3. Monthly important dates (Ekadashi, Purnima, Amavasya relevant to this deity)
4. Brief description of each festival's significance

Return the response as a JSON array with this structure:
[
  {
    "name": "Festival Name",
    "date": "Approximate date or month",
    "description": "Brief description",
    "significance": "Why it's celebrated here"
  }
]`;

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          festivals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                date: { type: "string" },
                description: { type: "string" },
                significance: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({ 
      festivals: response.festivals || []
    });
  } catch (error) {
    console.error('Error fetching festivals:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});