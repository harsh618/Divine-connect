import { useEffect } from 'react';

export default function SEO({ 
  title = 'MandirSutra - Your Spiritual Journey Companion',
  description = 'Discover sacred temples, book poojas, connect with priests and astrologers, plan yatras, and support noble causes. Your complete spiritual platform.',
  image = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/b2c47aca5_pexels-koushalya-karthikeyan-605468635-18362045.jpg',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website'
}) {
  useEffect(() => {
    // Set title
    document.title = title;

    // Set or update meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: 'hindu temples, poojas, astrology, priests, yatra, donation, spiritual journey, mandir, jyotish' },
      { name: 'author', content: 'MandirSutra' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      
      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: 'MandirSutra' },
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      
      // Additional SEO
      { name: 'robots', content: 'index, follow' },
      { name: 'language', content: 'English' },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const attr = name ? 'name' : 'property';
      const value = name || property;
      
      let element = document.querySelector(`meta[${attr}="${value}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, value);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    });

    // Set canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

  }, [title, description, image, url, type]);

  return null;
}