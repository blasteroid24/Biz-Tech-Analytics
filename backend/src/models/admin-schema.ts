import { relations } from "drizzle-orm";
import { serial, text, uuid, varchar, timestamp, pgTable, index, ForeignKey, jsonb, boolean, integer } from "drizzle-orm/pg-core";


export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id").references(() => admins.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  deviceInfo: text("device_info"), 
  expiresAt: timestamp("expires_at").notNull(),
  lastActive: timestamp("last_active").defaultNow(),
});

export const adminsRelations = relations(admins, ({ many }) => ({
    sessions: many(adminSessions),
}));

export const adminSessionsRelations = relations(adminSessions, ({ one }) => ({
    admin: one(admins, {
        fields: [adminSessions.adminId],
        references: [admins.id],
    }),
}));
