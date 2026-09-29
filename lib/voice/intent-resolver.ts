import { VoiceRiskLevel, VoiceCommandType } from '@prisma/client';

export interface GovernedVoiceIntent {
  intentKey: string;
  commandType: VoiceCommandType;
  phrases: string[];
  locales: string[];
  targetRoute?: string;
  governedFunction?: string;
  requiredRole?: string;
  riskLevel: VoiceRiskLevel;
  requiresConfirmation: boolean;
  actionTitle: string;
  actionDescription: string;
}

export const GOVERNED_VOICE_INTENTS: GovernedVoiceIntent[] = [
  // --- Voice Navigation (VN8) ---
  {
    intentKey: 'NAV_CIRCLES',
    commandType: VoiceCommandType.NAVIGATION,
    phrases: ['open circles', 'show circles', 'travel circles', 'community', 'യാത്ര കമ്മ്യൂണിറ്റി', 'कम्युनिटी खोलो'],
    locales: ['en-IN', 'ml-IN', 'hi-IN'],
    targetRoute: '/circles',
    riskLevel: VoiceRiskLevel.LOW,
    requiresConfirmation: false,
    actionTitle: 'Navigate to Social8 Circles',
    actionDescription: 'Opens travel circles and community group journeys.',
  },
  {
    intentKey: 'NAV_PLANNER',
    commandType: VoiceCommandType.NAVIGATION,
    phrases: ['plan my trip', 'ai planner', 'create itinerary', 'trip planner', 'പുതിയ യാത്ര പ്ലാൻ', 'ट्रिप प्लानर'],
    locales: ['en-IN', 'ml-IN', 'hi-IN'],
    targetRoute: '/trip-planner',
    riskLevel: VoiceRiskLevel.LOW,
    requiresConfirmation: false,
    actionTitle: 'Launch AI Trip Planner',
    actionDescription: 'Opens the Voyage8 AI itinerary synthesis engine.',
  },
  {
    intentKey: 'NAV_CRM_LEADS',
    commandType: VoiceCommandType.NAVIGATION,
    phrases: ['open leads', 'show leads', 'crm leads', 'customer enquiries', 'ലീഡുകൾ കാണിക്കുക', 'लीड्स दिखाओ'],
    locales: ['en-IN', 'ml-IN', 'hi-IN'],
    targetRoute: '/crm/leads',
    requiredRole: 'TRAVEL_AGENT',
    riskLevel: VoiceRiskLevel.LOW,
    requiresConfirmation: false,
    actionTitle: 'Navigate to CRM Leads',
    actionDescription: 'Opens the sales lead queue and enquiry board.',
  },
  {
    intentKey: 'NAV_FINANCE',
    commandType: VoiceCommandType.NAVIGATION,
    phrases: ['open finance', 'general ledger', 'accounting', 'ledger entries', 'അക്കൗണ്ടിംഗ്', 'फाइनेंस लेजर'],
    locales: ['en-IN', 'ml-IN', 'hi-IN'],
    targetRoute: '/finance/general-ledger',
    requiredRole: 'ACCOUNTANT',
    riskLevel: VoiceRiskLevel.LOW,
    requiresConfirmation: false,
    actionTitle: 'Navigate to Financial Ledger',
    actionDescription: 'Opens the double-entry general ledger.',
  },
  {
    intentKey: 'NAV_ADMIN_HEALTH',
    commandType: VoiceCommandType.NAVIGATION,
    phrases: ['system health', 'admin health', 'observability', 'telemetry', 'സിസ്റ്റം ഹെൽത്ത്', 'सिस्टम हेल्थ'],
    locales: ['en-IN', 'ml-IN', 'hi-IN'],
    targetRoute: '/admin/system-health',
    requiredRole: 'ADMIN',
    riskLevel: VoiceRiskLevel.LOW,
    requiresConfirmation: false,
    actionTitle: 'Navigate to System Health',
    actionDescription: 'Opens operational health and latency telemetry.',
  },

  // --- Voice Operations (VO8) ---
  {
    intentKey: 'OP_CREATE_QUOTE',
    commandType: VoiceCommandType.CREATE,
    phrases: ['create quote', 'new quotation', 'generate quote', 'ക്വോട്ടേഷൻ തയ്യാറാക്കുക', 'नया कोट बनाओ'],
    locales: ['en-IN', 'ml-IN', 'hi-IN'],
    targetRoute: '/crm/quotes',
    governedFunction: 'crm.create_quote',
    requiredRole: 'TRAVEL_AGENT',
    riskLevel: VoiceRiskLevel.MEDIUM,
    requiresConfirmation: false,
    actionTitle: 'Create Quotation',
    actionDescription: 'Initiates a new customer travel quote draft.',
  },
  {
    intentKey: 'OP_REFUND_BOOKING',
    commandType: VoiceCommandType.APPROVE,
    phrases: ['process refund', 'cancel and refund', 'issue refund', 'റീഫണ്ട് നൽകുക', 'रिफंड प्रोसेस करो'],
    locales: ['en-IN', 'ml-IN', 'hi-IN'],
    governedFunction: 'finance.refund_booking',
    requiredRole: 'FINANCE_MANAGER',
    riskLevel: VoiceRiskLevel.CONSEQUENTIAL,
    requiresConfirmation: true, // Gate: Must confirm consequential financial mutation
    actionTitle: 'Execute Booking Refund',
    actionDescription: 'Reverses payment and writes balance-clearing journal entries.',
  },
  {
    intentKey: 'MACRO_MORNING_BRIEF',
    commandType: VoiceCommandType.WORKFLOW,
    phrases: ['morning briefing', 'daily summary', 'today briefing', 'ഇന്നത്തെ സംഗ്രഹം', 'मॉर्निंग ब्रीफिंग'],
    locales: ['en-IN', 'ml-IN', 'hi-IN'],
    targetRoute: '/operations/dashboard',
    riskLevel: VoiceRiskLevel.LOW,
    requiresConfirmation: false,
    actionTitle: 'Execute Morning Briefing Macro',
    actionDescription: 'Aggregates departures, active leads, and urgent alerts for today.',
  },
];

export class VoiceIntentResolver {
  /**
   * Resolve user speech text into a governed voice intent
   */
  static resolve(transcript: string, userRole: string = 'CUSTOMER'): {
    matched: boolean;
    intent?: GovernedVoiceIntent;
    permissionDenied?: boolean;
    confirmationRequired?: boolean;
    message: string;
  } {
    const clean = transcript.toLowerCase().trim();

    for (const intent of GOVERNED_VOICE_INTENTS) {
      const isMatch = intent.phrases.some((phrase) => {
        return clean.includes(phrase) || phrase.includes(clean);
      });

      if (isMatch) {
        // Enforce RBAC security
        if (intent.requiredRole) {
          const isSuperAdmin = userRole === 'PLATFORM_SUPER_ADMIN' || userRole === 'SUPER_ADMIN';
          const hasRole = userRole === intent.requiredRole;
          if (!isSuperAdmin && !hasRole) {
            return {
              matched: true,
              intent,
              permissionDenied: true,
              message: `Voice command "${intent.actionTitle}" requires role [${intent.requiredRole}], but current role is [${userRole}]. Access Denied.`,
            };
          }
        }

        return {
          matched: true,
          intent,
          confirmationRequired: intent.requiresConfirmation,
          message: intent.requiresConfirmation
            ? `Action "${intent.actionTitle}" is classified as ${intent.riskLevel}. User confirmation is required before execution.`
            : `Executing voice command: ${intent.actionTitle}`,
        };
      }
    }

    return {
      matched: false,
      message: `No governed voice intent recognized for: "${transcript}". Try "open circles", "plan my trip", or "show leads".`,
    };
  }
}
