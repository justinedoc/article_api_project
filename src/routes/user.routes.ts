import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { UserController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { paginationQuerySchema } from "../utils/pagination.js";
import {
  defaultErrorResponses,
  jsonContent,
  jsonContentRequired,
  messageSchema,
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

const listUsersQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional().openapi({ description: "Search by username" }),
});

const getUsersRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Users & Profiles"],
  summary: "List all users/authors with offset pagination",
  request: {
    query: listUsersQuerySchema,
  },
  responses: {
    200: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.array(z.any()),
        pagination: z.any(),
      }),
      "Users retrieved"
    ),
    ...defaultErrorResponses,
  },
});

const getMeRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["Users & Profiles"],
  summary: "Get current user profile and account details",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  responses: {
    200: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.any(),
      }),
      "Current user profile"
    ),
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

const deleteAccountRoute = createRoute({
  method: "delete",
  path: "/me",
  tags: ["Users & Profiles"],
  summary: "Permanently delete user account, profile, articles, and comments",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  responses: {
    200: jsonContent(messageSchema("Account and profile deleted successfully"), "Account deleted"),
    ...defaultErrorResponses,
  },
});

const getUserArticlesRoute = createRoute({
  method: "get",
  path: "/:username/articles",
  tags: ["Users & Profiles"],
  summary: "Get all articles published by a specific author",
  request: {
    params: z.object({ username: z.string() }),
    query: paginationQuerySchema,
  },
  responses: {
    200: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.array(z.any()),
        pagination: z.any(),
      }),
      "Author articles"
    ),
    ...defaultErrorResponses,
  },
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

userRouter.openapi(getUsersRoute, UserController.getUsers as any);
userRouter.openapi(getMeRoute, UserController.getMe as any);
userRouter.openapi(updateProfileRoute, UserController.updateProfile as any);
userRouter.openapi(deleteAccountRoute, UserController.deleteAccount as any);
userRouter.openapi(getUserArticlesRoute, UserController.getUserArticles as any);
userRouter.openapi(getProfileRoute, UserController.getProfile as any);
