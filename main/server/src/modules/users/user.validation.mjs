import { z } from 'zod';

export const userSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        roleName: z.string().optional(),
        organizationId: z.string().optional(),
        centerId: z.string().optional()
    })
});

export const updateUserSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        password: z.string().min(6).optional(),
        roleName: z.string().optional(),
        organizationId: z.string().optional(),
        centerId: z.string().optional()
    })
});
