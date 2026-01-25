import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch dynamic content
    const [temples, campaigns, poojas, articles] = await Promise.all([
      base44.asServiceRole.entities.Temple.filter({ is_deleted: false, is_hidden: false }),
      base44.asServiceRole.entities.DonationCampaign.filter({ is_deleted: false, is_hidden: false }),
      base44.asServiceRole.entities.Pooja.filter({ is_deleted: false }),
      base44.asServiceRole.entities.Article.filter({ is_deleted: false, is_published: true })
    ]);

    const baseUrl = req.headers.get('origin') || 'https://your-domain.com';
    const today = new Date().toISOString().split('T')[0];

    // Static pages
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: 'Temples', priority: '0.9', changefreq: 'daily' },
      { url: 'Pooja', priority: '0.9', changefreq: 'weekly' },
      { url: 'Astrology', priority: '0.8', changefreq: 'weekly' },
      { url: 'Donate', priority: '0.8', changefreq: 'daily' },
      { url: 'Yatra', priority: '0.7', changefreq: 'weekly' },
      { url: 'PriestPandit', priority: '0.7', changefreq: 'weekly' },
    ];

    // Build sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/${page.url}</loc>\n`;
      sitemap += `    <lastmod>${today}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += `  </url>\n`;
    });

    // Add temples
    temples?.forEach(temple => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/TempleDetail?id=${temple.id}</loc>\n`;
      sitemap += `    <lastmod>${temple.updated_date?.split('T')[0] || today}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.8</priority>\n`;
      sitemap += `  </url>\n`;
    });

    // Add donation campaigns
    campaigns?.forEach(campaign => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/CampaignDetail?id=${campaign.id}</loc>\n`;
      sitemap += `    <lastmod>${campaign.updated_date?.split('T')[0] || today}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.7</priority>\n`;
      sitemap += `  </url>\n`;
    });

    // Add poojas
    poojas?.forEach(pooja => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/PoojaDetail?id=${pooja.id}</loc>\n`;
      sitemap += `    <lastmod>${pooja.updated_date?.split('T')[0] || today}</lastmod>\n`;
      sitemap += `    <changefreq>monthly</changefreq>\n`;
      sitemap += `    <priority>0.6</priority>\n`;
      sitemap += `  </url>\n`;
    });

    // Add articles
    articles?.forEach(article => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/ArticleDetail?id=${article.id}</loc>\n`;
      sitemap += `    <lastmod>${article.updated_date?.split('T')[0] || today}</lastmod>\n`;
      sitemap += `    <changefreq>monthly</changefreq>\n`;
      sitemap += `    <priority>0.5</priority>\n`;
      sitemap += `  </url>\n`;
    });

    sitemap += '</urlset>';

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});