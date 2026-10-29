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

// configure jwt bearer auth for openapi
app.openAPIRegistry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "jwt bearer token",
});

// request logger
app.use("*", logger());

// allow cross-origin requests
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// mount api routes
app.route("/api", routes);

// openapi json docs
app.doc("/api/doc", {
  openapi: "3.1.0",
  info: {
    title: "Article API",
    version: "1.0.0",
    description: "simple rest api for articles and comments",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "local server",
    },
  ],
});

// scalar reference ui
app.get(
  "/api/reference",
  Scalar(() => ({
    theme: "saturn",
    layout: "modern",
    pageTitle: "Article API Reference",
    url: "/api/doc",
  }))
);

// not found and error handlers
app.notFound(notFoundHandler);
app.onError(errorHandler);

export default app;
