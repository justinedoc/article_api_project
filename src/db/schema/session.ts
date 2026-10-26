import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accounts } from "./accounts.js";

export const sessions = sqliteTable("sessions", {
  id: text().primaryKey(),
  userId: integer()
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  expiresAt: integer({ mode: "timestamp" }).notNull(),
});
