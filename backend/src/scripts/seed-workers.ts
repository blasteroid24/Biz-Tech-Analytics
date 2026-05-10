import { db } from "../config/db.js";
import { workers, workstations, events } from "../models/workers-schema.js";

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

async function seed() {
  console.log("Starting seed...");

  try {
    await db.delete(events);
    await db.delete(workers);
    await db.delete(workstations);

    console.log("Cleared old data");

    //Workstations
    const stationRes = await db.insert(workstations).values(STATIONS).returning();
    console.log(`Inserted ${stationRes.length} workstations`);

    //Workers
    const workerValues = WORKERS.map((w, i) => ({...w,workstationId: stationRes[i]!.id}));
    const workerRes = await db.insert(workers).values(workerValues).returning();
    console.log(`Inserted ${workerRes.length} workers`);

    // Dummy Data
    const eventValues = [];
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const worker of workerRes) {
      let currentTime = new Date(oneDayAgo);
      
      while (currentTime < now) {
        // Random duration between 15 mins to 2 hours for a state
        const durationMins = Math.floor(Math.random() * 105) + 15;
        const nextTime = new Date(currentTime.getTime() + durationMins * 60 * 1000);
        
        // Randomly pick a state: working (70%), idle (20%), absent (10%)
        const rand = Math.random();
        let state: "working" | "idle" | "absent" = "working";
        if (rand > 0.7 && rand <= 0.9) state = "idle";
        else if (rand > 0.9) state = "absent";

        // Add state event
        eventValues.push({
          timestamp: new Date(currentTime),
          workerId: worker.id,
          workstationId: worker.workstationId,
          eventType: state,
          confidence: Math.random() * 0.2 + 0.8, // 0.8 to 1.0
        });

        // If working, add product_count events every 5-15 mins
        if (state === "working") {
          let productionTime = new Date(currentTime);
          while (productionTime < nextTime) {
            productionTime = new Date(productionTime.getTime() + (Math.floor(Math.random() * 10) + 5) * 60 * 1000);
            if (productionTime < nextTime) {
              eventValues.push({
                timestamp: new Date(productionTime),
                workerId: worker.id,
                workstationId: worker.workstationId,
                eventType: "product_count" as const,
                count: 1,
                confidence: Math.random() * 0.1 + 0.9,
              });
            }
          }
        }

        currentTime = nextTime;
      }
    }

    // Batch insert events
    const batchSize = 1000;
    for (let i = 0; i < eventValues.length; i += batchSize) {
      const batch = eventValues.slice(i, i + batchSize);
      await db.insert(events).values(batch as any);
    }

    console.log(`Seeded ${eventValues.length} events!`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
