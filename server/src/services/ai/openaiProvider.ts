import { IAIProvider, AIProviderResponse } from './aiProviderInterface';
import { UserFinancialContext, ContextBuilder } from '../contextBuilder';

export class OpenAIProvider implements IAIProvider {
  name = 'OpenAI';

  async generateResponse(
    systemPrompt: string,
    userQuestion: string,
    context: UserFinancialContext
  ): Promise<AIProviderResponse> {
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL || 'gpt-4o-mini';

    if (!apiKey) {
      throw new Error('OpenAI API Key is not configured in AI_API_KEY environment variable.');
    }

    const contextualPrompt = ContextBuilder.buildPrompt(context, userQuestion);
    const url = 'https://api.openai.com/v1/chat/completions';

    const payload = {
      model,
      temperature: 0.2,
      max_tokens: 800,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: contextualPrompt },
      ],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as any;
    const candidateText = data?.choices?.[0]?.message?.content;

    if (!candidateText) {
      throw new Error('No content returned from OpenAI model.');
    }

    return {
      answer: candidateText,
      provider: this.name,
      isSimulation: !!context.simulation,
      simulationDetails: context.simulation,
    };
  }
}
export default OpenAIProvider;
