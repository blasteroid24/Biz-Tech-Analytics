import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';


export const adminLogin = z.object({
        username: z.string(),
        password: z.string(),
})

export type adminLogin = z.infer<typeof adminLogin>

const validateAdminLogin = (req: Request, res: Response, next: NextFunction) => {
    const result = adminLogin.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);
    next();
}

export { validateAdminLogin }