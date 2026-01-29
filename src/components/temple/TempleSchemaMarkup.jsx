import React from 'react';

export default function TempleSchemaMarkup({ temple }) {
  if (!temple) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "HinduTemple",
    "name": temple.name,
    "alternateName": temple.alternate_name || temple.name,
    "description": temple.tagline || temple.description?.substring(0, 200) || `${temple.name} is a sacred temple dedicated to ${temple.primary_deity} in ${temple.city}, ${temple.state}.`,
    "url": typeof window !== 'undefined' ? window.location.href : '',
    "image": temple.images?.length > 0 ? temple.images : [temple.thumbnail_url].filter(Boolean),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": temple.location || '',
      "addressLocality": temple.city,
      "addressRegion": temple.state,
      "postalCode": temple.pincode || '',
      "addressCountry": "IN"
    },
    "publicAccess": true,
    "isAccessibleForFree": temple.visitor_info?.entry_fee === 'Free' || !temple.visitor_info?.entry_fee,
    "touristType": ["Spiritual", "Historical", "Architectural"],
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Primary Deity",
        "value": temple.primary_deity
      },
      {
        "@type": "PropertyValue",
        "name": "Architectural Style",
        "value": temple.architecture?.style || "Traditional Hindu Temple Architecture"
      }
    ]
  };

  // Add geo coordinates if available
  if (temple.latitude && temple.longitude) {
    schema.geo = {
      "@type": "GeoCoordinates",
      "latitude": String(temple.latitude),
      "longitude": String(temple.longitude)
    };
  }

  // Add opening hours if available
  if (temple.opening_hours_structured?.length > 0) {
    schema.openingHoursSpecification = temple.opening_hours_structured.map(session => ({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": session.opens,
      "closes": session.closes
    }));
  }

  // Add contact if available
  if (temple.contact?.phone) {
    schema.telephone = temple.contact.phone;
  }

  // Add festivals as events
  if (temple.festivals?.length > 0) {
    schema.event = temple.festivals.slice(0, 5).map(festival => ({
      "@type": "Event",
      "name": typeof festival === 'string' ? festival : festival.name,
      "description": typeof festival === 'object' ? festival.description : `Annual festival at ${temple.name}`,
      "location": {
        "@type": "Place",
        "name": temple.name,
        "address": `${temple.city}, ${temple.state}`
      }
    }));
  }

  // Add dress code to additional properties
  if (temple.dress_code) {
    const dressCodeValue = typeof temple.dress_code === 'string' 
      ? temple.dress_code 
      : temple.dress_code.general || `Men: ${temple.dress_code.men || 'Traditional wear'}, Women: ${temple.dress_code.women || 'Traditional wear'}`;
    
    schema.additionalProperty.push({
      "@type": "PropertyValue",
      "name": "Dress Code",
      "value": dressCodeValue
    });
  }

  // Add deities info
  if (temple.deities?.main_deity?.name) {
    schema.additionalProperty.push({
      "@type": "PropertyValue",
      "name": "Main Deity Form",
      "value": `${temple.deities.main_deity.name}${temple.deities.main_deity.posture ? ` (${temple.deities.main_deity.posture})` : ''}`
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
}