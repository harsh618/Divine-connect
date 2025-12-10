const translations = {
  en: {
    nav: { temples: "Temples", poojas: "Poojas", astrology: "Astrology", priests: "Priests", donate: "Donate", home: "Home", journey: "Journey", bookings: "Bookings", profile: "Profile" },
    common: { signIn: "Sign In", signOut: "Sign Out", bookNow: "Book Now", donate: "Donate", readMore: "Read More", showLess: "Show Less", loading: "Loading...", save: "Save", cancel: "Cancel", edit: "Edit", delete: "Delete", search: "Search", filter: "Filter" },
    home: { hero: { title: "Your Spiritual Journey Begins Here", subtitle: "Connect with temples, book poojas, consult astrologers, and embrace divine blessings", exploreTemples: "Explore Temples", bookPooja: "Book a Pooja" } },
    temple: { bookVisit: "Book Visit", orderPrasad: "Order Prasad", about: "About This Temple", significance: "Significance", history: "History" },
    articles: { title: "Sacred Stories from the Scriptures", subtitle: "Divine wisdom and temple history", from: "From", showAll: "Show All {{count}} Articles", articleSeva: "Article Seva", writeArticle: "Write Article", shareKnowledge: "Share divine knowledge with devotees" },
    profile: { title: "My Profile", language: "Preferred Language" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", es: "Español (Spanish)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)" }
  },
  hi: {
    nav: { temples: "मंदिर", poojas: "पूजा", astrology: "ज्योतिष", priests: "पुजारी", donate: "दान करें", home: "होम", journey: "यात्रा", bookings: "बुकिंग", profile: "प्रोफ़ाइल" },
    common: { signIn: "साइन इन करें", signOut: "साइन आउट करें", bookNow: "अभी बुक करें", donate: "दान करें", readMore: "और पढ़ें", showLess: "कम दिखाएं", loading: "लोड हो रहा है...", save: "सहेजें", cancel: "रद्द करें", edit: "संपादित करें", delete: "हटाएं", search: "खोजें", filter: "फ़िल्टर" },
    home: { hero: { title: "आपकी आध्यात्मिक यात्रा यहाँ से शुरू होती है", subtitle: "मंदिरों से जुड़ें, पूजा बुक करें, ज्योतिषियों से परामर्श लें और दिव्य आशीर्वाद प्राप्त करें", exploreTemples: "मंदिर देखें", bookPooja: "पूजा बुक करें" } },
    temple: { bookVisit: "दर्शन बुक करें", orderPrasad: "प्रसाद ऑर्डर करें", about: "इस मंदिर के बारे में", significance: "महत्व", history: "इतिहास" },
    articles: { title: "शास्त्रों से पवित्र कहानियां", subtitle: "दिव्य ज्ञान और मंदिर का इतिहास", from: "स्रोत", showAll: "सभी {{count}} लेख दिखाएं", articleSeva: "लेख सेवा", writeArticle: "लेख लिखें", shareKnowledge: "भक्तों के साथ दिव्य ज्ञान साझा करें" },
    profile: { title: "मेरी प्रोफ़ाइल", language: "पसंदीदा भाषा" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", es: "Español (Spanish)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)" }
  },
  es: {
    nav: { temples: "Templos", poojas: "Poojas", astrology: "Astrología", priests: "Sacerdotes", donate: "Donar", home: "Inicio", journey: "Viaje", bookings: "Reservas", profile: "Perfil" },
    common: { signIn: "Iniciar sesión", signOut: "Cerrar sesión", bookNow: "Reservar ahora", donate: "Donar", readMore: "Leer más", showLess: "Mostrar menos", loading: "Cargando...", save: "Guardar", cancel: "Cancelar", edit: "Editar", delete: "Eliminar", search: "Buscar", filter: "Filtrar" },
    home: { hero: { title: "Tu viaje espiritual comienza aquí", subtitle: "Conéctate con templos, reserva poojas, consulta astrólogos y abraza las bendiciones divinas", exploreTemples: "Explorar templos", bookPooja: "Reservar un Pooja" } },
    temple: { bookVisit: "Reservar visita", orderPrasad: "Ordenar Prasad", about: "Sobre este templo", significance: "Significado", history: "Historia" },
    articles: { title: "Historias sagradas de las escrituras", subtitle: "Sabiduría divina e historia del templo", from: "De", showAll: "Mostrar todos los {{count}} artículos", articleSeva: "Seva de artículos", writeArticle: "Escribir artículo", shareKnowledge: "Comparte conocimiento divino con devotos" },
    profile: { title: "Mi perfil", language: "Idioma preferido" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", es: "Español (Spanish)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)" }
  }
};

export const t = (key, language = 'en', params = {}) => {
  const keys = key.split('.');
  let value = translations[language] || translations.en;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      value = translations.en;
      for (const k of keys) {
        value = value?.[k];
      }
      break;
    }
  }
  
  if (typeof value === 'string' && params) {
    Object.keys(params).forEach(param => {
      value = value.replace(`{{${param}}}`, params[param]);
    });
  }
  
  return value || key;
};

export default translations;