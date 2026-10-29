import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { UserController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  defaultErrorResponses,
  jsonContent,
  jsonContentRequired,
} from "../utils/openapi-helpers.js";

export const userRouter = new OpenAPIHono();

const updateProfileSchema = z.object({
  displayName: z.string().optional().openapi({ example: "Jane Smith" }),
  bio: z.string().optional().openapi({ example: "Software engineering enthusiast" }),
  image: z.string().url().optional().openapi({ example: "https://example.com/avatar.png" }),
  username: z.string().min(3).max(30).optional().openapi({ example: "janesmith" }),
});

const profileResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    id: z.string(),
    userId: z.number(),
    username: z.string(),
    displayName: z.string().nullable(),
    bio: z.string().nullable(),
    image: z.string().nullable(),
    createdAt: z.any(),
    updatedAt: z.any(),
  }),
});

const getProfileRoute = createRoute({
  method: "get",
  path: "/:username",
  tags: ["Users & Profiles"],
  summary: "Get user public profile by username",
  request: {
    params: z.object({
      username: z.string().openapi({ example: "janedoe" }),
    }),
  },
  responses: {
    200: jsonContent(profileResponseSchema, "Profile found"),
    ...defaultErrorResponses,
  },
});

const updateProfileRoute = createRoute({
  method: "patch",
  path: "/me",
  tags: ["Users & Profiles"],
  summary: "Update current authenticated user's profile",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    body: jsonContentRequired(updateProfileSchema, "Profile update payload"),
  },
  responses: {
    200: jsonContent(profileResponseSchema, "Profile updated successfully"),
    ...defaultErrorResponses,
  },
});

userRouter.openapi(getProfileRoute, UserController.getProfile as any);
userRouter.openapi(updateProfileRoute, UserController.updateProfile as any);
