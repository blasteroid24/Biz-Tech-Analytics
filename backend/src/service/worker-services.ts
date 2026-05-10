import { db } from "../config/db.js";
import { workers, events, workstations } from "../models/workers-schema.js";
import { eq, desc, and, gte } from "drizzle-orm";
import { calculateProductivity } from "../utils/productivity.js";

export const getWorkersService = async () => {
    try {
        const allWorkers = await db.query.workers.findMany({
            with: {
                workstation: true,
                events: {
                    limit: 1,
                    orderBy: [desc(events.timestamp)],
                    where: and(gte(events.timestamp, new Date(Date.now() - 24 * 60 * 60 * 1000)))
                }
            }
        });

        // Add metrics and current status to each worker
        const workersWithMetrics = await Promise.all(allWorkers.map(async (worker) => {
            const workerEvents = await db.query.events.findMany({
                where: and(
                    eq(events.workerId, worker.id),
                    gte(events.timestamp, new Date(Date.now() - 24 * 60 * 60 * 1000))
                )
            });

            const metrics = calculateProductivity(workerEvents);
            const lastStatusEvent = workerEvents
                .filter(e => ['working', 'idle', 'absent'].includes(e.eventType))
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

            return {
                ...worker,
                metrics,
                currentStatus: lastStatusEvent?.eventType || 'absent'
            };
        }));

        return { success: true, workers: workersWithMetrics };
    } catch (error) {
        return { success: false, message: "Failed to fetch workers", error: String(error) };
    }
};

export const createEventService = async (data: {
    workerId: string;
    workstationId: string;
    eventType: "working" | "idle" | "absent" | "product_count";
    confidence?: number;
    count?: number;
}) => {
    try {
        const newEvent = await db.insert(events).values({ ...data,timestamp: new Date()}).returning();
        return { success: true, event: newEvent[0] };
    } catch (error) {
        return { success: false, message: "Failed to create event", error: String(error) };
    }
};

export const getWorkerHistoryService = async (workerId: string) => {
    try {
        const history = await db.query.events.findMany({
            where: eq(events.workerId, workerId),
            orderBy: [desc(events.timestamp)],
            limit: 100
        });

        return { success: true, history };
    } catch (error) {
        return { success: false, message: "Failed to fetch history", error: String(error) };
    }
};

export const seedDataService = async () => {
    try {
        const { workers, workstations, events: eventsTable } = await import("../models/workers-schema.js");

        // Clear existing data
        await db.delete(eventsTable);
        await db.delete(workers);
        await db.delete(workstations);

        const STATIONS = [
            { name: "Chassis", description: "Chassis assembly line" },
            { name: "Engine", description: "Engine integration and testing" },
            { name: "Paint Shop", description: "Automated painting and curing" },
            { name: "Interior", description: "Cabin trim and seating installation" },
            { name: "Electronics", description: "Wiring looms and ECU programming" },
            { name: "Final QC", description: "Final quality check and road test" },
        ];

        const WORKERS = [
            { name: "Rajesh Kumar", imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh" },
            { name: "Amit Singh", imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit" },
            { name: "Priya Sharma", imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
            { name: "Suresh Raina", imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh" },
            { name: "Vikram Rathore", imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram" },
            { name: "Anjali Devi", imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali" },
        ];

        const stationRes = await db.insert(workstations).values(STATIONS).returning();
        const workerValues = WORKERS.map((w, i) => ({ ...w, workstationId: stationRes[i]!.id }));
        const workerRes = await db.insert(workers).values(workerValues).returning();

        const eventValues = [];
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        for (const worker of workerRes) {
            let currentTime = new Date(oneDayAgo);
            while (currentTime < now) {
                const durationMins = Math.floor(Math.random() * 105) + 15;
                const nextTime = new Date(currentTime.getTime() + durationMins * 60 * 1000);
                const rand = Math.random();
                let state: "working" | "idle" | "absent" = "working";
                if (rand > 0.7 && rand <= 0.9) state = "idle";
                else if (rand > 0.9) state = "absent";

                eventValues.push({
                    timestamp: new Date(currentTime),
                    workerId: worker.id,
                    workstationId: worker.workstationId,
                    eventType: state,
                    confidence: Math.random() * 0.2 + 0.8,
                });

                if (state === "working") {
                    let productionTime = new Date(currentTime);
                    while (productionTime < nextTime) {
                        productionTime = new Date(productionTime.getTime() + (Math.floor(Math.random() * 10) + 5) * 60 * 1000);
                        if (productionTime < nextTime) {
                            eventValues.push({
                                timestamp: new Date(productionTime),
                                workerId: worker.id,
                                workstationId: worker.workstationId,
                                eventType: "product_count",
                                count: 1,
                                confidence: Math.random() * 0.1 + 0.9,
                            });
                        }
                    }
                }
                currentTime = nextTime;
            }
        }

        const batchSize = 1000;
        for (let i = 0; i < eventValues.length; i += batchSize) {
            await db.insert(eventsTable).values(eventValues.slice(i, i + batchSize) as any);
        }

        return { success: true, message: `Seeded ${eventValues.length} events` };
    } catch (error) {
        return { success: false, message: "Seeding failed", error: String(error) };
    }
};
