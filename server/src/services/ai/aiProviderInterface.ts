import { UserFinancialContext } from '../contextBuilder';

export interface AIProviderResponse {
  answer: string;
  provider: string;
  isSimulation?: boolean;
  simulationDetails?: any;
}

export interface IAIProvider {
  name: string;
  generateResponse(
    systemPrompt: string,
    userQuestion: string,
    context: UserFinancialContext
  ): Promise<AIProviderResponse>;
}
