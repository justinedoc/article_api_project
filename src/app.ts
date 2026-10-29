import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { Scalar } from "@scalar/hono-api-reference";
import { routes } from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFoundHandler } from "./middlewares/not-found.middleware.js";
import type { AppBindings } from "./types.js";

export const app = new OpenAPIHono<AppBindings>({
  strict: false,
  defaultHook: (result, c) => {
    if (!result.success) {
      const errorDetails =
        (result.error as any).issues?.map((i: any) => `${i.path.join(".")}: ${i.message}`).join("; ") ||
        result.error.message;
      return c.json(
        {
          success: false,
          message: `Validation failed: ${errorDetails}`,
        },
        422
      );
    }
  },
});

// Configure BearerAuth security scheme for OpenAPI
app.openAPIRegistry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "Enter your JWT token obtained from /api/auth/login or /api/auth/register",
});

// Built-in Request Logger
app.use("*", logger());

// CORS
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Mount API routes
app.route("/api", routes);

// OpenAPI JSON documentation endpoint
app.doc("/api/doc", {
  openapi: "3.1.0",
  info: {
    title: "Article API (Vivi's Project)",
    version: "1.0.0",
    description: "A clean, modular REST API for publishing articles and discussion comments using SQLite and Hono.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
});

// Interactive Scalar API reference documentation with Saturn theme
app.get(
  "/api/reference",
  Scalar(() => ({
    theme: "saturn",
    layout: "modern",
    pageTitle: "Article API Reference Documentation",
    url: "/api/doc",
  }))
);

// Fallback handlers
app.notFound(notFoundHandler);
app.onError(errorHandler);

export default app;
