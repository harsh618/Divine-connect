import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Optional: Check if user is authenticated (remove if you want public access)
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { texts, targetLanguage } = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return Response.json({ error: 'texts array is required' }, { status: 400 });
    }

    if (!targetLanguage) {
      return Response.json({ error: 'targetLanguage is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'GOOGLE_API_KEY not configured' }, { status: 500 });
    }

    // Google Cloud Translate API endpoint
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: texts,
        target: targetLanguage,
        format: 'text'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Translate API error:', error);
      return Response.json({ error: 'Translation failed' }, { status: response.status });
    }

    const data = await response.json();
    const translations = data.data.translations.map(t => t.translatedText);

    return Response.json({ translations });
  } catch (error) {
    console.error('Translation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});