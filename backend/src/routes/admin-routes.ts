import { Router } from "express";
import type { Request, Response, NextFunction } from 'express'
import { validateAdminLogin } from "../validation/admin-credsvalidation.js";
import { adminLoginService, getSessions, revokeSession } from "../service/admin-services.js";


import { eq, and } from 'drizzle-orm'
import { db } from '../config/db.js'
import { admins, adminSessions } from '../models/admin-schema.js'

interface CustomRequest extends Request {
    adminId?: string
    sessionToken?: string
}

const router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Admin API is running" })
})




/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Authenticate an admin and create a session
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", validateAdminLogin, async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body
        const ipAddress = req.ip
        console.log(username, password, ipAddress)
        const result = await adminLoginService(username, password, ipAddress!)

        if (!result.success) {
            console.log(result)
            return res.status(401).json(result)
        }

        res.json({ ...result, message: 'Login successful' })
    }
    catch (error) {
        res.status(500).json({
            message: 'Login error',
            error: error instanceof Error ? error.message : String(error)
        })
    }
})


router.get("/validatetoken", async (req: CustomRequest, res: Response) => {
    try {
        if (!req.adminId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        const admin = await db.query.admins.findFirst({
            where: eq(admins.id, req.adminId)
        })

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Session is valid",
            admin: {
                id: admin.id,
                username: admin.username
            }
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        })
    }
})

router.post("/logout", async (req: CustomRequest, res: Response) => {
    try {
        if (!req.sessionToken) {
            return res.status(400).json({ success: false, message: "No active session" })
        }

        await db.delete(adminSessions).where(eq(adminSessions.token, req.sessionToken))

        res.json({ success: true, message: "Logged out successfully" })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Logout failed",
            error: error instanceof Error ? error.message : String(error)
        })
    }
})

router.get("/sessions", async (req: CustomRequest, res: Response) => {
    try {
        if (!req.adminId) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const result = await getSessions(req.adminId)

        if (!result.success) {
            return res.status(500).json(result)
        }

        res.json({
            ...result, sessions: result.sessions?.map(session => ({
                id: session.id,
                deviceInfo: session.deviceInfo,
                lastActive: session.lastActive,
                expiresAt: session.expiresAt,
                current_session: session.token === req.sessionToken
            }))
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'Failed to fetch sessions',
            error: error instanceof Error ? error.message : String(error)
        })
    }
})



export default router