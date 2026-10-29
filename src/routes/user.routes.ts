import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { UserController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { paginationQuerySchema } from "../utils/pagination.js";
import type { AppBindings } from "../types.js";
import {
  defaultErrorResponses,
  jsonContent,
  jsonContentRequired,
  messageSchema,
} from "../utils/openapi-helpers.js";

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
  search: z.string().optional().openapi({ description: "search username" }),
});

export const getUsersRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Users"],
  summary: "list users",
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
      "users list"
    ),
    ...defaultErrorResponses,
  },
});

export const getMeRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["Users"],
  summary: "get my profile",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  responses: {
    200: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.any(),
      }),
      "profile details"
    ),
    ...defaultErrorResponses,
  },
});

export const updateProfileRoute = createRoute({
  method: "patch",
  path: "/me",
  tags: ["Users"],
  summary: "update profile",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    body: jsonContentRequired(updateProfileSchema, "profile data"),
  },
  responses: {
    200: jsonContent(profileResponseSchema, "profile updated"),
    ...defaultErrorResponses,
  },
});

export const deleteAccountRoute = createRoute({
  method: "delete",
  path: "/me",
  tags: ["Users"],
  summary: "delete account",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  responses: {
    200: jsonContent(messageSchema("Account and profile deleted successfully"), "account deleted"),
    ...defaultErrorResponses,
  },
});

export const getUserArticlesRoute = createRoute({
  method: "get",
  path: "/:username/articles",
  tags: ["Users"],
  summary: "get author articles",
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
      "author articles"
    ),
    ...defaultErrorResponses,
  },
});

export const getProfileRoute = createRoute({
  method: "get",
  path: "/:username",
  tags: ["Users"],
  summary: "get user profile",
  request: {
    params: z.object({
      username: z.string().openapi({ example: "janedoe" }),
    }),
  },
  responses: {
    200: jsonContent(profileResponseSchema, "profile found"),
    ...defaultErrorResponses,
  },
});

export type GetUsersRoute = typeof getUsersRoute;
export type GetMeRoute = typeof getMeRoute;
export type UpdateProfileRoute = typeof updateProfileRoute;
export type DeleteAccountRoute = typeof deleteAccountRoute;
export type GetUserArticlesRoute = typeof getUserArticlesRoute;
export type GetProfileRoute = typeof getProfileRoute;

export const userRouter = new OpenAPIHono<AppBindings>()
  .openapi(getUsersRoute, UserController.getUsers)
  .openapi(getMeRoute, UserController.getMe)
  .openapi(updateProfileRoute, UserController.updateProfile)
  .openapi(deleteAccountRoute, UserController.deleteAccount)
  .openapi(getUserArticlesRoute, UserController.getUserArticles)
  .openapi(getProfileRoute, UserController.getProfile);
