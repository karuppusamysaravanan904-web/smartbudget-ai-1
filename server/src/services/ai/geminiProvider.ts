import { IAIProvider, AIProviderResponse } from './aiProviderInterface';
import { UserFinancialContext, ContextBuilder } from '../contextBuilder';

export class GeminiProvider implements IAIProvider {
  name = 'Google Gemini';

  async generateResponse(
    systemPrompt: string,
    userQuestion: string,
    context: UserFinancialContext
  ): Promise<AIProviderResponse> {
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL || 'gemini-1.5-flash';

    if (!apiKey) {
      throw new Error('Google Gemini API Key is not configured in AI_API_KEY environment variable.');
    }

    const contextualPrompt = ContextBuilder.buildPrompt(context, userQuestion);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: contextualPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 800,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as any;
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('No content returned from Gemini model.');
    }

    return {
      answer: candidateText,
      provider: this.name,
      isSimulation: !!context.simulation,
      simulationDetails: context.simulation,
    };
  }
}
export default GeminiProvider;
