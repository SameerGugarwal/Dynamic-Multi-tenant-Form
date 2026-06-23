import { z } from 'zod';

export const organizationSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        contactEmail: z.string().email('Valid contact email is required'),
        centers: z.array(z.string()).optional()
    })
});
