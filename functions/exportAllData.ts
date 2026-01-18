import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Define all entities to export
    const entities = [
      'Temple',
      'Pooja',
      'Booking',
      'Donation',
      'DonationCampaign',
      'ProviderProfile',
      'PriestPoojaMapping',
      'Review',
      'Article',
      'AuspiciousDay',
      'TempleEvent',
      'Kundli',
      'Hotel',
      'Service',
      'PrasadItem',
      'FAQ',
      'AuditLog',
      'User'
    ];

    const exports = {};

    for (const entityName of entities) {
      try {
        let data;
        if (entityName === 'User') {
          data = await base44.asServiceRole.entities.User.list();
        } else {
          data = await base44.asServiceRole.entities[entityName].filter({});
        }
        
        if (data && data.length > 0) {
          // Convert to CSV
          const headers = Object.keys(data[0]);
          const csvRows = [headers.join(',')];
          
          for (const row of data) {
            const values = headers.map(header => {
              let value = row[header];
              if (value === null || value === undefined) {
                return '';
              }
              if (typeof value === 'object') {
                value = JSON.stringify(value);
              }
              // Escape quotes and wrap in quotes if contains comma or newline
              value = String(value).replace(/"/g, '""');
              if (value.includes(',') || value.includes('\n') || value.includes('"')) {
                value = `"${value}"`;
              }
              return value;
            });
            csvRows.push(values.join(','));
          }
          
          exports[entityName] = {
            csv: csvRows.join('\n'),
            count: data.length
          };
        } else {
          exports[entityName] = { csv: '', count: 0 };
        }
      } catch (e) {
        exports[entityName] = { csv: '', count: 0, error: e.message };
      }
    }

    return Response.json({ 
      success: true, 
      exports,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});