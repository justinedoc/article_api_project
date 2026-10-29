import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import type { AppBindings } from "../types.js";
import {
  defaultErrorResponses,
  jsonContent,
  jsonContentRequired,
  messageSchema,
} from "../utils/openapi-helpers.js";

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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6).openapi({ example: "secret123" }),
  newPassword: z.string().min(6).openapi({ example: "newSecret456" }),
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

export const registerRoute = createRoute({
  method: "post",
  path: "/register",
  tags: ["Auth"],
  summary: "register user",
  request: {
    body: jsonContentRequired(registerSchema, "registration data"),
  },
  responses: {
    201: jsonContent(authResponseSchema, "user registered"),
    ...defaultErrorResponses,
  },
});

export const loginRoute = createRoute({
  method: "post",
  path: "/login",
  tags: ["Auth"],
  summary: "login user",
  request: {
    body: jsonContentRequired(loginSchema, "login data"),
  },
  responses: {
    200: jsonContent(authResponseSchema, "logged in"),
    ...defaultErrorResponses,
  },
});

export const meRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["Auth"],
  summary: "get current user",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  responses: {
    200: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.any(),
      }),
      "current user"
    ),
    ...defaultErrorResponses,
  },
});

export const changePasswordRoute = createRoute({
  method: "patch",
  path: "/change-password",
  tags: ["Auth"],
  summary: "change password",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    body: jsonContentRequired(changePasswordSchema, "password data"),
  },
  responses: {
    200: jsonContent(messageSchema("Password updated successfully"), "password updated"),
    ...defaultErrorResponses,
  },
});

export type RegisterRoute = typeof registerRoute;
export type LoginRoute = typeof loginRoute;
export type MeRoute = typeof meRoute;
export type ChangePasswordRoute = typeof changePasswordRoute;

export const authRouter = new OpenAPIHono<AppBindings>()
  .openapi(registerRoute, AuthController.register)
  .openapi(loginRoute, AuthController.login)
  .openapi(meRoute, AuthController.getMe)
  .openapi(changePasswordRoute, AuthController.changePassword);
