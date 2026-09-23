import prisma from '../../config/prisma';
import { IAIProvider, AIProviderResponse } from './aiProviderInterface';
import { LocalAIProvider } from './localAiProvider';
import { GeminiProvider } from './geminiProvider';
import { OpenAIProvider } from './openaiProvider';
import { ContextBuilder, UserFinancialContext } from '../contextBuilder';

const SYSTEM_PROMPT = `You are BudgetAI, a personal budgeting assistant inside a Personal Budget Planner application.
You answer questions using the authenticated user's provided budgeting and expense context.
Do not invent financial values.
If the required data is unavailable, clearly say that the information is unavailable.
Use the user's actual budget, spending, remaining amounts, and categories when answering.
Explain calculations clearly when useful.
Do not modify budgets or expenses unless the user explicitly performs an application action.
Hypothetical questions must be treated as simulations.
Never reveal private information belonging to another user.
Do not claim to be a financial advisor.
Provide educational budgeting guidance rather than regulated financial advice.`;

export class AIService {
  private static localProvider = new LocalAIProvider();
  private static geminiProvider = new GeminiProvider();
  private static openaiProvider = new OpenAIProvider();

  /**
   * Resolve active AI provider based on configuration and availability
   */
  private static getProvider(): IAIProvider {
    const configured = (process.env.AI_PROVIDER || 'local').toLowerCase();

    if (configured === 'gemini' && process.env.AI_API_KEY) {
      return this.geminiProvider;
    }
    if (configured === 'openai' && process.env.AI_API_KEY) {
      return this.openaiProvider;
    }

    return this.localProvider;
  }

  /**
   * Main query execution pipeline
   */
  static async query(
    userId: string,
    userName: string,
    month: string,
    question: string,
    conversationId?: string
  ): Promise<{
    answer: string;
    provider: string;
    conversationId: string;
    isSimulation: boolean;
    simulationDetails?: any;
    contextSnapshot: UserFinancialContext;
  }> {
    // 1. Build Scoped Context
    const context = await ContextBuilder.buildUserFinancialContext(userId, userName, month, question);

    // 2. Select Provider
    const provider = this.getProvider();

    let response: AIProviderResponse;

    try {
      response = await provider.generateResponse(SYSTEM_PROMPT, question, context);
    } catch (providerError) {
      console.warn(`[AI Service] Error from provider ${provider.name}:`, providerError);

      // Fallback to local intelligent provider if external provider failed
      if (provider.name !== this.localProvider.name) {
        console.log('[AI Service] Falling back to Local AI Provider...');
        try {
          response = await this.localProvider.generateResponse(SYSTEM_PROMPT, question, context);
        } catch (localError) {
          response = {
            answer: 'BudgetAI is temporarily unavailable. You can still view and manage your budgets and expenses safely.',
            provider: 'Fallback',
            isSimulation: false,
          };
        }
      } else {
        response = {
          answer: 'BudgetAI is temporarily unavailable. You can still view and manage your budgets and expenses safely.',
          provider: 'Fallback',
          isSimulation: false,
        };
      }
    }

    // 3. Persist Conversation & Messages
    let convId = conversationId;
    try {
      if (!convId) {
        const newConv = await prisma.aIConversation.create({
          data: {
            userId,
            title: question.slice(0, 40) + '...',
          },
        });
        convId = newConv.id;
      }

      await prisma.aIMessage.createMany({
        data: [
          {
            conversationId: convId,
            role: 'user',
            content: question,
            isSimulation: !!response.isSimulation,
          },
          {
            conversationId: convId,
            role: 'assistant',
            content: response.answer,
            contextData: JSON.stringify(context),
            isSimulation: !!response.isSimulation,
          },
        ],
      });
    } catch (err) {
      console.error('[AI Service] Failed to persist chat log:', err);
    }

    return {
      answer: response.answer,
      provider: response.provider,
      conversationId: convId || 'default-session',
      isSimulation: !!response.isSimulation,
      simulationDetails: response.simulationDetails,
      contextSnapshot: context,
    };
  }

  /**
   * Generate an automated monthly executive summary report
   */
  static async generateMonthlySummary(userId: string, userName: string, month: string): Promise<string> {
    const context = await ContextBuilder.buildUserFinancialContext(
      userId,
      userName,
      month,
      'Give me a summary of my spending this month.'
    );

    const provider = this.getProvider();
    try {
      const res = await provider.generateResponse(
        SYSTEM_PROMPT,
        'Provide an executive spending analysis and breakdown for this month.',
        context
      );
      return res.answer;
    } catch (err) {
      const local = await this.localProvider.generateResponse(
        SYSTEM_PROMPT,
        'Give me a summary of my spending this month.',
        context
      );
      return local.answer;
    }
  }

  /**
   * Fetch chat history for user
   */
  static async getHistory(userId: string) {
    return prisma.aIConversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });
  }

  /**
   * Clear chat history for user
   */
  static async clearHistory(userId: string) {
    return prisma.aIConversation.deleteMany({
      where: { userId },
    });
  }
}
export default AIService;
