import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { CommentController } from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { paginationQuerySchema } from "../utils/pagination.js";
import type { AppBindings } from "../types.js";
import {
  defaultErrorResponses,
  jsonContent,
  jsonContentRequired,
  messageSchema,
} from "../utils/openapi-helpers.js";

const createCommentSchema = z.object({
  body: z.string().min(1).openapi({ example: "This was a really helpful article!" }),
});

const updateCommentSchema = z.object({
  body: z.string().min(1).openapi({ example: "Updated comment text." }),
});

const commentItemSchema = z.object({
  id: z.string(),
  articleId: z.string(),
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

export const createCommentRoute = createRoute({
  method: "post",
  path: "/articles/:articleId/comments",
  tags: ["Comments"],
  summary: "create comment",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    params: z.object({
      articleId: z.string().openapi({ example: "art_123" }),
    }),
    body: jsonContentRequired(createCommentSchema, "comment data"),
  },
  responses: {
    201: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: commentItemSchema,
      }),
      "comment created"
    ),
    ...defaultErrorResponses,
  },
});

export const listCommentsRoute = createRoute({
  method: "get",
  path: "/articles/:articleId/comments",
  tags: ["Comments"],
  summary: "list comments",
  request: {
    params: z.object({
      articleId: z.string(),
    }),
    query: paginationQuerySchema,
  },
  responses: {
    200: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.array(commentItemSchema),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          totalPages: z.number(),
        }),
      }),
      "comments list"
    ),
    ...defaultErrorResponses,
  },
});

export const getCommentByIdRoute = createRoute({
  method: "get",
  path: "/comments/:commentId",
  tags: ["Comments"],
  summary: "get comment",
  request: {
    params: z.object({
      commentId: z.string(),
    }),
  },
  responses: {
    200: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: commentItemSchema,
      }),
      "comment details"
    ),
    ...defaultErrorResponses,
  },
});

export const updateCommentRoute = createRoute({
  method: "patch",
  path: "/comments/:commentId",
  tags: ["Comments"],
  summary: "update comment",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    params: z.object({
      commentId: z.string(),
    }),
    body: jsonContentRequired(updateCommentSchema, "comment update data"),
  },
  responses: {
    200: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.any(),
      }),
      "comment updated"
    ),
    ...defaultErrorResponses,
  },
});

export const deleteCommentRoute = createRoute({
  method: "delete",
  path: "/comments/:commentId",
  tags: ["Comments"],
  summary: "delete comment",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    params: z.object({
      commentId: z.string(),
    }),
  },
  responses: {
    200: jsonContent(messageSchema("Comment deleted successfully"), "comment deleted"),
    ...defaultErrorResponses,
  },
});

export type CreateCommentRoute = typeof createCommentRoute;
export type ListCommentsRoute = typeof listCommentsRoute;
export type GetCommentByIdRoute = typeof getCommentByIdRoute;
export type UpdateCommentRoute = typeof updateCommentRoute;
export type DeleteCommentRoute = typeof deleteCommentRoute;

export const commentRouter = new OpenAPIHono<AppBindings>()
  .openapi(createCommentRoute, CommentController.createComment)
  .openapi(listCommentsRoute, CommentController.getComments)
  .openapi(getCommentByIdRoute, CommentController.getCommentById)
  .openapi(updateCommentRoute, CommentController.updateComment)
  .openapi(deleteCommentRoute, CommentController.deleteComment);
