import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { FinancialProfileService } from '../services/financialProfileService';

const ProfileSchema = z.object({
  monthlyIncome: z.number().min(0, 'Monthly income cannot be negative'),
  incomeFrequency: z.enum(['monthly', 'weekly', 'yearly']).default('monthly'),
  earningMembers: z.number().int().min(1, 'At least 1 earning member required'),
  householdMembers: z.number().int().min(1, 'At least 1 household member required'),
  dependents: z.number().int().min(0, 'Dependents cannot be negative').default(0),
  children: z.number().int().min(0).default(0),
  adults: z.number().int().min(1).default(1),
  seniors: z.number().int().min(0).default(0),
  monthlyRent: z.number().min(0, 'Rent cannot be negative').default(0),
  monthlyEmi: z.number().min(0, 'EMI cannot be negative').default(0),
  monthlyUtilities: z.number().min(0, 'Utilities cannot be negative').default(0),
  monthlyInsurance: z.number().min(0, 'Insurance cannot be negative').default(0),
  otherFixedExpenses: z.number().min(0, 'Other fixed expenses cannot be negative').default(0),
  monthlySavingsGoal: z.number().min(0, 'Savings goal cannot be negative').default(0),
  emergencyFundGoal: z.number().min(0).nullable().optional(),
}).refine((data) => data.householdMembers >= data.earningMembers, {
  message: 'Household members must be greater than or equal to earning members',
  path: ['householdMembers'],
});

export class FinancialProfileController {
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

      const result = await FinancialProfileService.getComputedProfile(userId, month);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to retrieve financial profile.' });
    }
  }

  static async saveProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

      // Validate with Zod
      const parseResult = ProfileSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorMessages = parseResult.error.errors.map((e) => e.message).join('. ');
        return res.status(400).json({ error: errorMessages });
      }

      await FinancialProfileService.upsertProfile(userId, parseResult.data);
      const computed = await FinancialProfileService.getComputedProfile(userId, month);

      res.status(200).json({
        message: 'Financial profile saved successfully.',
        ...computed,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save financial profile.' });
    }
  }

  static async deleteProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      await FinancialProfileService.deleteProfile(userId);
      res.json({ message: 'Financial profile reset successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete financial profile.' });
    }
  }

  static async getSuggestedBudget(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

      const plan = await FinancialProfileService.generateSuggestedBudget(userId, month);
      if (!plan) {
        return res.status(404).json({ error: 'Please set up your financial profile first to get suggested category allocations.' });
      }

      res.json({ suggestion: plan });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to generate budget suggestions.' });
    }
  }
}
export default FinancialProfileController;
