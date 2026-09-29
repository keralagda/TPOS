/**
 * NVIDIA NIM AI Engine for Travel Planet (Voyage8)
 * Powers AI Assist, Itinerary Synthesis, and Voice Intelligence
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface NvidiaNimOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export class NvidiaNimService {
  private static apiKey = process.env.NVIDIA_API_KEY || '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';
  private static defaultModel = process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct';
  private static baseUrl = 'https://integrate.api.nvidia.com/v1';

  /**
   * Send a chat completion request to NVIDIA NIM
   */
  static async chat(messages: ChatMessage[], options?: NvidiaNimOptions): Promise<string> {
    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? 0.2;
    const maxTokens = options?.maxTokens ?? 512;

    const formattedMessages: ChatMessage[] = [];
    if (options?.systemPrompt) {
      formattedMessages.push({ role: 'system', content: options.systemPrompt });
    }
    formattedMessages.push(...messages);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('NVIDIA NIM API Error:', errorText);
        throw new Error(`NVIDIA NIM returned status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      return content || 'No response generated from NVIDIA NIM.';
    } catch (err: any) {
      console.warn('Falling back to local AI assistant logic due to NVIDIA NIM error:', err.message);
      throw err;
    }
  }

  /**
   * Synthesize a full personalized travel itinerary using NVIDIA NIM
   */
  static async synthesizeItinerary(params: {
    destination: string;
    durationDays: number;
    budgetTier: string;
    travelerStyle: string;
    travelersCount: number;
  }): Promise<string> {
    const prompt = `You are Voyage8 AI Travel Synthesizer for Travel Planet India.
Plan a ${params.durationDays}-day ${params.budgetTier.toLowerCase()} trip to ${params.destination} for ${params.travelersCount} travelers with a ${params.travelerStyle.toLowerCase()} focus.
Provide:
1. Destination overview & best time to visit
2. Day-by-day highlights with morning, afternoon, and evening recommendations
3. Insider local hidden gem recommendation
4. Estimated total budget breakdown in INR
Keep it engaging, practical, and highly realistic.`;

    return this.chat(
      [{ role: 'user', content: prompt }],
      {
        systemPrompt: 'You are the Voyage8 AI Intelligence engine inside Travel Planet OS. Provide structured, accurate, and inspiring travel plans.',
        maxTokens: 1024,
      }
    );
  }

  /**
   * Extract travel intent & parameters from spoken user voice transcripts
   */
  static async parseVoiceIntent(transcript: string): Promise<{
    intent: string;
    destination?: string;
    action?: string;
    confidence: number;
  }> {
    const prompt = `Analyze this spoken voice command in a travel management app: "${transcript}".
Identify the primary user intent and destination if mentioned. Return ONLY JSON:
{"intent": "SEARCH_FLIGHTS" | "EXPLORE_CIRCLES" | "PLAN_TRIP" | "VIEW_LEADS" | "GENERAL_HELP", "destination": "name or null", "action": "summary", "confidence": 0.95}`;

    try {
      const raw = await this.chat([{ role: 'user', content: prompt }], { maxTokens: 120 });
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Fallback
    }

    return {
      intent: 'PLAN_TRIP',
      confidence: 0.8,
    };
  }
}
