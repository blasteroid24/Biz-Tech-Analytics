import { pgTable, uuid, varchar, text, timestamp, integer, doublePrecision, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";


export const eventTypeEnum = pgEnum("event_type", ["working", "idle", "absent", "product_count"]);


export const workstations = pgTable("workstations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});


export const workers = pgTable("workers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  workstationId: uuid("workstation_id").references(() => workstations.id, { onDelete: "set null" }),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});


export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  workerId: uuid("worker_id").references(() => workers.id, { onDelete: "cascade" }),
  workstationId: uuid("workstation_id").references(() => workstations.id, { onDelete: "cascade" }),
  eventType: eventTypeEnum("event_type").notNull(),
  confidence: doublePrecision("confidence").default(1.0),
  count: integer("count").default(0),
});


export const workstationsRelations = relations(workstations, ({ many }) => ({
  workers: many(workers),
  events: many(events),
}));

export const workersRelations = relations(workers, ({ one, many }) => ({
  workstation: one(workstations, {
    fields: [workers.workstationId],
    references: [workstations.id],
  }),
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  worker: one(workers, {
    fields: [events.workerId],
    references: [workers.id],
  }),
  workstation: one(workstations, {
    fields: [events.workstationId],
    references: [workstations.id],
  }),
}));
