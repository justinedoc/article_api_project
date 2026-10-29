import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { ArticleController } from "../controllers/article.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { paginationQuerySchema } from "../utils/pagination.js";
import {
  defaultErrorResponses,
  jsonContent,
  jsonContentRequired,
  messageSchema,
} from "../utils/openapi-helpers.js";

export const articleRouter = new OpenAPIHono();

const createArticleSchema = z.object({
  title: z.string().min(3).openapi({ example: "Getting Started with Node SQLite" }),
  excerpt: z.string().optional().openapi({ example: "A simple introduction to SQLite with Hono." }),
  body: z.string().min(5).openapi({ example: "Here is the full article content explaining how to use SQLite..." }),
});

const updateArticleSchema = z.object({
  title: z.string().min(3).optional(),
  excerpt: z.string().optional(),
  body: z.string().min(5).optional(),
});

const articleItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  body: z.string(),
  createdAt: z.any(),
  updatedAt: z.any(),
  author: z.object({
    id: z.number(),
    email: z.string().optional(),
    username: z.string().nullable(),
    displayName: z.string().nullable(),
    image: z.string().nullable(),
  }),
});

const listArticlesQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional().openapi({
    description: "Search filter by article title",
    example: "SQLite",
  }),
});

const getMyArticlesRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["Articles"],
  summary: "List all articles authored by the current authenticated user",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
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
      "My articles retrieved"
    ),
    ...defaultErrorResponses,
  },
});

const createArticleRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Articles"],
  summary: "Create a new article",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    body: jsonContentRequired(createArticleSchema, "Article creation payload"),
  },
  responses: {
    201: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.any(),
      }),
      "Article created successfully"
    ),
    ...defaultErrorResponses,
  },
});

const listArticlesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Articles"],
  summary: "List articles with offset pagination",
  request: {
    query: listArticlesQuerySchema,
  },
  responses: {
    200: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.array(articleItemSchema),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          totalPages: z.number(),
        }),
      }),
      "Articles retrieved successfully"
    ),
    ...defaultErrorResponses,
  },
});

const getArticleRoute = createRoute({
  method: "get",
  path: "/:id",
  tags: ["Articles"],
  summary: "Get an article by ID or slug",
  request: {
    params: z.object({
      id: z.string().openapi({ example: "getting-started-with-node-sqlite-abc12" }),
    }),
  },
  responses: {
    200: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: articleItemSchema,
      }),
      "Article retrieved successfully"
    ),
    ...defaultErrorResponses,
  },
});

const updateArticleRoute = createRoute({
  method: "patch",
  path: "/:id",
  tags: ["Articles"],
  summary: "Update an article by ID (author only)",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    params: z.object({ id: z.string() }),
    body: jsonContentRequired(updateArticleSchema, "Article update payload"),
  },
  responses: {
    200: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.any(),
      }),
      "Article updated successfully"
    ),
    ...defaultErrorResponses,
  },
});

const deleteArticleRoute = createRoute({
  method: "delete",
  path: "/:id",
  tags: ["Articles"],
  summary: "Delete an article by ID (author only)",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: jsonContent(messageSchema("Article deleted successfully"), "Article deleted"),
    ...defaultErrorResponses,
  },
});

articleRouter.openapi(getMyArticlesRoute, ArticleController.getMyArticles as any);
articleRouter.openapi(createArticleRoute, ArticleController.createArticle as any);
articleRouter.openapi(listArticlesRoute, ArticleController.getArticles as any);
articleRouter.openapi(getArticleRoute, ArticleController.getArticleById as any);
articleRouter.openapi(updateArticleRoute, ArticleController.updateArticle as any);
articleRouter.openapi(deleteArticleRoute, ArticleController.deleteArticle as any);
