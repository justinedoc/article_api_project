import type { Context } from "hono";
import { CommentService } from "../services/comment.service.js";
import type { AuthUser } from "../types.js";

export class CommentController {
  static async createComment(c: Context) {
    const articleId = c.req.param("articleId")!;
    const user = c.get("user") as AuthUser;
    const body = await c.req.json();

    const result = await CommentService.createComment(articleId, user.id, body.body);
    return c.json(
      {
        success: true,
        message: "Comment added successfully",
        data: result,
      },
      201
    );
  }

  static async getComments(c: Context) {
    const articleId = c.req.param("articleId")!;
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;

    const result = await CommentService.getCommentsByArticle(articleId, { page, limit });
    return c.json(
      {
        success: true,
        message: "Comments retrieved successfully",
        ...result,
      },
      200
    );
  }

  static async getCommentById(c: Context) {
    const commentId = c.req.param("commentId")!;
    const result = await CommentService.getCommentById(commentId);
    return c.json(
      {
        success: true,
        message: "Comment retrieved successfully",
        data: result,
      },
      200
    );
  }

  static async updateComment(c: Context) {
    const commentId = c.req.param("commentId")!;
    const user = c.get("user") as AuthUser;
    const body = await c.req.json();

    const result = await CommentService.updateComment(commentId, user.id, body.body);
    return c.json(
      {
        success: true,
        message: "Comment updated successfully",
        data: result,
      },
      200
    );
  }

  static async deleteComment(c: Context) {
    const commentId = c.req.param("commentId")!;
    const user = c.get("user") as AuthUser;

    const result = await CommentService.deleteComment(commentId, user.id);
    return c.json(
      {
        success: true,
        message: result.message,
      },
      200
    );
  }
}
