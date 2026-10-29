import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { CommentController } from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { paginationQuerySchema } from "../utils/pagination.js";
import {
  defaultErrorResponses,
  jsonContent,
  jsonContentRequired,
  messageSchema,
} from "../utils/openapi-helpers.js";

export const commentRouter = new OpenAPIHono();

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

const createCommentRoute = createRoute({
  method: "post",
  path: "/articles/:articleId/comments",
  tags: ["Comments"],
  summary: "Add a comment to an article",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    params: z.object({
      articleId: z.string().openapi({ example: "art_123" }),
    }),
    body: jsonContentRequired(createCommentSchema, "Comment payload"),
  },
  responses: {
    201: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: commentItemSchema,
      }),
      "Comment created successfully"
    ),
    ...defaultErrorResponses,
  },
});

const listCommentsRoute = createRoute({
  method: "get",
  path: "/articles/:articleId/comments",
  tags: ["Comments"],
  summary: "List comments for an article with offset pagination",
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
      "Comments retrieved successfully"
    ),
    ...defaultErrorResponses,
  },
});

const getCommentByIdRoute = createRoute({
  method: "get",
  path: "/comments/:commentId",
  tags: ["Comments"],
  summary: "Get a single comment by ID",
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
      "Comment retrieved"
    ),
    ...defaultErrorResponses,
  },
});

const updateCommentRoute = createRoute({
  method: "patch",
  path: "/comments/:commentId",
  tags: ["Comments"],
  summary: "Update a comment by ID (author only)",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    params: z.object({
      commentId: z.string(),
    }),
    body: jsonContentRequired(updateCommentSchema, "Updated comment payload"),
  },
  responses: {
    200: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.any(),
      }),
      "Comment updated successfully"
    ),
    ...defaultErrorResponses,
  },
});

const deleteCommentRoute = createRoute({
  method: "delete",
  path: "/comments/:commentId",
  tags: ["Comments"],
  summary: "Delete a comment by ID (author only)",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    params: z.object({
      commentId: z.string(),
    }),
  },
  responses: {
    200: jsonContent(messageSchema("Comment deleted successfully"), "Comment deleted"),
    ...defaultErrorResponses,
  },
});

commentRouter.openapi(createCommentRoute, CommentController.createComment as any);
commentRouter.openapi(listCommentsRoute, CommentController.getComments as any);
commentRouter.openapi(getCommentByIdRoute, CommentController.getCommentById as any);
commentRouter.openapi(updateCommentRoute, CommentController.updateComment as any);
commentRouter.openapi(deleteCommentRoute, CommentController.deleteComment as any);
