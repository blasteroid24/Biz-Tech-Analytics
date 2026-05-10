import type { Request, Response, NextFunction } from "express";
import { env } from '../config/env.js'


export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    })
}

