import { Router } from "express";
import type { Request, Response } from "express";
import { getWorkersService, createEventService, getWorkerHistoryService } from "../service/worker-services.js";

const router = Router();

/**
 * @swagger
 * /api/workers:
 *   get:
 *     summary: Get all workers with their current status and 24h metrics
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workers with metrics
 */
router.get("/", async (req: Request, res: Response) => {
    const result = await getWorkersService();
    if (!result.success) return res.status(500).json(result);
    res.json(result);
});

/**
 * @swagger
 * /api/workers/events:
 *   post:
 *     summary: Ingest a new productivity event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workerId, workstationId, eventType]
 *             properties:
 *               workerId: { type: string }
 *               workstationId: { type: string }
 *               eventType: { type: string, enum: [working, idle, absent, product_count] }
 *               confidence: { type: number }
 *               count: { type: number }
 *     responses:
 *       201:
 *         description: Event created successfully
 */
router.post("/events", async (req: Request, res: Response) => {
    const result = await createEventService(req.body);
    if (!result.success) return res.status(400).json(result);
    res.status(201).json(result);
});

/**
 * @swagger
 * /api/workers/{id}/history:
 *   get:
 *     summary: Get recent event history for a worker
 *     tags: [Workers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Worker event history
 */
router.get("/:id/history", async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
        res.status(400).json({ success: false, message: "Invalid ID" });
        return;
    }
    const result = await getWorkerHistoryService(id);

    if (!result.success) {
        res.status(500).json(result);
        return;
    }
    res.json(result);
});

/**
 * @swagger
 * /api/workers/seed:
 *   post:
 *     summary: Refresh dummy data for evaluation
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seeding successful
 */
router.post("/seed", async (req: Request, res: Response) => {
    // In a real app, this would be restricted to super-admins
    try {
        // We can just call a specialized service function or shell command
        // For simplicity, let's assume we implement the seed logic in a service
        const { seedDataService } = await import("../service/worker-services.js");
        const result = await seedDataService();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Seeding failed", error: String(error) });
    }
});

export default router;
