import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
  id: integer().primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  password: text().notNull(), // Remember to store a hashed password (e.g., via Argon2 or bcrypt)
  createdAt: integer({ mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__*/ new Date())
    .notNull(),
  updatedAt: integer({ mode: "timestamp" })
    .$onUpdate(() => /* @__PURE__*/ new Date())
    .notNull(),
});