import { z } from 'zod';

export const logicConditionSchema = z.object({
    dependsOnQuestionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid valid MongoDB ObjectId'),
    operator: z.enum(['EQUALS', 'NOT_EQUALS', 'CONTAINS', 'GREATER_THAN', 'LESS_THAN']),
    value: z.any()
});

export const logicSchema = z.object({
    action: z.enum(['SHOW', 'HIDE']).default('SHOW'),
    conditions: z.array(logicConditionSchema).min(1, 'At least one condition is required'),
    conditionType: z.enum(['AND', 'OR']).default('AND')
});

export const createQuestionSchema = z.object({
    body: z.object({
        formId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Form ID'),
        label: z.string().min(1, 'Label is required'),
        fieldType: z.enum(['TEXT', 'NUMBER', 'DATE', 'RADIO', 'CHECKBOX', 'SELECT']),
        isRequired: z.boolean().default(false),
        order: z.number().int().nonnegative(),
        options: z.array(z.string()).optional(),
        logic: logicSchema.optional()
    })
});
