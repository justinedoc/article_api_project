import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  defaultErrorResponses,
  jsonContent,
  jsonContentRequired,
} from "../utils/openapi-helpers.js";

export const authRouter = new OpenAPIHono();

const registerSchema = z.object({
  email: z.string().email().openapi({ example: "student@example.com" }),
  password: z.string().min(6).openapi({ example: "secret123" }),
  username: z.string().min(3).max(30).openapi({ example: "janedoe" }),
  displayName: z.string().optional().openapi({ example: "Jane Doe" }),
});

const loginSchema = z.object({
  email: z.string().email().openapi({ example: "student@example.com" }),
  password: z.string().min(6).openapi({ example: "secret123" }),
});

const authResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    token: z.string(),
    user: z.object({
      id: z.number(),
      email: z.string(),
      username: z.string().nullable(),
      displayName: z.string().nullable(),
      image: z.string().nullable().optional(),
    }),
  }),
});

const registerRoute = createRoute({
  method: "post",
  path: "/register",
  tags: ["Authentication"],
  summary: "Register a new user account",
  request: {
    body: jsonContentRequired(registerSchema, "User registration payload"),
  },
  responses: {
    201: jsonContent(authResponseSchema, "Registration successful"),
    ...defaultErrorResponses,
  },
});

const loginRoute = createRoute({
  method: "post",
  path: "/login",
  tags: ["Authentication"],
  summary: "Login with email and password",
  request: {
    body: jsonContentRequired(loginSchema, "User login payload"),
  },
  responses: {
    200: jsonContent(authResponseSchema, "Login successful"),
    ...defaultErrorResponses,
  },
});

const meRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["Authentication"],
  summary: "Get currently authenticated user",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  responses: {
    200: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.any(),
      }),
      "Authenticated user details"
    ),
    ...defaultErrorResponses,
  },
});

authRouter.openapi(registerRoute, AuthController.register as any);
authRouter.openapi(loginRoute, AuthController.login as any);
authRouter.openapi(meRoute, AuthController.getMe as any);
