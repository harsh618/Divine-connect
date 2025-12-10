const translations = {
  en: {
    nav: { temples: "Temples", poojas: "Poojas", astrology: "Astrology", priests: "Priests", donate: "Donate", home: "Home", journey: "Journey", bookings: "Bookings", profile: "Profile" },
    common: { signIn: "Sign In", signOut: "Sign Out", bookNow: "Book Now", donate: "Donate", readMore: "Read More", showLess: "Show Less", loading: "Loading...", save: "Save", cancel: "Cancel", edit: "Edit", delete: "Delete", search: "Search", filter: "Filter" },
    home: { hero: { title: "Your Spiritual Journey Begins Here", subtitle: "Connect with temples, book poojas, consult astrologers, and embrace divine blessings", exploreTemples: "Explore Temples", bookPooja: "Book a Pooja" } },
    temple: { bookVisit: "Book Visit", orderPrasad: "Order Prasad", about: "About This Temple", significance: "Significance", history: "History" },
    articles: { title: "Sacred Stories from the Scriptures", subtitle: "Divine wisdom and temple history", from: "From", showAll: "Show All {{count}} Articles", articleSeva: "Article Seva", writeArticle: "Write Article", shareKnowledge: "Share divine knowledge with devotees" },
    profile: { title: "My Profile", language: "Preferred Language" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)", mr: "मराठी (Marathi)", gu: "ગુજરાતી (Gujarati)", kn: "ಕನ್ನಡ (Kannada)", ml: "മലയാളം (Malayalam)", pa: "ਪੰਜਾਬੀ (Punjabi)", or: "ଓଡ଼ିଆ (Odia)", as: "অসমীয়া (Assamese)", ur: "اردو (Urdu)", sa: "संस्कृत (Sanskrit)", kok: "कोंकणी (Konkani)", mni: "মৈতৈলোন (Manipuri)" }
  },
  hi: {
    nav: { temples: "मंदिर", poojas: "पूजा", astrology: "ज्योतिष", priests: "पुजारी", donate: "दान करें", home: "होम", journey: "यात्रा", bookings: "बुकिंग", profile: "प्रोफ़ाइल" },
    common: { signIn: "साइन इन करें", signOut: "साइन आउट करें", bookNow: "अभी बुक करें", donate: "दान करें", readMore: "और पढ़ें", showLess: "कम दिखाएं", loading: "लोड हो रहा है...", save: "सहेजें", cancel: "रद्द करें", edit: "संपादित करें", delete: "हटाएं", search: "खोजें", filter: "फ़िल्टर" },
    home: { hero: { title: "आपकी आध्यात्मिक यात्रा यहाँ से शुरू होती है", subtitle: "मंदिरों से जुड़ें, पूजा बुक करें, ज्योतिषियों से परामर्श लें और दिव्य आशीर्वाद प्राप्त करें", exploreTemples: "मंदिर देखें", bookPooja: "पूजा बुक करें" } },
    temple: { bookVisit: "दर्शन बुक करें", orderPrasad: "प्रसाद ऑर्डर करें", about: "इस मंदिर के बारे में", significance: "महत्व", history: "इतिहास" },
    articles: { title: "शास्त्रों से पवित्र कहानियां", subtitle: "दिव्य ज्ञान और मंदिर का इतिहास", from: "स्रोत", showAll: "सभी {{count}} लेख दिखाएं", articleSeva: "लेख सेवा", writeArticle: "लेख लिखें", shareKnowledge: "भक्तों के साथ दिव्य ज्ञान साझा करें" },
    profile: { title: "मेरी प्रोफ़ाइल", language: "पसंदीदा भाषा" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)", mr: "मराठी (Marathi)", gu: "ગુજરાતી (Gujarati)", kn: "ಕನ್ನಡ (Kannada)", ml: "മലയാളം (Malayalam)", pa: "ਪੰਜਾਬੀ (Punjabi)", or: "ଓଡ଼ିଆ (Odia)", as: "অসমীয়া (Assamese)", ur: "اردو (Urdu)", sa: "संस्कृत (Sanskrit)", kok: "कोंकणी (Konkani)", mni: "মৈতৈলোন (Manipuri)" }
  },
  ta: {
    nav: { temples: "கோயில்கள்", poojas: "பூஜைகள்", astrology: "ஜோதிடம்", priests: "பூசாரிகள்", donate: "நன்கொடை", home: "முகப்பு", journey: "பயணம்", bookings: "முன்பதிவுகள்", profile: "சுயவிவரம்" },
    common: { signIn: "உள்நுழைக", signOut: "வெளியேறு", bookNow: "இப்போது பதிவு செய்க", donate: "நன்கொடை அளிக்கவும்", readMore: "மேலும் வாசிக்க", showLess: "குறைவாக காட்டு", loading: "ஏற்றுகிறது...", save: "சேமி", cancel: "ரத்து செய்", edit: "திருத்து", delete: "நீக்கு", search: "தேடு", filter: "வடிகட்டி" },
    home: { hero: { title: "உங்கள் ஆன்மீக பயணம் இங்கு தொடங்குகிறது", subtitle: "கோயில்களுடன் இணைந்து, பூஜைகளை பதிவு செய்து, ஜோதிடர்களை அணுகி தெய்வீக ஆசீர்வாதங்களை பெறுங்கள்", exploreTemples: "கோயில்களை ஆராயுங்கள்", bookPooja: "பூஜை பதிவு செய்யுங்கள்" } },
    temple: { bookVisit: "பார்வை பதிவு", orderPrasad: "பிரசாதம் ஆர்டர்", about: "இந்த கோயிலைப் பற்றி", significance: "முக்கியத்துவம்", history: "வரலாறு" },
    articles: { title: "வேதங்களிலிருந்து புனித கதைகள்", subtitle: "தெய்வீக ஞானம் மற்றும் கோயில் வரலாறு", from: "இருந்து", showAll: "அனைத்து {{count}} கட்டுரைகளையும் காட்டு", articleSeva: "கட்டுரை சேவை", writeArticle: "கட்டுரை எழுதுங்கள்", shareKnowledge: "பக்தர்களுடன் தெய்வீக அறிவைப் பகிர்ந்து கொள்ளுங்கள்" },
    profile: { title: "என் சுயவிவரம்", language: "விருப்ப மொழி" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)", mr: "मराठी (Marathi)", gu: "ગુજરાતી (Gujarati)", kn: "ಕನ್ನಡ (Kannada)", ml: "മലയാളം (Malayalam)", pa: "ਪੰਜਾਬੀ (Punjabi)", or: "ଓଡ଼ିଆ (Odia)", as: "অসমীয়া (Assamese)", ur: "اردو (Urdu)", sa: "संस्कृत (Sanskrit)", kok: "कोंकणी (Konkani)", mni: "মৈতৈলোন (Manipuri)" }
  },
  te: {
    nav: { temples: "దేవాలయాలు", poojas: "పూజలు", astrology: "జ్యోతిషం", priests: "పూజారులు", donate: "దానం చేయండి", home: "హోమ్", journey: "ప్రయాణం", bookings: "బుకింగ్‌లు", profile: "ప్రొఫైల్" },
    common: { signIn: "సైన్ ఇన్", signOut: "సైన్ అవుట్", bookNow: "ఇప్పుడే బుక్ చేయండి", donate: "దానం చేయండి", readMore: "మరింత చదవండి", showLess: "తక్కువ చూపించు", loading: "లోడ్ అవుతోంది...", save: "సేవ్ చేయి", cancel: "రద్దు చేయి", edit: "సవరించు", delete: "తొలగించు", search: "వెతుకు", filter: "ఫిల్టర్" },
    home: { hero: { title: "మీ ఆధ్యాత్మిక ప్రయాణం ఇక్కడ ప్రారంభమవుతుంది", subtitle: "దేవాలయాలతో కనెక్ట్ అవ్వండి, పూజలను బుక్ చేయండి, జ్యోతిష్యులను సంప్రదించండి మరియు దైవ ఆశీర్వాదాలను స్వీకరించండి", exploreTemples: "దేవాలయాలను అన్వేషించండి", bookPooja: "పూజ బుక్ చేయండి" } },
    temple: { bookVisit: "దర్శనం బుక్ చేయండి", orderPrasad: "ప్రసాదం ఆర్డర్", about: "ఈ దేవాలయం గురించి", significance: "ప్రాముఖ్యత", history: "చరిత్ర" },
    articles: { title: "శాస్త్రాల నుండి పవిత్ర కథలు", subtitle: "దైవిక జ్ఞానం మరియు దేవాలయ చరిత్ర", from: "నుండి", showAll: "అన్ని {{count}} కథనాలను చూపించు", articleSeva: "వ్యాస సేవ", writeArticle: "వ్యాసం వ్రాయండి", shareKnowledge: "భక్తులతో దైవిక జ్ఞానాన్ని పంచుకోండి" },
    profile: { title: "నా ప్రొఫైల్", language: "ఇష్టమైన భాష" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)", mr: "मराठी (Marathi)", gu: "ગુજરાતી (Gujarati)", kn: "ಕನ್ನಡ (Kannada)", ml: "മലയാളം (Malayalam)", pa: "ਪੰਜਾਬੀ (Punjabi)", or: "ଓଡ଼ିଆ (Odia)", as: "অসমীয়া (Assamese)", ur: "اردو (Urdu)", sa: "संस्कृत (Sanskrit)", kok: "कोंकणी (Konkani)", mni: "মৈতৈলোন (Manipuri)" }
  },
  bn: {
    nav: { temples: "মন্দির", poojas: "পূজা", astrology: "জ্যোতিষ", priests: "পুরোহিত", donate: "দান করুন", home: "হোম", journey: "যাত্রা", bookings: "বুকিং", profile: "প্রোফাইল" },
    common: { signIn: "সাইন ইন করুন", signOut: "সাইন আউট", bookNow: "এখনই বুক করুন", donate: "দান করুন", readMore: "আরও পড়ুন", showLess: "কম দেখান", loading: "লোড হচ্ছে...", save: "সংরক্ষণ করুন", cancel: "বাতিল করুন", edit: "সম্পাদনা", delete: "মুছুন", search: "খুঁজুন", filter: "ফিল্টার" },
    home: { hero: { title: "আপনার আধ্যাত্মিক যাত্রা এখানে শুরু হয়", subtitle: "মন্দিরের সাথে সংযুক্ত হন, পূজা বুক করুন, জ্যোতিষীদের পরামর্শ নিন এবং ঐশ্বরিক আশীর্বাদ গ্রহণ করুন", exploreTemples: "মন্দির অন্বেষণ করুন", bookPooja: "পূজা বুক করুন" } },
    temple: { bookVisit: "দর্শন বুক করুন", orderPrasad: "প্রসাদ অর্ডার", about: "এই মন্দির সম্পর্কে", significance: "তাৎপর্য", history: "ইতিহাস" },
    articles: { title: "শাস্ত্র থেকে পবিত্র গল্প", subtitle: "ঐশ্বরিক জ্ঞান এবং মন্দিরের ইতিহাস", from: "থেকে", showAll: "সব {{count}} নিবন্ধ দেখুন", articleSeva: "নিবন্ধ সেবা", writeArticle: "নিবন্ধ লিখুন", shareKnowledge: "ভক্তদের সাথে ঐশ্বরিক জ্ঞান ভাগ করুন" },
    profile: { title: "আমার প্রোফাইল", language: "পছন্দের ভাষা" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)", mr: "मराठी (Marathi)", gu: "ગુજરાતી (Gujarati)", kn: "ಕನ್ನಡ (Kannada)", ml: "മലയാളം (Malayalam)", pa: "ਪੰਜਾਬੀ (Punjabi)", or: "ଓଡ଼ିଆ (Odia)", as: "অসমীয়া (Assamese)", ur: "اردو (Urdu)", sa: "संस्कृत (Sanskrit)", kok: "कोंकणी (Konkani)", mni: "মৈতৈলোন (Manipuri)" }
  },
  mr: {
    nav: { temples: "मंदिरे", poojas: "पूजा", astrology: "ज्योतिष", priests: "पुजारी", donate: "दान करा", home: "मुख्यपृष्ठ", journey: "प्रवास", bookings: "बुकिंग", profile: "प्रोफाइल" },
    common: { signIn: "साइन इन करा", signOut: "साइन आउट करा", bookNow: "आता बुक करा", donate: "दान करा", readMore: "अधिक वाचा", showLess: "कमी दाखवा", loading: "लोड होत आहे...", save: "जतन करा", cancel: "रद्द करा", edit: "संपादित करा", delete: "हटवा", search: "शोधा", filter: "फिल्टर" },
    home: { hero: { title: "तुमचा आध्यात्मिक प्रवास येथे सुरू होतो", subtitle: "मंदिरांशी जुडा, पूजा बुक करा, ज्योतिषांचा सल्ला घ्या आणि दैवी आशीर्वाद घ्या", exploreTemples: "मंदिरे पहा", bookPooja: "पूजा बुक करा" } },
    temple: { bookVisit: "दर्शन बुक करा", orderPrasad: "प्रसाद ऑर्डर", about: "या मंदिराबद्दल", significance: "महत्त्व", history: "इतिहास" },
    articles: { title: "शास्त्रातील पवित्र कथा", subtitle: "दैवी ज्ञान आणि मंदिराचा इतिहास", from: "पासून", showAll: "सर्व {{count}} लेख दाखवा", articleSeva: "लेख सेवा", writeArticle: "लेख लिहा", shareKnowledge: "भक्तांसोबत दैवी ज्ञान शेअर करा" },
    profile: { title: "माझे प्रोफाइल", language: "पसंतीची भाषा" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)", mr: "मराठी (Marathi)", gu: "ગુજરાતી (Gujarati)", kn: "ಕನ್ನಡ (Kannada)", ml: "മലയാളം (Malayalam)", pa: "ਪੰਜਾਬੀ (Punjabi)", or: "ଓଡ଼ିଆ (Odia)", as: "অসমীয়া (Assamese)", ur: "اردو (Urdu)", sa: "संस्कृत (Sanskrit)", kok: "कोंकणी (Konkani)", mni: "মৈতৈলোন (Manipuri)" }
  },
  gu: {
    nav: { temples: "મંદિરો", poojas: "પૂજાઓ", astrology: "જ્યોતિષ", priests: "પુજારીઓ", donate: "દાન કરો", home: "હોમ", journey: "પ્રવાસ", bookings: "બુકિંગ", profile: "પ્રોફાઇલ" },
    common: { signIn: "સાઇન ઇન કરો", signOut: "સાઇન આઉટ", bookNow: "હમણાં બુક કરો", donate: "દાન કરો", readMore: "વધુ વાંચો", showLess: "ઓછું બતાવો", loading: "લોડ થઈ રહ્યું છે...", save: "સાચવો", cancel: "રદ કરો", edit: "સંપાદિત કરો", delete: "કાઢી નાખો", search: "શોધો", filter: "ફિલ્ટર" },
    home: { hero: { title: "તમારી આધ્યાત્મિક યાત્રા અહીંથી શરૂ થાય છે", subtitle: "મંદિરો સાથે જોડાઓ, પૂજા બુક કરો, જ્યોતિષીઓની સલાહ લો અને દૈવી આશીર્વાદ મેળવો", exploreTemples: "મંદિરો જુઓ", bookPooja: "પૂજા બુક કરો" } },
    temple: { bookVisit: "દર્શન બુક કરો", orderPrasad: "પ્રસાદ ઓર્ડર", about: "આ મંદિર વિશે", significance: "મહત્વ", history: "ઇતિહાસ" },
    articles: { title: "શાસ્ત્રોમાંથી પવિત્ર કથાઓ", subtitle: "દૈવી જ્ઞાન અને મંદિરનો ઇતિહાસ", from: "થી", showAll: "બધા {{count}} લેખો બતાવો", articleSeva: "લેખ સેવા", writeArticle: "લેખ લખો", shareKnowledge: "ભક્તો સાથે દૈવી જ્ઞાન શેર કરો" },
    profile: { title: "મારી પ્રોફાઇલ", language: "પસંદગીની ભાષા" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)", mr: "मराठी (Marathi)", gu: "ગુજરાતી (Gujarati)", kn: "ಕನ್ನಡ (Kannada)", ml: "മലയാളം (Malayalam)", pa: "ਪੰਜਾਬੀ (Punjabi)", or: "ଓଡ଼ିଆ (Odia)", as: "অসমীয়া (Assamese)", ur: "اردو (Urdu)", sa: "संस्कृत (Sanskrit)", kok: "कोंकणी (Konkani)", mni: "মৈতৈলোন (Manipuri)" }
  },
  kn: {
    nav: { temples: "ದೇವಸ್ಥಾನಗಳು", poojas: "ಪೂಜೆಗಳು", astrology: "ಜ್ಯೋತಿಷ್ಯ", priests: "ಪುರೋಹಿತರು", donate: "ದಾನ ಮಾಡಿ", home: "ಮುಖಪುಟ", journey: "ಪ್ರಯಾಣ", bookings: "ಬುಕ್ಕಿಂಗ್", profile: "ಪ್ರೊಫೈಲ್" },
    common: { signIn: "ಸೈನ್ ಇನ್", signOut: "ಸೈನ್ ಔಟ್", bookNow: "ಈಗ ಬುಕ್ ಮಾಡಿ", donate: "ದಾನ ಮಾಡಿ", readMore: "ಹೆಚ್ಚು ಓದಿ", showLess: "ಕಡಿಮೆ ತೋರಿಸಿ", loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...", save: "ಉಳಿಸಿ", cancel: "ರದ್ದುಮಾಡಿ", edit: "ಸಂಪಾದಿಸಿ", delete: "ಅಳಿಸಿ", search: "ಹುಡುಕಿ", filter: "ಫಿಲ್ಟರ್" },
    home: { hero: { title: "ನಿಮ್ಮ ಆಧ್ಯಾತ್ಮಿಕ ಪ್ರಯಾಣ ಇಲ್ಲಿ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ", subtitle: "ದೇವಾಲಯಗಳೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ, ಪೂಜೆಗಳನ್ನು ಬುಕ್ ಮಾಡಿ, ಜ್ಯೋತಿಷಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ ಮತ್ತು ದೈವಿಕ ಆಶೀರ್ವಾದಗಳನ್ನು ಪಡೆಯಿರಿ", exploreTemples: "ದೇವಸ್ಥಾನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ", bookPooja: "ಪೂಜೆ ಬುಕ್ ಮಾಡಿ" } },
    temple: { bookVisit: "ದರ್ಶನ ಬುಕ್ ಮಾಡಿ", orderPrasad: "ಪ್ರಸಾದ ಆರ್ಡರ್", about: "ಈ ದೇವಾಲಯದ ಬಗ್ಗೆ", significance: "ಮಹತ್ವ", history: "ಇತಿಹಾಸ" },
    articles: { title: "ಶಾಸ್ತ್ರಗಳಿಂದ ಪವಿತ್ರ ಕಥೆಗಳು", subtitle: "ದೈವಿಕ ಜ್ಞಾನ ಮತ್ತು ದೇವಾಲಯದ ಇತಿಹಾಸ", from: "ನಿಂದ", showAll: "ಎಲ್ಲಾ {{count}} ಲೇಖನಗಳನ್ನು ತೋರಿಸಿ", articleSeva: "ಲೇಖನ ಸೇವೆ", writeArticle: "ಲೇಖನ ಬರೆಯಿರಿ", shareKnowledge: "ಭಕ್ತರೊಂದಿಗೆ ದೈವಿಕ ಜ್ಞಾನವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ" },
    profile: { title: "ನನ್ನ ಪ್ರೊಫೈಲ್", language: "ಆದ್ಯತೆಯ ಭಾಷೆ" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)", mr: "मराठी (Marathi)", gu: "ગુજરાતી (Gujarati)", kn: "ಕನ್ನಡ (Kannada)", ml: "മലയാളം (Malayalam)", pa: "ਪੰਜਾਬੀ (Punjabi)", or: "ଓଡ଼ିଆ (Odia)", as: "অসমীয়া (Assamese)", ur: "اردو (Urdu)", sa: "संस्कृत (Sanskrit)", kok: "कोंकणी (Konkani)", mni: "মৈতৈলোন (Manipuri)" }
  },
  ml: {
    nav: { temples: "ക്ഷേത്രങ്ങൾ", poojas: "പൂജകൾ", astrology: "ജ്യോതിഷം", priests: "പുരോഹിതന്മാർ", donate: "സംഭാവന", home: "ഹോം", journey: "യാത്ര", bookings: "ബുക്കിംഗുകൾ", profile: "പ്രൊഫൈൽ" },
    common: { signIn: "സൈൻ ഇൻ", signOut: "സൈൻ ഔട്ട്", bookNow: "ഇപ്പോൾ ബുക്ക് ചെയ്യുക", donate: "സംഭാവന നൽകുക", readMore: "കൂടുതൽ വായിക്കുക", showLess: "കുറച്ച് കാണിക്കുക", loading: "ലോഡ് ചെയ്യുന്നു...", save: "സൂക്ഷിക്കുക", cancel: "റദ്ദാക്കുക", edit: "എഡിറ്റ് ചെയ്യുക", delete: "ഇല്ലാതാക്കുക", search: "തിരയുക", filter: "ഫിൽട്ടർ" },
    home: { hero: { title: "നിങ്ങളുടെ ആത്മീയ യാത്ര ഇവിടെ ആരംഭിക്കുന്നു", subtitle: "ക്ഷേത്രങ്ങളുമായി ബന്ധപ്പെടുക, പൂജകൾ ബുക്ക് ചെയ്യുക, ജ്യോതിഷികളെ കാണുക, ദൈവാനുഗ്രഹങ്ങൾ നേടുക", exploreTemples: "ക്ഷേത്രങ്ങൾ കാണുക", bookPooja: "പൂജ ബുക്ക് ചെയ്യുക" } },
    temple: { bookVisit: "ദർശനം ബുക്ക് ചെയ്യുക", orderPrasad: "പ്രസാദം ഓർഡർ", about: "ഈ ക്ഷേത്രത്തെക്കുറിച്ച്", significance: "പ്രാധാന്യം", history: "ചരിത്രം" },
    articles: { title: "ശാസ്ത്രങ്ങളിൽ നിന്നുള്ള വിശുദ്ധ കഥകൾ", subtitle: "ദിവ്യ ജ്ഞാനവും ക്ഷേത്ര ചരിത്രവും", from: "നിന്ന്", showAll: "എല്ലാ {{count}} ലേഖനങ്ങളും കാണിക്കുക", articleSeva: "ലേഖന സേവനം", writeArticle: "ലേഖനം എഴുതുക", shareKnowledge: "ഭക്തരുമായി ദിവ്യ ജ്ഞാനം പങ്കിടുക" },
    profile: { title: "എന്റെ പ്രൊഫൈൽ", language: "ഇഷ്ടമുള്ള ഭാഷ" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)", mr: "मराठी (Marathi)", gu: "ગુજરાતી (Gujarati)", kn: "ಕನ್ನಡ (Kannada)", ml: "മലയാളം (Malayalam)", pa: "ਪੰਜਾਬੀ (Punjabi)", or: "ଓଡ଼ିଆ (Odia)", as: "অসমীয়া (Assamese)", ur: "اردو (Urdu)", sa: "संस्कृत (Sanskrit)", kok: "कोंकणी (Konkani)", mni: "মৈতৈলোন (Manipuri)" }
  },
  pa: {
    nav: { temples: "ਮੰਦਰ", poojas: "ਪੂਜਾ", astrology: "ਜੋਤਿਸ਼", priests: "ਪੁਜਾਰੀ", donate: "ਦਾਨ ਕਰੋ", home: "ਹੋਮ", journey: "ਯਾਤਰਾ", bookings: "ਬੁਕਿੰਗ", profile: "ਪ੍ਰੋਫਾਇਲ" },
    common: { signIn: "ਸਾਇਨ ਇਨ ਕਰੋ", signOut: "ਸਾਇਨ ਆਉਟ", bookNow: "ਹੁਣੇ ਬੁੱਕ ਕਰੋ", donate: "ਦਾਨ ਕਰੋ", readMore: "ਹੋਰ ਪੜ੍ਹੋ", showLess: "ਘੱਟ ਦਿਖਾਓ", loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...", save: "ਸੇਵ ਕਰੋ", cancel: "ਰੱਦ ਕਰੋ", edit: "ਸੋਧੋ", delete: "ਮਿਟਾਓ", search: "ਖੋਜੋ", filter: "ਫਿਲਟਰ" },
    home: { hero: { title: "ਤੁਹਾਡੀ ਅਧਿਆਤਮਿਕ ਯਾਤਰਾ ਇੱਥੇ ਸ਼ੁਰੂ ਹੁੰਦੀ ਹੈ", subtitle: "ਮੰਦਰਾਂ ਨਾਲ ਜੁੜੋ, ਪੂਜਾ ਬੁੱਕ ਕਰੋ, ਜੋਤਿਸ਼ੀਆਂ ਨੂੰ ਮਿਲੋ ਅਤੇ ਦਿਵੈ ਅਸੀਸ ਪ੍ਰਾਪਤ ਕਰੋ", exploreTemples: "ਮੰਦਰ ਦੇਖੋ", bookPooja: "ਪੂਜਾ ਬੁੱਕ ਕਰੋ" } },
    temple: { bookVisit: "ਦਰਸ਼ਨ ਬੁੱਕ ਕਰੋ", orderPrasad: "ਪ੍ਰਸਾਦ ਆਰਡਰ", about: "ਇਸ ਮੰਦਰ ਬਾਰੇ", significance: "ਮਹੱਤਤਾ", history: "ਇਤਿਹਾਸ" },
    articles: { title: "ਸ਼ਾਸਤਰਾਂ ਤੋਂ ਪਵਿੱਤਰ ਕਹਾਣੀਆਂ", subtitle: "ਦਿਵੈ ਗਿਆਨ ਅਤੇ ਮੰਦਰ ਇਤਿਹਾਸ", from: "ਤੋਂ", showAll: "ਸਾਰੇ {{count}} ਲੇਖ ਦਿਖਾਓ", articleSeva: "ਲੇਖ ਸੇਵਾ", writeArticle: "ਲੇਖ ਲਿਖੋ", shareKnowledge: "ਭਗਤਾਂ ਨਾਲ ਦਿਵੈ ਗਿਆਨ ਸਾਂਝਾ ਕਰੋ" },
    profile: { title: "ਮੇਰੀ ਪ੍ਰੋਫਾਇਲ", language: "ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)", mr: "मराठी (Marathi)", gu: "ગુજરાતી (Gujarati)", kn: "ಕನ್ನಡ (Kannada)", ml: "മലയാളം (Malayalam)", pa: "ਪੰਜਾਬੀ (Punjabi)", or: "ଓଡ଼ିଆ (Odia)", as: "অসমীয়া (Assamese)", ur: "اردو (Urdu)", sa: "संस्कृत (Sanskrit)", kok: "कोंकणी (Konkani)", mni: "মৈতৈলোন (Manipuri)" }
  },
  or: {
    nav: { temples: "ମନ୍ଦିର", poojas: "ପୂଜା", astrology: "ଜ୍ୟୋତିଷ", priests: "ପୁରୋହିତ", donate: "ଦାନ କରନ୍ତୁ", home: "ହୋମ", journey: "ଯାତ୍ରା", bookings: "ବୁକିଂ", profile: "ପ୍ରୋଫାଇଲ୍" },
    common: { signIn: "ସାଇନ୍ ଇନ୍", signOut: "ସାଇନ୍ ଆଉଟ୍", bookNow: "ବର୍ତ୍ତମାନ ବୁକ୍ କରନ୍ତୁ", donate: "ଦାନ କରନ୍ତୁ", readMore: "ଅଧିକ ପଢନ୍ତୁ", showLess: "କମ୍ ଦେଖାନ୍ତୁ", loading: "ଲୋଡ୍ ହେଉଛି...", save: "ସେଭ୍ କରନ୍ତୁ", cancel: "ବାତିଲ୍ କରନ୍ତୁ", edit: "ସମ୍ପାଦନା", delete: "ଡିଲିଟ୍", search: "ସର୍ଚ୍ଚ", filter: "ଫିଲ୍ଟର" },
    home: { hero: { title: "ଆପଣଙ୍କର ଆଧ୍ୟାତ୍ମିକ ଯାତ୍ରା ଏଠାରୁ ଆରମ୍ଭ ହୁଏ", subtitle: "ମନ୍ଦିରମାନଙ୍କ ସହିତ ସଂଯୋଗ କରନ୍ତୁ, ପୂଜା ବୁକ୍ କରନ୍ତୁ, ଜ୍ୟୋତିଷୀମାନଙ୍କୁ ପରାମର୍ଶ କରନ୍ତୁ ଏବଂ ଦୈବୀ ଆଶୀର୍ବାଦ ଗ୍ରହଣ କରନ୍ତୁ", exploreTemples: "ମନ୍ଦିର ଅନ୍ୱେଷଣ", bookPooja: "ପୂଜା ବୁକ୍ କରନ୍ତୁ" } },
    temple: { bookVisit: "ଦର୍ଶନ ବୁକ୍", orderPrasad: "ପ୍ରସାଦ ଅର୍ଡର୍", about: "ଏହି ମନ୍ଦିର ବିଷୟରେ", significance: "ମହତ୍ତ୍ୱ", history: "ଇତିହାସ" },
    articles: { title: "ଶାସ୍ତ୍ରରୁ ପବିତ୍ର କାହାଣୀ", subtitle: "ଦୈବୀ ଜ୍ଞାନ ଏବଂ ମନ୍ଦିର ଇତିହାସ", from: "ରୁ", showAll: "ସମସ୍ତ {{count}} ପ୍ରବନ୍ଧ ଦେଖନ୍ତୁ", articleSeva: "ପ୍ରବନ୍ଧ ସେବା", writeArticle: "ପ୍ରବନ୍ଧ ଲେଖନ୍ତୁ", shareKnowledge: "ଭକ୍ତମାନଙ୍କ ସହିତ ଦୈବୀ ଜ୍ଞାନ ଅଂଶୀଦାର କରନ୍ତୁ" },
    profile: { title: "ମୋର ପ୍ରୋଫାଇଲ୍", language: "ପସନ୍ଦର ଭାଷା" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)", mr: "मराठी (Marathi)", gu: "ગુજરાતી (Gujarati)", kn: "ಕನ್ನಡ (Kannada)", ml: "മലയാളം (Malayalam)", pa: "ਪੰਜਾਬੀ (Punjabi)", or: "ଓଡ଼ିଆ (Odia)", as: "অসমীয়া (Assamese)", ur: "اردو (Urdu)", sa: "संस्कृत (Sanskrit)", kok: "कोंकणी (Konkani)", mni: "মৈতৈলোন (Manipuri)" }
  },
  as: {
    nav: { temples: "মন্দিৰ", poojas: "পূজা", astrology: "জ্যোতিষ", priests: "পুৰোহিত", donate: "দান কৰক", home: "হ'ম", journey: "যাত্ৰা", bookings: "বুকিং", profile: "প্ৰ'ফাইল" },
    common: { signIn: "চাইন ইন কৰক", signOut: "চাইন আউট", bookNow: "এতিয়াই বুক কৰক", donate: "দান কৰক", readMore: "অধিক পঢ়ক", showLess: "কম দেখুৱাওক", loading: "ল'ড হৈ আছে...", save: "ছেভ কৰক", cancel: "বাতিল কৰক", edit: "সম্পাদনা", delete: "মচক", search: "সন্ধান কৰক", filter: "ফিল্টাৰ" },
    home: { hero: { title: "আপোনাৰ আধ্যাত্মিক যাত্ৰা ইয়াতে আৰম্ভ হয়", subtitle: "মন্দিৰৰ সৈতে সংযোগ স্থাপন কৰক, পূজা বুক কৰক, জ্যোতিষীসকলৰ পৰামৰ্শ লওক আৰু ঐশ্বৰিক আশীৰ্বাদ গ্ৰহণ কৰক", exploreTemples: "মন্দিৰ অন্বেষণ", bookPooja: "পূজা বুক কৰক" } },
    temple: { bookVisit: "দৰ্শন বুক কৰক", orderPrasad: "প্ৰসাদ অৰ্ডাৰ", about: "এই মন্দিৰৰ বিষয়ে", significance: "মহত্ব", history: "ইতিহাস" },
    articles: { title: "শাস্ত্ৰৰ পৰা পবিত্ৰ কাহিনী", subtitle: "ঐশ্বৰিক জ্ঞান আৰু মন্দিৰৰ ইতিহাস", from: "পৰা", showAll: "সকলো {{count}} প্ৰবন্ধ দেখুৱাওক", articleSeva: "প্ৰবন্ধ সেৱা", writeArticle: "প্ৰবন্ধ লিখক", shareKnowledge: "ভক্তসকলৰ সৈতে ঐশ্বৰিক জ্ঞান ভাগ কৰক" },
    profile: { title: "মোৰ প্ৰ'ফাইল", language: "পছন্দৰ ভাষা" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)", mr: "मराठी (Marathi)", gu: "ગુજરાતી (Gujarati)", kn: "ಕನ್ನಡ (Kannada)", ml: "മലയാളം (Malayalam)", pa: "ਪੰਜਾਬੀ (Punjabi)", or: "ଓଡ଼ିଆ (Odia)", as: "অসমীয়া (Assamese)", ur: "اردو (Urdu)", sa: "संस्कृत (Sanskrit)", kok: "कोंकणी (Konkani)", mni: "মৈতৈলোন (Manipuri)" }
  },
  ur: {
    nav: { temples: "مندر", poojas: "پوجا", astrology: "علم نجوم", priests: "پجاری", donate: "عطیہ دیں", home: "ہوم", journey: "سفر", bookings: "بکنگ", profile: "پروفائل" },
    common: { signIn: "سائن ان کریں", signOut: "سائن آؤٹ", bookNow: "ابھی بک کریں", donate: "عطیہ دیں", readMore: "مزید پڑھیں", showLess: "کم دکھائیں", loading: "لوڈ ہو رہا ہے...", save: "محفوظ کریں", cancel: "منسوخ کریں", edit: "ترمیم", delete: "حذف کریں", search: "تلاش کریں", filter: "فلٹر" },
    home: { hero: { title: "آپ کا روحانی سفر یہاں سے شروع ہوتا ہے", subtitle: "مندروں سے جڑیں، پوجا بک کریں، نجومیوں سے مشورہ لیں اور الہی برکتیں حاصل کریں", exploreTemples: "مندر دیکھیں", bookPooja: "پوجا بک کریں" } },
    temple: { bookVisit: "دیدار بک کریں", orderPrasad: "پرساد آرڈر", about: "اس مندر کے بارے میں", significance: "اہمیت", history: "تاریخ" },
    articles: { title: "صحائف سے مقدس کہانیاں", subtitle: "الہی علم اور مندر کی تاریخ", from: "سے", showAll: "تمام {{count}} مضامین دکھائیں", articleSeva: "مضمون سیوا", writeArticle: "مضمون لکھیں", shareKnowledge: "بھگتوں کے ساتھ الہی علم شیئر کریں" },
    profile: { title: "میری پروفائل", language: "ترجیحی زبان" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)", mr: "मराठी (Marathi)", gu: "ગુજરાતી (Gujarati)", kn: "ಕನ್ನಡ (Kannada)", ml: "മലയാളം (Malayalam)", pa: "ਪੰਜਾਬੀ (Punjabi)", or: "ଓଡ଼ିଆ (Odia)", as: "অসমীয়া (Assamese)", ur: "اردو (Urdu)", sa: "संस्कृत (Sanskrit)", kok: "कोंकणी (Konkani)", mni: "মৈতৈলোন (Manipuri)" }
  },
  sa: {
    nav: { temples: "मन्दिराणि", poojas: "पूजाः", astrology: "ज्योतिषम्", priests: "पुरोहिताः", donate: "दानं कुर्वन्तु", home: "गृहम्", journey: "यात्रा", bookings: "आरक्षणम्", profile: "विवरणपत्रम्" },
    common: { signIn: "प्रवेशं कुर्वन्तु", signOut: "निर्गमनम्", bookNow: "सम्प्रति आरक्षयन्तु", donate: "दानं कुर्वन्तु", readMore: "अधिकं पठन्तु", showLess: "अल्पं दर्शयन्तु", loading: "आरोपयति...", save: "रक्षन्तु", cancel: "निवारयन्तु", edit: "सम्पादनम्", delete: "नश्यन्तु", search: "अन्वेषणम्", filter: "निस्यन्दकः" },
    home: { hero: { title: "भवतः आध्यात्मिकी यात्रा अत्र आरभते", subtitle: "मन्दिरैः सह संयोगं कुर्वन्तु, पूजां आरक्षयन्तु, ज्योतिषिभिः सह परामर्शं कुर्वन्तु च दैवी आशीर्वादं स्वीकुर्वन्तु", exploreTemples: "मन्दिराणि अन्वेषयन्तु", bookPooja: "पूजां आरक्षयन्तु" } },
    temple: { bookVisit: "दर्शनं आरक्षयन्तु", orderPrasad: "प्रसादम् आदिशन्तु", about: "अस्मिन् मन्दिरे विषये", significance: "महत्त्वम्", history: "इतिहासः" },
    articles: { title: "शास्त्रेभ्यः पवित्राणि कथाः", subtitle: "दैवी ज्ञानं मन्दिरस्य इतिहासश्च", from: "तः", showAll: "सर्वाणि {{count}} लेखाः दर्शयन्तु", articleSeva: "लेख सेवा", writeArticle: "लेखं लिखन्तु", shareKnowledge: "भक्तैः सह दैवीं ज्ञानं विभजन्तु" },
    profile: { title: "मम विवरणपत्रम्", language: "रोचिता भाषा" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)", mr: "मराठी (Marathi)", gu: "ગુજરાતી (Gujarati)", kn: "ಕನ್ನಡ (Kannada)", ml: "മലയാളം (Malayalam)", pa: "ਪੰਜਾਬੀ (Punjabi)", or: "ଓଡ଼ିଆ (Odia)", as: "অসমীয়া (Assamese)", ur: "اردو (Urdu)", sa: "संस्कृत (Sanskrit)", kok: "कोंकणी (Konkani)", mni: "মৈতৈলোন (Manipuri)" }
  },
  kok: {
    nav: { temples: "देवूळां", poojas: "पूजा", astrology: "ज्योतिष", priests: "पुजारी", donate: "दान करा", home: "घर", journey: "प्रवास", bookings: "बुकिंग", profile: "प्रोफाइल" },
    common: { signIn: "साइन इन करा", signOut: "साइन आउट", bookNow: "आतां बुक करा", donate: "दान करा", readMore: "चड वाचा", showLess: "उणें दाखोवचें", loading: "लोड जाता...", save: "सांठोवचें", cancel: "रद्द करा", edit: "संपादन", delete: "काडून उडोवचें", search: "सोदा", filter: "फिल्टर" },
    home: { hero: { title: "तुमचो आध्यात्मिक प्रवास हांगा सुरू जाता", subtitle: "देवळांकडेन जोडा, पूजा बुक करा, ज्योतिषांचो सल्लो घेवचो आनी दैवी आशिर्वाद घेवचो", exploreTemples: "देवूळां पळेवचीं", bookPooja: "पूजा बुक करा" } },
    temple: { bookVisit: "दर्शन बुक करा", orderPrasad: "प्रसाद ऑर्डर", about: "ह्या देवळा विशीं", significance: "महत्व", history: "इतिहास" },
    articles: { title: "शास्त्रांतल्यान पवित्र कथा", subtitle: "दैवी गिन्यान आनी देवळाचो इतिहास", from: "थावन", showAll: "सगळे {{count}} लेख दाखोवचे", articleSeva: "लेख सेवा", writeArticle: "लेख बरोवचो", shareKnowledge: "भक्तांकडेन दैवी गिन्यान वांटचें" },
    profile: { title: "म्हजो प्रोफाइल", language: "आवडीची भास" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)", mr: "मराठी (Marathi)", gu: "ગુજરાતી (Gujarati)", kn: "ಕನ್ನಡ (Kannada)", ml: "മലയാളം (Malayalam)", pa: "ਪੰਜਾਬੀ (Punjabi)", or: "ଓଡ଼ିଆ (Odia)", as: "অসমীয়া (Assamese)", ur: "اردو (Urdu)", sa: "संस्कृत (Sanskrit)", kok: "कोंकणी (Konkani)", mni: "মৈতৈলোন (Manipuri)" }
  },
  mni: {
    nav: { temples: "লাইশং", poojas: "পূজা", astrology: "জ্যোতিষ", priests: "পুরোহিত", donate: "দান দিয়ু", home: "হোম", journey: "লম্বি", bookings: "বুকিং", profile: "প্রোফাইল" },
    common: { signIn: "সাইন ইন তৌবিরো", signOut: "সাইন আউট", bookNow: "হৌজিক বুক তৌবিরো", donate: "দান দিয়ু", readMore: "অদুম পরবি", showLess: "মখোয়না উৎপি", loading: "লোড তৌরি...", save: "সেভ তৌবিরো", cancel: "কাংশিন্দুনা থাদোক", edit: "শেমদোক", delete: "লোথোক", search: "থীবিরো", filter: "ফিল্টর" },
    home: { hero: { title: "নহাক্কী স্পিরিচুয়েল লম্বি মসিদা হৌবি", subtitle: "লাইশং খুদিংমক্তা মরি লৈনবা, পূজা বুক তৌবিরো, জোতিশশিংদা পাউ থোক্পিরো অমসুং দিভাইন খ়ুদোংথিবা ফংবিরো", exploreTemples: "লাইশংশিং য়েংবিরো", bookPooja: "পূজা বুক তৌবিরো" } },
    temple: { bookVisit: "দরশন বুক তৌবিরো", orderPrasad: "প্রসাদ অর্ডর তৌবিরো", about: "মসিগী লাইশংগী মরমদা", significance: "মহত্ত্ব", history: "ইতিহাস" },
    articles: { title: "শাস্ত্রদগী পবিত্র কথাশিং", subtitle: "দিভাইন নিংথিজবা অমসুং লাইশংগী ইতিহাস", from: "দগী", showAll: "পুম্বা {{count}} আর্টিকেল উৎপিরো", articleSeva: "আর্টিকেল সেবা", writeArticle: "আর্টিকেল ইবিরো", shareKnowledge: "ভক্তশিংদা দিভাইন নিংথিজবা শেয়ার তৌবিরো" },
    profile: { title: "ঐগী প্রোফাইল", language: "পাম্বিবা লোল" },
    languages: { en: "English", hi: "हिन्दी (Hindi)", ta: "தமிழ் (Tamil)", te: "తెలుగు (Telugu)", bn: "বাংলা (Bengali)", mr: "मराठी (Marathi)", gu: "ગુજરાતી (Gujarati)", kn: "ಕನ್ನಡ (Kannada)", ml: "മലയാളം (Malayalam)", pa: "ਪੰਜਾਬੀ (Punjabi)", or: "ଓଡ଼ିଆ (Odia)", as: "অসমীয়া (Assamese)", ur: "اردو (Urdu)", sa: "संस्कृत (Sanskrit)", kok: "कोंकणी (Konkani)", mni: "মৈতৈলোন (Manipuri)" }
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