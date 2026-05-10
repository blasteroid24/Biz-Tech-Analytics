import type { Request, Response, NextFunction } from 'express'
import { db } from '../config/db.js'
import { adminSessions } from '../models/admin-schema.js'
import { eq } from 'drizzle-orm'


interface CustomRequest extends Request {
    isInitialized?: boolean
    adminId?: string
    sessionToken?: string
}

export const adminInitMiddleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const publicPaths = ['/login'];
        
        // Allow public access ONLY to admin login
        if (req.baseUrl === '/api/admin' && publicPaths.includes(req.path)) {
            return next()
        }

        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Missing or invalid authorization token' })
        }
        const token = authHeader.slice(7)


        const session = await db.query.adminSessions.findFirst({
            where: eq(adminSessions.token, token),
            with: {
                admin: true
            }
        })

        if (!session) {
            return res.status(401).json({ message: 'Invalid or expired token' })
        }

        if (new Date() > session.expiresAt) {
            return res.status(401).json({ message: 'Token has expired' })
        }

        db.update(adminSessions)
            .set({ lastActive: new Date() })
            .where(eq(adminSessions.token, token))
            .execute()
            .catch(err => console.error('Failed to update lastActive:', err));

        req.adminId = session.adminId!
        req.sessionToken = token
        next()
    }
    catch (error) {
        res.status(500).json({ message: 'Admin Middleware error', error: error instanceof Error ? error.message : String(error) })
    }
}


