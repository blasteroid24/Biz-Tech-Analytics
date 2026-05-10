import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'node:crypto'
import { eq, and } from 'drizzle-orm'
import { db } from '../config/db.js'

import { admins, adminSessions } from '../models/admin-schema.js'
import { generateTokens } from '../utils/access-token.js'

export const adminLoginService = async (username: string, password: string, ipAddress: string) => {
    try {
        const admin = await db.query.admins.findFirst({ where: eq(admins.username, username) })

        if (!admin) {
            return { success: false, message: 'Invalid credentials' }
        }

        const isPasswordValid = await bcrypt.compare(password, admin.passwordHash)

        if (!isPasswordValid) {
            return { success: false, message: 'Invalid credentials' }
        }

        const sessionToken = randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

        const session = await db.insert(adminSessions).values({
            adminId: admin.id,
            token: sessionToken,
            deviceInfo: ipAddress,
            expiresAt
        }).returning()

        return {
            success: true,
            message: 'Login successful',
            adminId: admin.id,
            sessionToken,
            expiresAt
        }
    }
    catch (error) {
        return {
            success: false,
            message: 'Login error',
            error: error instanceof Error ? error.message : String(error)
        }
    }
}

export const getSessions = async (adminId: string) => {
    try {
        const sessions = await db.query.adminSessions.findMany({ where: eq(adminSessions.adminId, adminId) })

        return { success: true, sessions }
    } catch (error) {
        return {
            success: false,
            message: 'Failed to fetch sessions',
            error: error instanceof Error ? error.message : String(error)
        }
    }
}

// Update last active time for a session
export const updateSessionActivity = async (token: string) => {
    try {
        await db.update(adminSessions)
            .set({ lastActive: new Date() })
            .where(eq(adminSessions.token, token))

        return { success: true }
    } catch (error) {
        return { success: false, error }
    }
}

export const revokeSession = async (adminId: string, sessionId: string) => {
    try {
        const result = await db.delete(adminSessions).where(and(eq(adminSessions.id, sessionId), eq(adminSessions.adminId, adminId)))

        return {
            success: true,
            message: 'Session revoked successfully'
        }
    } catch (error) {
        return {
            success: false,
            message: 'Failed to revoke session',
            error: error instanceof Error ? error.message : String(error)
        }
    }
}