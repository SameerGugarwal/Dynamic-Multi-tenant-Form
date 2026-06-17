import { z } from 'zod';

export const formSchema = z.object({
    body: z.object({
        title: z.string().min(2, 'Title must be at least 2 characters'),
        description: z.string().optional(),
        status: z.string().optional(),
        visibility: z.string().optional()
    })
});
