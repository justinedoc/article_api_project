import "dotenv/config";

import { drizzle } from "drizzle-orm/node-sqlite";
import { DatabaseSync } from "node:sqlite";
import { relations } from "./relations.js";
import { config } from "../config.js";

const sqlite = new DatabaseSync(config.DB_FILE_NAME);
// enable foreign key support in sqlite
sqlite.exec("PRAGMA foreign_keys = ON;");

export const db = drizzle({ client: sqlite, relations });
