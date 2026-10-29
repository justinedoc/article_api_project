import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { UserController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { paginationQuerySchema, paginatedResponseSchema } from "../utils/pagination.js";
import type { AppBindings } from "../types.js";
import {
  createMessageSchema,
  dataResponseSchema,
  defaultErrorResponses,
  httpStatusCodes,
  jsonContent,
  jsonContentRequired,
} from "../utils/openapi-helpers.js";

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional().openapi({
    description: "public display name",
    example: "Jane Smith",
  }),
  bio: z.string().max(500).optional().nullable().openapi({
    description: "biography or about me text",
    example: "Software engineering enthusiast and open source contributor.",
  }),
  image: z.string().url().optional().nullable().openapi({
    description: "avatar image url",
    example: "https://example.com/avatar.jpg",
  }),
  username: z.string().min(3).max(30).optional().openapi({
    description: "unique handle",
    example: "janesmith",
  }),
});

export const publicProfileSchema = z.object({
  id: z.string().openapi({ description: "profile unique id", example: "prof_12345678" }),
  userId: z.number().int().openapi({ description: "account user id", example: 1 }),
  username: z.string().openapi({ description: "unique username handle", example: "janedoe" }),
  displayName: z.string().nullable().openapi({ description: "public display name", example: "Jane Doe" }),
  bio: z.string().nullable().openapi({ description: "author bio", example: "Software engineer and tech blogger." }),
  image: z.string().nullable().openapi({ description: "avatar image url", example: "https://example.com/avatar.jpg" }),
  createdAt: z.coerce.date().openapi({ description: "profile creation date", example: "2026-10-29T10:00:00.000Z" }),
  updatedAt: z.coerce.date().openapi({ description: "profile updated date", example: "2026-10-29T10:00:00.000Z" }),
});

export const userSummaryItemSchema = z.object({
  id: z.string().openapi({ description: "profile id", example: "prof_12345678" }),
  userId: z.number().int().openapi({ description: "account user id", example: 1 }),
  username: z.string().openapi({ description: "username", example: "janedoe" }),
  displayName: z.string().nullable().openapi({ description: "display name", example: "Jane Doe" }),
  bio: z.string().nullable().openapi({ description: "bio", example: "Fullstack developer and open source writer." }),
  image: z.string().nullable().openapi({ description: "avatar url", example: "https://example.com/avatar.jpg" }),
  createdAt: z.coerce.date().openapi({ description: "created date", example: "2026-10-29T10:00:00.000Z" }),
});

export const userAccountDetailsSchema = z.object({
  id: z.number().int().openapi({ description: "account id", example: 1 }),
  email: z.string().email().openapi({ description: "email address", example: "student@example.com" }),
  profile: publicProfileSchema.nullable().openapi({ description: "profile information" }),
  createdAt: z.coerce.date().openapi({ description: "account creation date", example: "2026-10-29T10:00:00.000Z" }),
});

export const authorArticleItemSchema = z.object({
  id: z.string().openapi({ description: "article id", example: "art_12345678" }),
  title: z.string().openapi({ description: "article title", example: "Building Web APIs with Hono" }),
  slug: z.string().openapi({ description: "url slug", example: "building-web-apis-with-hono-k892x" }),
  excerpt: z.string().nullable().openapi({ description: "short summary", example: "A beginner friendly guide to Hono." }),
  body: z.string().openapi({ description: "article content", example: "Full article body explaining routing, controllers, and SQLite..." }),
  createdAt: z.coerce.date().openapi({ description: "creation date", example: "2026-10-29T10:00:00.000Z" }),
  updatedAt: z.coerce.date().openapi({ description: "updated date", example: "2026-10-29T10:00:00.000Z" }),
  author: z.object({
    id: z.number().int().openapi({ description: "author id", example: 1 }),
    username: z.string().openapi({ description: "author username", example: "janedoe" }),
    displayName: z.string().nullable().openapi({ description: "display name", example: "Jane Doe" }),
    image: z.string().nullable().openapi({ description: "avatar url", example: "https://example.com/avatar.jpg" }),
  }),
});

const sampleProfile = {
  id: "prof_12345678",
  userId: 1,
  username: "janedoe",
  displayName: "Jane Doe",
  bio: "Software engineer and tech blogger.",
  image: "https://example.com/avatar.jpg",
  createdAt: "2026-10-29T10:00:00.000Z",
  updatedAt: "2026-10-29T10:00:00.000Z",
};

const sampleUserSummaryList = [
  sampleProfile,
  {
    id: "prof_87654321",
    userId: 2,
    username: "johnsmith",
    displayName: "John Smith",
    bio: "Frontend specialist and writer.",
    image: "https://example.com/john.jpg",
    createdAt: "2026-10-29T11:00:00.000Z",
  },
];

const sampleAccountDetails = {
  id: 1,
  email: "student@example.com",
  profile: sampleProfile,
  createdAt: "2026-10-29T10:00:00.000Z",
};

const sampleAuthorArticles = [
  {
    id: "art_12345678",
    title: "Building Web APIs with Hono",
    slug: "building-web-apis-with-hono-k892x",
    excerpt: "A beginner friendly guide to Hono.",
    body: "Full article body explaining routing, controllers, and SQLite...",
    createdAt: "2026-10-29T10:00:00.000Z",
    updatedAt: "2026-10-29T10:00:00.000Z",
    author: {
      id: 1,
      username: "janedoe",
      displayName: "Jane Doe",
      image: "https://example.com/avatar.jpg",
    },
  },
];

const listUsersQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional().openapi({
    param: { name: "search", in: "query" },
    description: "search username",
    example: "jane",
  }),
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
    [httpStatusCodes.OK]: jsonContent(
      paginatedResponseSchema(userSummaryItemSchema, "users list", sampleUserSummaryList, {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
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
    [httpStatusCodes.OK]: jsonContent(
      dataResponseSchema(userAccountDetailsSchema, "current user account", sampleAccountDetails),
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
    [httpStatusCodes.OK]: jsonContent(
      dataResponseSchema(publicProfileSchema, "profile updated", sampleProfile),
      "profile updated"
    ),
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
    [httpStatusCodes.OK]: jsonContent(
      createMessageSchema("Account and profile deleted successfully", true),
      "account deleted"
    ),
    ...defaultErrorResponses,
  },
});

export const getUserArticlesRoute = createRoute({
  method: "get",
  path: "/:username/articles",
  tags: ["Users"],
  summary: "get author articles",
  request: {
    params: z.object({
      username: z.string().openapi({
        param: { name: "username", in: "path" },
        description: "author username handle",
        example: "janedoe",
      }),
    }),
    query: paginationQuerySchema,
  },
  responses: {
    [httpStatusCodes.OK]: jsonContent(
      paginatedResponseSchema(authorArticleItemSchema, "author articles", sampleAuthorArticles, {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
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
      username: z.string().openapi({
        param: { name: "username", in: "path" },
        description: "author username handle",
        example: "janedoe",
      }),
    }),
  },
  responses: {
    [httpStatusCodes.OK]: jsonContent(
      dataResponseSchema(publicProfileSchema, "profile found", sampleProfile),
      "profile found"
    ),
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
