/**
 * I18N Multilingual Platform Service for Travel Planet (Voyage8)
 * Conforms to §20 (20_I18N_MULTILINGUAL_PLATFORM.md)
 * Canonical Locales: en-IN (English - India), ml-IN (Malayalam), hi-IN (Hindi)
 */

export type CanonicalLocale = 'en-IN' | 'ml-IN' | 'hi-IN';

export interface LocaleMetadata {
  code: CanonicalLocale;
  name: string;
  nativeName: string;
  currency: string;
  currencySymbol: string;
  direction: 'ltr' | 'rtl';
}

export const CANONICAL_LOCALES: Record<CanonicalLocale, LocaleMetadata> = {
  'en-IN': {
    code: 'en-IN',
    name: 'English (India)',
    nativeName: 'English',
    currency: 'INR',
    currencySymbol: '₹',
    direction: 'ltr',
  },
  'ml-IN': {
    code: 'ml-IN',
    name: 'Malayalam (Kerala)',
    nativeName: 'മലയാളം',
    currency: 'INR',
    currencySymbol: '₹',
    direction: 'ltr',
  },
  'hi-IN': {
    code: 'hi-IN',
    name: 'Hindi (India)',
    nativeName: 'हिन्दी',
    currency: 'INR',
    currencySymbol: '₹',
    direction: 'ltr',
  },
};

export const TRANSLATION_DICTIONARY: Record<CanonicalLocale, Record<string, string>> = {
  'en-IN': {
    'nav.destinations': 'Destinations',
    'nav.packages': 'Trips & Packages',
    'nav.circles': 'Social Circles',
    'nav.gems': 'Beyond The Icon',
    'nav.planner': 'AI Trip Planner',
    'nav.leads': 'CRM Leads',
    'nav.admin': 'SaaS Control Plane',
    'nav.help': 'Help & Tours',
    'hero.badge': 'The Cognitive Travel Operating System',
    'hero.title': 'Travel Planning Reimagined with Voyage8',
    'hero.subtitle': 'Autonomous itinerary synthesis, verified high-resolution photography, and double-entry financial governance.',
    'planner.title': 'Don\'t know where to go?',
    'planner.subtitle': 'Tell us what you\'re looking for. Travel Planet turns your preferences into a complete journey.',
    'planner.build': 'Build My Trip',
    'planner.synthesizing': 'Synthesizing with NVIDIA NIM...',
    'voice.title': 'Voice AI Navigator (VN8/VO8)',
    'voice.listening': 'Listening for travel intent...',
    'voice.speak': 'Speak a command (English, Malayalam, Hindi)',
    'common.currency': '₹',
    'common.search': 'Search destinations...',
  },
  'ml-IN': {
    'nav.destinations': 'ലക്ഷ്യസ്ഥാനങ്ങൾ',
    'nav.packages': 'യാത്രാ പാക്കേജുകൾ',
    'nav.circles': 'ട്രാവൽ സർക്കിളുകൾ',
    'nav.gems': 'മറഞ്ഞിരിക്കുന്ന രത്നങ്ങൾ (GEM8)',
    'nav.planner': 'എഐ യാത്രാ പ്ലാനർ',
    'nav.leads': 'സിആർഎം ലീഡുകൾ',
    'nav.admin': 'അഡ്മിൻ കൺട്രോൾ',
    'nav.help': 'സഹായവും ടൂറുകളും',
    'hero.badge': 'കോഗ്നിറ്റീവ് ട്രാവൽ ഓപ്പറേറ്റിംഗ് സിസ്റ്റം',
    'hero.title': 'വോയേജ്8 ഉപയോഗിച്ച് യാത്രകൾ പ്ലാൻ ചെയ്യാം',
    'hero.subtitle': 'ഓട്ടോണമസ് യാത്രാ നിർമ്മാണം, ഉയർന്ന ഗുണമേന്മയുള്ള ഫോട്ടോകൾ, ഫിനാൻഷ്യൽ ലെഡ്ജർ.',
    'planner.title': 'എവിടെ പോകണമെന്ന് തീരുമാനിച്ചില്ലേ?',
    'planner.subtitle': 'നിങ്ങളുടെ ആഗ്രഹങ്ങൾ പങ്കുവെക്കൂ. ട്രാവൽ പ്ലാനറ്റ് അത് മനോഹരമായൊരു യാത്രയാക്കി മാറ്റുന്നു.',
    'planner.build': 'യാത്ര പ്ലാൻ ചെയ്യുക',
    'planner.synthesizing': 'എൻവിഡിയ എൻഐഎം വഴി പ്ലാൻ ചെയ്യുന്നു...',
    'voice.title': 'വോയ്‌സ് എഐ നാവിഗേറ്റർ (VN8/VO8)',
    'voice.listening': 'ശ്രദ്ധിക്കുന്നു...',
    'voice.speak': 'ഒരു കമാൻഡ് പറയുക (മലയാളം, ഇംഗ്ലീഷ്, ഹിന്ദി)',
    'common.currency': '₹',
    'common.search': 'ലക്ഷ്യസ്ഥാനങ്ങൾ തിരയുക...',
  },
  'hi-IN': {
    'nav.destinations': 'गंतव्य स्थल',
    'nav.packages': 'यात्रा पैकेज',
    'nav.circles': 'सोशल सर्कल्स',
    'nav.gems': 'बियॉन्ड द आइकॉन (GEM8)',
    'nav.planner': 'एआई ट्रिप प्लानर',
    'nav.leads': 'सीआरएम लीड्स',
    'nav.admin': 'एडमिन कंट्रोल प्लेन',
    'nav.help': 'सहायता और टूर्स',
    'hero.badge': 'कॉग्निटिव ट्रैवल ऑपरेटिंग सिस्टम',
    'hero.title': 'Voyage8 के साथ अपनी यात्रा की योजना बनाएं',
    'hero.subtitle': 'ऑटोनॉमस यात्रा निर्माण, उच्च-रिज़ॉल्यूशन फोटोग्राफी और सटीक वित्तीय लेजर।',
    'planner.title': 'कहाँ जाना है तय नहीं कर पा रहे?',
    'planner.subtitle': 'हमें अपनी पसंद बताएं। ट्रैवल प्लैनेट आपकी पसंद को एक संपूर्ण यात्रा में बदल देगा।',
    'planner.build': 'मेरी ट्रिप बनाएं',
    'planner.synthesizing': 'एनवीडिया एनआईएम द्वारा तैयार किया जा रहा है...',
    'voice.title': 'वॉयस एआई नेविगेटर (VN8/VO8)',
    'voice.listening': 'सुन रहा है...',
    'voice.speak': 'कमांड बोलें (हिन्दी, अंग्रेज़ी, मलयालम)',
    'common.currency': '₹',
    'common.search': 'गंतव्य खोजें...',
  },
};

export class I18nService {
  /**
   * Translate a key for a given locale with fallback to English
   */
  static translate(key: string, locale: CanonicalLocale = 'en-IN'): string {
    const dict = TRANSLATION_DICTIONARY[locale] || TRANSLATION_DICTIONARY['en-IN'];
    return dict[key] || TRANSLATION_DICTIONARY['en-IN'][key] || key;
  }

  /**
   * Format currency according to Indian / international financial standards
   */
  static formatCurrency(amount: number, locale: CanonicalLocale = 'en-IN', currency: string = 'INR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format a date according to locale conventions
   */
  static formatDate(date: Date | string, locale: CanonicalLocale = 'en-IN'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  }
}
