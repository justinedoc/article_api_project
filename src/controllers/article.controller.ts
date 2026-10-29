import type { Context } from "hono";
import { ArticleService } from "../services/article.service.js";
import type { AuthUser } from "../types.js";

export class ArticleController {
  static async createArticle(c: Context) {
    const user = c.get("user") as AuthUser;
    const body = await c.req.json();
    const result = await ArticleService.createArticle(user.id, body);
    return c.json(
      {
        success: true,
        message: "Article created successfully",
        data: result,
      },
      201
    );
  }

  static async getArticles(c: Context) {
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;
    const search = c.req.query("search");

    const result = await ArticleService.getArticles({ page, limit, search });
    return c.json(
      {
        success: true,
        message: "Articles retrieved successfully",
        ...result,
      },
      200
    );
  }

  static async getMyArticles(c: Context) {
    const user = c.get("user") as AuthUser;
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;

    const result = await ArticleService.getMyArticles(user.id, { page, limit });
    return c.json(
      {
        success: true,
        message: "My articles retrieved successfully",
        ...result,
      },
      200
    );
  }

  static async getArticleById(c: Context) {
    const id = c.req.param("id")!;
    const result = await ArticleService.getArticleById(id);
    return c.json(
      {
        success: true,
        message: "Article retrieved successfully",
        data: result,
      },
      200
    );
  }

  static async updateArticle(c: Context) {
    const id = c.req.param("id")!;
    const user = c.get("user") as AuthUser;
    const body = await c.req.json();

    const result = await ArticleService.updateArticle(id, user.id, body);
    return c.json(
      {
        success: true,
        message: "Article updated successfully",
        data: result,
      },
      200
    );
  }

  static async deleteArticle(c: Context) {
    const id = c.req.param("id")!;
    const user = c.get("user") as AuthUser;

    const result = await ArticleService.deleteArticle(id, user.id);
    return c.json(
      {
        success: true,
        message: result.message,
      },
      200
    );
  }
}
