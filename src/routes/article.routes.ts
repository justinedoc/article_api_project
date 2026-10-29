import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { ArticleController } from "../controllers/article.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { paginationQuerySchema } from "../utils/pagination.js";
import type { AppBindings } from "../types.js";
import {
  defaultErrorResponses,
  jsonContent,
  jsonContentRequired,
  messageSchema,
} from "../utils/openapi-helpers.js";

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
    description: "search title",
    example: "SQLite",
  }),
});

export const getMyArticlesRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["Articles"],
  summary: "get my articles",
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
      "my articles"
    ),
    ...defaultErrorResponses,
  },
});

export const createArticleRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Articles"],
  summary: "create article",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    body: jsonContentRequired(createArticleSchema, "article data"),
  },
  responses: {
    201: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.any(),
      }),
      "article created"
    ),
    ...defaultErrorResponses,
  },
});

export const listArticlesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Articles"],
  summary: "list articles",
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
      "articles list"
    ),
    ...defaultErrorResponses,
  },
});

export const getArticleRoute = createRoute({
  method: "get",
  path: "/:id",
  tags: ["Articles"],
  summary: "get article",
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
      "article details"
    ),
    ...defaultErrorResponses,
  },
});

export const updateArticleRoute = createRoute({
  method: "patch",
  path: "/:id",
  tags: ["Articles"],
  summary: "update article",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    params: z.object({ id: z.string() }),
    body: jsonContentRequired(updateArticleSchema, "article update data"),
  },
  responses: {
    200: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.any(),
      }),
      "article updated"
    ),
    ...defaultErrorResponses,
  },
});

export const deleteArticleRoute = createRoute({
  method: "delete",
  path: "/:id",
  tags: ["Articles"],
  summary: "delete article",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: jsonContent(messageSchema("Article deleted successfully"), "article deleted"),
    ...defaultErrorResponses,
  },
});

export type GetMyArticlesRoute = typeof getMyArticlesRoute;
export type CreateArticleRoute = typeof createArticleRoute;
export type ListArticlesRoute = typeof listArticlesRoute;
export type GetArticleRoute = typeof getArticleRoute;
export type UpdateArticleRoute = typeof updateArticleRoute;
export type DeleteArticleRoute = typeof deleteArticleRoute;

export const articleRouter = new OpenAPIHono<AppBindings>()
  .openapi(getMyArticlesRoute, ArticleController.getMyArticles)
  .openapi(createArticleRoute, ArticleController.createArticle)
  .openapi(listArticlesRoute, ArticleController.getArticles)
  .openapi(getArticleRoute, ArticleController.getArticleById)
  .openapi(updateArticleRoute, ArticleController.updateArticle)
  .openapi(deleteArticleRoute, ArticleController.deleteArticle);
